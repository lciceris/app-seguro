import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";
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
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Textarea } from "@/shared/components/ui/textarea";

import { useClient } from "../../hooks/use-client";
import { useUpdateClient } from "../../hooks/use-update-client";
import type { Client } from "../../types/client";
import { editClientSchema, type EditClientFormValues } from "../../validations/edit-client-schema";

function sanitize(value: string | undefined) {
  return value === "" || value === undefined ? null : value;
}

// Formulário próprio, montado só quando `client` já existe — os valores
// atuais viram `defaultValues` do useForm diretamente, mesmo padrão de
// edit-brokerage-drawer/edit-user-drawer/edit-insurer-drawer (Select
// controlado + reset() pós-mount não é confiável).
function EditClientForm({ client, onSuccess }: { client: Client; onSuccess: () => void }) {
  const updateClient = useUpdateClient();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<EditClientFormValues>({
    resolver: zodResolver(editClientSchema),
    defaultValues: {
      client_type: client.client_type,
      legal_name: client.legal_name,
      trade_name: client.trade_name ?? "",
      tax_id: client.tax_id ?? "",
      birth_date: client.birth_date ? new Date(`${client.birth_date}T00:00:00`) : null,
      business_code: client.business_code ?? "",
      industry: client.industry ?? "",
      state_registration: client.state_registration ?? "",
      zip_code: client.zip_code ?? "",
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
      segment: client.segment,
      lead_source: client.lead_source ?? "",
      notes: client.notes ?? "",
    },
  });

  function onSubmit(values: EditClientFormValues) {
    updateClient.mutate(
      {
        id: client.id,
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
        className="flex flex-1 flex-col gap-4 overflow-y-auto bg-muted p-5"
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

        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Observações
          </p>

          <Textarea id="notes" rows={4} {...register("notes")} />
        </div>
      </form>

      <SheetFooter className="flex-row justify-end border-t border-border bg-card">
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
    navigate("/clients");
  }

  return (
    <Sheet open onOpenChange={(open) => !open && handleClose()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Editar cliente</SheetTitle>
        </SheetHeader>

        {(isLoading || isError) && (
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto bg-muted p-5">
            {isLoading && (
              <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            )}

            {isError && !isLoading && (
              <div className="rounded-xl border border-border bg-card p-5 text-center">
                <p className="mb-2 text-sm text-muted-foreground">
                  Não foi possível carregar os dados do cliente.
                </p>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  Tentar novamente
                </Button>
              </div>
            )}
          </div>
        )}

        {!isLoading && !isError && client && (
          <EditClientForm client={client} onSuccess={handleClose} />
        )}
      </SheetContent>
    </Sheet>
  );
}
