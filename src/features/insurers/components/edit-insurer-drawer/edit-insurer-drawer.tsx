import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";
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

import { useInsurer } from "../../hooks/use-insurer";
import { useUpdateInsurer } from "../../hooks/use-update-insurer";
import type { Insurer } from "../../types/insurer";
import {
  editInsurerSchema,
  type EditInsurerFormValues,
} from "../../validations/edit-insurer-schema";

function sanitize(value: string | undefined) {
  return value === "" || value === undefined ? null : value;
}

function sanitizeNum(value: string | undefined) {
  return value === "" || value === undefined || Number.isNaN(Number(value)) ? null : Number(value);
}

// Formulário próprio, montado só quando `insurer` já existe — os valores
// atuais viram `defaultValues` do useForm diretamente, seguindo o mesmo
// padrão do edit-brokerage-drawer/edit-user-drawer.
function EditInsurerForm({ insurer, onSuccess }: { insurer: Insurer; onSuccess: () => void }) {
  const updateInsurer = useUpdateInsurer();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditInsurerFormValues>({
    resolver: zodResolver(editInsurerSchema),
    defaultValues: {
      name: insurer.name,
      cnpj: insurer.cnpj ?? "",
      email: insurer.email ?? "",
      phone: insurer.phone ?? "",
      website: insurer.website ?? "",
      contact_name: insurer.contact_name ?? "",
      response_time_days: insurer.response_time_days?.toString() ?? "",
      display_order: insurer.display_order?.toString() ?? "",
      notes: insurer.notes ?? "",
    },
  });

  function onSubmit(values: EditInsurerFormValues) {
    updateInsurer.mutate(
      {
        id: insurer.id,
        name: values.name,
        cnpj: sanitize(values.cnpj),
        email: sanitize(values.email),
        phone: sanitize(values.phone),
        website: sanitize(values.website),
        contact_name: sanitize(values.contact_name),
        response_time_days: sanitizeNum(values.response_time_days),
        display_order: sanitizeNum(values.display_order),
        notes: sanitize(values.notes),
      },
      {
        onSuccess: () => {
          toast.success("Seguradora atualizada com sucesso");
          onSuccess();
        },
        onError: (error) => {
          toast.error(error.message || "Não foi possível atualizar a seguradora");
        },
      },
    );
  }

  return (
    <>
      <form
        id="edit-insurer-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-1 flex-col gap-4 overflow-y-auto bg-muted p-5"
      >
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Identificação
          </p>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input id="cnpj" placeholder="00.000.000/0000-00" {...register("cnpj")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">Telefone Comercial</Label>
            <Input id="phone" placeholder="(00) 00000-0000" {...register("phone")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="website">Website</Label>
            <Input id="website" placeholder="https://" {...register("website")} />
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Contato comercial
          </p>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="contact_name">Nome do contato</Label>
            <Input id="contact_name" {...register("contact_name")} />
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Configurações
          </p>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="response_time_days">Prazo de resposta (dias)</Label>
            <Input
              id="response_time_days"
              type="number"
              min={0}
              {...register("response_time_days")}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="display_order">Ordem de exibição</Label>
            <Input id="display_order" type="number" min={0} {...register("display_order")} />
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
        <Button type="submit" form="edit-insurer-form" disabled={updateInsurer.isPending}>
          {updateInsurer.isPending ? "Salvando..." : "Salvar"}
        </Button>
      </SheetFooter>
    </>
  );
}

export function EditInsurerDrawer() {
  const navigate = useNavigate();
  const { insurerId } = useParams<{ insurerId: string }>();
  const { data: insurer, isLoading, isError, refetch } = useInsurer(insurerId!);

  function handleClose() {
    navigate("/admin/insurers");
  }

  return (
    <Sheet open onOpenChange={(open) => !open && handleClose()}>
      <SheetContent className="flex w-full flex-col sm:max-w-[720px]">
        <SheetHeader>
          <SheetTitle>Editar seguradora</SheetTitle>
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
                  Não foi possível carregar os dados da seguradora.
                </p>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  Tentar novamente
                </Button>
              </div>
            )}
          </div>
        )}

        {!isLoading && !isError && insurer && (
          <EditInsurerForm insurer={insurer} onSuccess={handleClose} />
        )}
      </SheetContent>
    </Sheet>
  );
}
