import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { fetchCepData } from "@/shared/lib/via-cep";
import { fetchCnpjData } from "@/shared/lib/brasil-api";
import { formatCep, formatCnpj, formatCpf } from "@/shared/lib/masks";
import { Button } from "@/shared/components/ui/button";
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
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Textarea } from "@/shared/components/ui/textarea";

import { useClient } from "../../hooks/use-client";
import { useUpdateClient } from "../../hooks/use-update-client";
import type { Client } from "../../types/client";
import { editClientSchema, type EditClientFormValues } from "../../validations/edit-client-schema";

function sanitize(value: string | undefined) {
  return value === "" || value === undefined ? null : value;
}

function digitsOnly(value: string | undefined) {
  const digits = value?.replace(/\D/g, "") ?? "";
  return digits === "" ? null : digits;
}

// Formulário próprio, montado só quando `client` já existe — os valores
// atuais viram `defaultValues` do useForm diretamente, mesmo padrão de
// edit-brokerage-drawer/edit-user-drawer/edit-insurer-drawer (Select
// controlado + reset() pós-mount não é confiável).
function EditClientForm({ client, onSuccess }: { client: Client; onSuccess: () => void }) {
  const updateClient = useUpdateClient();
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
  } = useForm<EditClientFormValues>({
    resolver: zodResolver(editClientSchema),
    defaultValues: {
      client_type: client.client_type,
      legal_name: client.legal_name,
      trade_name: client.trade_name ?? "",
      tax_id: client.tax_id
        ? client.client_type === "company"
          ? formatCnpj(client.tax_id)
          : formatCpf(client.tax_id)
        : "",
      birth_date: client.birth_date ? new Date(`${client.birth_date}T00:00:00`) : null,
      business_code: client.business_code ?? "",
      industry: client.industry ?? "",
      state_registration: client.state_registration ?? "",
      zip_code: client.zip_code ? formatCep(client.zip_code) : "",
      street: client.street ?? "",
      street_number: client.street_number ?? "",
      complement: client.complement ?? "",
      neighborhood: client.neighborhood ?? "",
      city: client.city ?? "",
      state: client.state ?? "",
      contact_name: client.contact_name ?? "",
      contact_role: client.contact_role ?? "",
      contact_email: client.contact_email ?? "",
      contact_phone: client.contact_phone ?? "",
      financial_name: client.financial_name ?? "",
      financial_email: client.financial_email ?? "",
      notes: client.notes ?? "",
    },
  });

  const clientType = watch("client_type");

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

  function onSubmit(values: EditClientFormValues) {
    updateClient.mutate(
      {
        id: client.id,
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
      },
      {
        onSuccess: () => {
          toast.success("Cliente atualizado com sucesso");
          onSuccess();
        },
        onError: (error) => {
          toast.error(error.message || "Não foi possível atualizar o cliente");
        },
      },
    );
  }

  return (
    <>
      <form
        id="edit-client-form"
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
                    placeholder={clientType === "company" ? "00.000.000/0000-00" : "000.000.000-00"}
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

          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Observações
            </p>

            <Textarea id="notes" rows={4} {...register("notes")} />
          </div>
        </div>
      </form>

      <SheetFooter className="flex-row justify-end">
        <Button variant="outline" onClick={onSuccess}>
          Cancelar
        </Button>
        <Button type="submit" form="edit-client-form" disabled={updateClient.isPending}>
          {updateClient.isPending ? "Salvando..." : "Salvar"}
        </Button>
      </SheetFooter>
    </>
  );
}

export function EditClientDrawer() {
  const navigate = useNavigate();
  const { clientId } = useParams<{ clientId: string }>();
  const { data: client, isLoading, isError, refetch } = useClient(clientId!);

  function handleClose() {
    navigate(`/clients/${clientId}`);
  }

  return (
    <Sheet open onOpenChange={(open) => !open && handleClose()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Editar cliente</SheetTitle>
        </SheetHeader>

        {(isLoading || isError) && (
          <div className="flex-1 min-h-0 overflow-y-auto bg-background">
            <div className="mx-auto flex w-full max-w-[720px] flex-col gap-4 p-5">
              {isLoading && (
                <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              )}

              {isError && !isLoading && (
                <div className="rounded-xl border border-border bg-card shadow-sm p-5 text-center">
                  <p className="mb-2 text-sm text-muted-foreground">
                    Não foi possível carregar os dados do cliente.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => refetch()}>
                    Tentar novamente
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {!isLoading && !isError && client && (
          <EditClientForm client={client} onSuccess={handleClose} />
        )}
      </SheetContent>
    </Sheet>
  );
}
