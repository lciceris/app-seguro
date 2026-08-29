import { zodResolver } from "@hookform/resolvers/zod";
import { Star } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useAuthStore } from "@/features/auth";
import { useUsers } from "@/features/users";
import { fetchCepData } from "@/shared/lib/via-cep";
import { fetchCnpjData } from "@/shared/lib/brasil-api";
import { formatCep, formatCnpj, formatCpf } from "@/shared/lib/masks";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { DatePicker } from "@/shared/components/ui/date-picker";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";
import { Textarea } from "@/shared/components/ui/textarea";

import { useAddClientSeller } from "../../hooks/use-add-client-seller";
import { useCreateClient } from "../../hooks/use-create-client";
import type { CreateClientInput } from "../../api/create-client";
import {
  createClientSchema,
  type CreateClientFormValues,
} from "../../validations/create-client-schema";

function sanitize(value: string | undefined) {
  return value === "" || value === undefined ? null : value;
}

function digitsOnly(value: string | undefined) {
  const digits = value?.replace(/\D/g, "") ?? "";
  return digits === "" ? null : digits;
}

function paraPayload(values: CreateClientFormValues): Omit<CreateClientInput, "brokerage_id"> {
  return {
    client_type: values.client_type,
    legal_name: values.legal_name,
    trade_name: sanitize(values.trade_name),
    tax_id: digitsOnly(values.tax_id),
    birth_date: values.birth_date ? values.birth_date.toISOString().slice(0, 10) : null,
    business_code: sanitize(values.business_code),
    industry: sanitize(values.industry),
    state_registration: sanitize(values.state_registration),
    zip_code: digitsOnly(values.zip_code),
    street: sanitize(values.street),
    street_number: sanitize(values.street_number),
    complement: sanitize(values.complement),
    neighborhood: sanitize(values.neighborhood),
    city: sanitize(values.city),
    state: sanitize(values.state),
    contact_name: sanitize(values.contact_name),
    contact_role: sanitize(values.contact_role),
    contact_email: sanitize(values.contact_email),
    contact_phone: sanitize(values.contact_phone),
    financial_name: sanitize(values.financial_name),
    financial_email: sanitize(values.financial_email),
    notes: sanitize(values.notes),
  };
}

interface SelectedSeller {
  sellerId: string;
  isPrimary: boolean;
}

