import { zodResolver } from "@hookform/resolvers/zod";
import { Star } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useAuthStore } from "@/features/auth";
import { useUsers } from "@/features/users";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { DatePicker } from "@/shared/components/ui/date-picker";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
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

function paraPayload(values: CreateClientFormValues): Omit<CreateClientInput, "brokerage_id"> {
  return {
    client_type: values.client_type,
    legal_name: values.legal_name,
    trade_name: sanitize(values.trade_name),
    tax_id: sanitize(values.tax_id),
    birth_date: values.birth_date ? values.birth_date.toISOString().slice(0, 10) : null,
    business_code: sanitize(values.business_code),
    industry: sanitize(values.industry),
    state_registration: sanitize(values.state_registration),
    zip_code: sanitize(values.zip_code),
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
    segment: values.segment,
    lead_source: sanitize(values.lead_source),
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

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateClientFormValues>({
    resolver: zodResolver(createClientSchema),
    defaultValues: { client_type: "company", segment: "lead", birth_date: null },
  });

  function handleClose() {
    navigate("/clients");
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
          className="flex flex-1 flex-col gap-4 overflow-y-auto p-5"
        >
          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Identificação
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 flex flex-col gap-1.5">
                <Label htmlFor="client_type">Tipo</Label>
                <Controller
                  name="client_type"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="client_type" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">Pessoa física</SelectItem>
                        <SelectItem value="company">Pessoa jurídica</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="col-span-2 flex flex-col gap-1.5">
                <Label htmlFor="legal_name">Razão social / Nome completo</Label>
                <Input id="legal_name" {...register("legal_name")} />
                {errors.legal_name && (
                  <p className="text-sm text-destructive">{errors.legal_name.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="trade_name">Nome fantasia</Label>
                <Input id="trade_name" {...register("trade_name")} />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="tax_id">CPF/CNPJ</Label>
                <Input id="tax_id" {...register("tax_id")} />
              </div>

              <div className="col-span-2 flex flex-col gap-1.5">
                <Label htmlFor="birth_date">Data de nascimento (PF)</Label>
                <Controller
                  name="birth_date"
                  control={control}
                  render={({ field }) => (
                    <DatePicker id="birth_date" value={field.value} onChange={field.onChange} />
                  )}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="business_code">CNAE (PJ)</Label>
                <Input id="business_code" {...register("business_code")} />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="industry">Setor (PJ)</Label>
                <Input id="industry" {...register("industry")} />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="state_registration">Inscrição estadual (PJ)</Label>
                <Input id="state_registration" {...register("state_registration")} />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Endereço
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="zip_code">CEP</Label>
                <Input id="zip_code" {...register("zip_code")} />
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

          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
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

          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
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

          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Configurações
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 flex flex-col gap-1.5">
                <Label htmlFor="segment">Segmento</Label>
                <Controller
                  name="segment"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="segment" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lead">Lead</SelectItem>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="vip">VIP</SelectItem>
                        <SelectItem value="inactive">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="lead_source">Origem do lead</Label>
                <Input id="lead_source" {...register("lead_source")} />
              </div>
            </div>
          </div>

          {!isSeller && (
            <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
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
                              ? "h-4 w-4 fill-amber-400 text-amber-400"
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

          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Observações
            </p>

            <Textarea id="notes" rows={4} {...register("notes")} />
          </div>
        </form>

        <SheetFooter className="flex-row justify-end border-t border-border bg-card">
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