export function CreateClientDrawer() {
  const navigate = useNavigate();
  const usuario = useAuthStore((state) => state.usuario);
  const isSeller = usuario?.role === "seller";

  const createClient = useCreateClient();
  const addClientSeller = useAddClientSeller();
  const { data: users } = useUsers();
  const sellers = users?.filter((user) => user.role === "seller") ?? [];

  const [selectedSellers, setSelectedSellers] = useState<SelectedSeller[]>([]);
  const [isFetchingCnpj, setIsFetchingCnpj] = useState(false);
  const [isFetchingCep, setIsFetchingCep] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<CreateClientFormValues>({
    resolver: zodResolver(createClientSchema),
    defaultValues: { client_type: "company", birth_date: null },
  });

  const clientType = watch("client_type");

  function handleClose() {
    navigate("/clients");
  }

  async function handleFetchCnpj() {
    const cnpj = getValues("tax_id");
    if (!cnpj) return;
    setIsFetchingCnpj(true);
    try {
      const data = await fetchCnpjData(cnpj);
      setValue("legal_name", data.name);
      setValue("trade_name", data.trade_name ?? "");
      setValue("business_code", data.business_code ?? "");
      setValue("contact_email", data.email ?? "");
      setValue("contact_phone", data.phone ?? "");
      setValue("zip_code", data.zip_code ? formatCep(data.zip_code) : "");
      setValue("street", data.street ?? "");
      setValue("street_number", data.street_number ?? "");
      setValue("complement", data.complement ?? "");
      setValue("neighborhood", data.neighborhood ?? "");
      setValue("city", data.city ?? "");
      setValue("state", data.state ?? "");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível buscar o CNPJ");
    } finally {
      setIsFetchingCnpj(false);
    }
  }

  async function handleFetchCep() {
    const cep = getValues("zip_code");
    if (!cep) return;
    setIsFetchingCep(true);
    try {
      const data = await fetchCepData(cep);
      setValue("street", data.street ?? "");
      setValue("neighborhood", data.neighborhood ?? "");
      setValue("city", data.city ?? "");
      setValue("state", data.state ?? "");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível buscar o CEP");
    } finally {
      setIsFetchingCep(false);
    }
  }

  function toggleSeller(sellerId: string) {
    setSelectedSellers((current) => {
      const exists = current.some((s) => s.sellerId === sellerId);
      if (exists) {
        const remaining = current.filter((s) => s.sellerId !== sellerId);
        const wasPrimary = current.find((s) => s.sellerId === sellerId)?.isPrimary;
        if (wasPrimary && remaining.length > 0) {
          remaining[0] = { ...remaining[0], isPrimary: true };
        }
        return remaining;
      }
      return [...current, { sellerId, isPrimary: current.length === 0 }];
    });
  }

  function setPrimarySeller(sellerId: string) {
    setSelectedSellers((current) =>
      current.map((s) => ({ ...s, isPrimary: s.sellerId === sellerId })),
    );
  }

  function onSubmit(values: CreateClientFormValues) {
    createClient.mutate(paraPayload(values), {
      onSuccess: async (client) => {
        try {
          await Promise.all(
            selectedSellers.map((seller) =>
              addClientSeller.mutateAsync({
                clientId: client.id,
                sellerId: seller.sellerId,
                isPrimary: seller.isPrimary,
              }),
            ),
          );
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Cliente criado, mas não foi possível vincular todos os vendedores.",
          );
          handleClose();
          return;
        }
        toast.success("Cliente criado com sucesso");
        handleClose();
      },
      onError: (error) => {
        toast.error(error.message || "Não foi possível criar o cliente");
      },
    });
  }

  return (
    <Sheet open onOpenChange={(open) => !open && handleClose()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Novo cliente</SheetTitle>
        </SheetHeader>

        <form
          id="create-client-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 min-h-0 overflow-y-auto bg-background"
        >
          <div className="mx-auto flex w-full max-w-[720px] flex-col gap-4 p-5">
            <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
              <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Identificação
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 flex flex-col gap-1.5">
                  <Label>Tipo *</Label>
                  <Controller
                    name="client_type"
                    control={control}
                    render={({ field }) => (
                      <div className="inline-flex rounded-lg border border-border bg-muted p-1">
                        <Button
                          type="button"
                          variant={field.value === "individual" ? "default" : "ghost"}
                          className="flex-1"
                          onClick={() => field.onChange("individual")}
                        >
                          Pessoa física
                        </Button>
                        <Button
                          type="button"
                          variant={field.value === "company" ? "default" : "ghost"}
                          className="flex-1"
                          onClick={() => field.onChange("company")}
                        >
                          Pessoa jurídica
                        </Button>
                      </div>
                    )}
                  />
                </div>

                <div className="col-span-2 flex flex-col gap-1.5">
                  <Label htmlFor="tax_id">{clientType === "company" ? "CNPJ" : "CPF"}</Label>
                  <div className="flex gap-2">
                    <Input
                      id="tax_id"
                      placeholder={
                        clientType === "company" ? "00.000.000/0000-00" : "000.000.000-00"
                      }
                      maxLength={clientType === "company" ? 18 : 14}
                      {...register("tax_id")}
                      onChange={(e) =>
                        setValue(
                          "tax_id",
                          clientType === "company"
                            ? formatCnpj(e.target.value)
                            : formatCpf(e.target.value),
                        )
                      }
                    />
                    {clientType === "company" && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleFetchCnpj}
                        disabled={isFetchingCnpj}
                      >
                        {isFetchingCnpj ? "Buscando..." : "Buscar"}
                      </Button>
                    )}
                  </div>
                </div>

                <div className="col-span-2 flex flex-col gap-1.5">
                  <Label htmlFor="legal_name">
                    {clientType === "company" ? "Razão social *" : "Nome completo *"}
                  </Label>
                  <Input id="legal_name" {...register("legal_name")} />
                  {errors.legal_name && (
                    <p className="text-sm text-destructive">{errors.legal_name.message}</p>
                  )}
                </div>

                {clientType === "company" && (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="trade_name">Nome fantasia</Label>
                    <Input id="trade_name" {...register("trade_name")} />
                  </div>
                )}

                {clientType === "individual" && (
                  <div className="col-span-2 flex flex-col gap-1.5">
                    <Label htmlFor="birth_date">Data de nascimento</Label>
                    <Controller
                      name="birth_date"
                      control={control}
                      render={({ field }) => (
                        <DatePicker id="birth_date" value={field.value} onChange={field.onChange} />
                      )}
                    />
                  </div>
                )}

                {clientType === "company" && (
                  <>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="business_code">CNAE</Label>
                      <Input id="business_code" {...register("business_code")} />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="industry">Setor</Label>
                      <Input id="industry" {...register("industry")} />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="state_registration">Inscrição estadual</Label>
                      <Input id="state_registration" {...register("state_registration")} />
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
              <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Endereço
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 flex max-w-[280px] flex-col gap-1.5">
                  <Label htmlFor="zip_code">CEP</Label>
                  <div className="flex gap-2">
                    <Input
                      id="zip_code"
                      placeholder="00000-000"
                      maxLength={9}
                      {...register("zip_code")}
                      onChange={(e) => setValue("zip_code", formatCep(e.target.value))}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleFetchCep}
                      disabled={isFetchingCep}
                    >
                      {isFetchingCep ? "Buscando..." : "Buscar"}
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="street_number">Número</Label>
                  <Input id="street_number" {...register("street_number")} />
                </div>

                <div className="col-span-2 flex flex-col gap-1.5">
                  <Label htmlFor="street">Logradouro</Label>
                  <Input id="street" {...register("street")} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="complement">Complemento</Label>
                  <Input id="complement" {...register("complement")} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input id="neighborhood" {...register("neighborhood")} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="city">Cidade</Label>
                  <Input id="city" {...register("city")} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="state">UF</Label>
                  <Input id="state" maxLength={2} {...register("state")} />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
              <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Contato comercial
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="contact_name">Nome do contato</Label>
                  <Input id="contact_name" {...register("contact_name")} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="contact_role">Cargo</Label>
                  <Input id="contact_role" {...register("contact_role")} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="contact_email">E-mail</Label>
                  <Input id="contact_email" type="email" {...register("contact_email")} />
                  {errors.contact_email && (
                    <p className="text-sm text-destructive">{errors.contact_email.message}</p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="contact_phone">Telefone</Label>
                  <Input id="contact_phone" {...register("contact_phone")} />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
              <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Contato financeiro
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="financial_name">Nome do contato</Label>
                  <Input id="financial_name" {...register("financial_name")} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="financial_email">E-mail</Label>
                  <Input id="financial_email" type="email" {...register("financial_email")} />
                  {errors.financial_email && (
                    <p className="text-sm text-destructive">{errors.financial_email.message}</p>
                  )}
                </div>
              </div>
            </div>

            {!isSeller && (
              <div className="flex flex-col gap-3 rounded-xl border border-border bg-card shadow-sm p-5">
                <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Vendedores responsáveis
                </p>

                {sellers.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Nenhum vendedor cadastrado na corretora ainda.
                  </p>
                )}

                {sellers.map((seller) => {
                  const selected = selectedSellers.find((s) => s.sellerId === seller.id);
                  return (
                    <div key={seller.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`seller-${seller.id}`}
                        checked={!!selected}
                        onCheckedChange={() => toggleSeller(seller.id)}
                      />
                      <Label htmlFor={`seller-${seller.id}`} className="flex-1 font-normal">
                        {seller.full_name}
                      </Label>
                      {selected && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setPrimarySeller(seller.id)}
                          title={selected.isPrimary ? "Vendedor principal" : "Tornar principal"}
                        >
                          <Star
                            className={
                              selected.isPrimary
                                ? "h-4 w-4 fill-warning text-warning"
                                : "h-4 w-4 text-muted-foreground"
                            }
                          />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
              <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Observações
              </p>

              <Textarea id="notes" rows={4} {...register("notes")} />
            </div>
          </div>
        </form>

        <SheetFooter className="flex-row justify-end">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" form="create-client-form" disabled={createClient.isPending}>
            {createClient.isPending ? "Criando..." : "Criar"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
