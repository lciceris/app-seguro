import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
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
import { Textarea } from "@/shared/components/ui/textarea";

import { useCreateInsurer } from "../../hooks/use-create-insurer";
import type { CreateInsurerInput } from "../../api/create-insurer";
import {
  createInsurerSchema,
  type CreateInsurerFormValues,
} from "../../validations/create-insurer-schema";

function sanitize(value: string | undefined) {
  return value === "" || value === undefined ? null : value;
}

function sanitizeNum(value: string | undefined) {
  return value === "" || value === undefined || Number.isNaN(Number(value)) ? null : Number(value);
}

function paraPayload(values: CreateInsurerFormValues): CreateInsurerInput {
  return {
    name: values.name,
    cnpj: sanitize(values.cnpj),
    email: sanitize(values.email),
    phone: sanitize(values.phone),
    website: sanitize(values.website),
    contact_name: sanitize(values.contact_name),
    response_time_days: sanitizeNum(values.response_time_days),
    display_order: sanitizeNum(values.display_order),
    notes: sanitize(values.notes),
  };
}

export function CreateInsurerDrawer() {
  const navigate = useNavigate();
  const createInsurer = useCreateInsurer();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateInsurerFormValues>({
    resolver: zodResolver(createInsurerSchema),
  });

  function handleClose() {
    navigate("/admin/insurers");
  }

  function onSubmit(values: CreateInsurerFormValues) {
    createInsurer.mutate(paraPayload(values), {
      onSuccess: () => {
        toast.success("Seguradora criada com sucesso");
        handleClose();
      },
      onError: (error) => {
        toast.error(error.message || "Não foi possível criar a seguradora");
      },
    });
  }

  return (
    <Sheet open onOpenChange={(open) => !open && handleClose()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Nova seguradora</SheetTitle>
        </SheetHeader>

        <form
          id="create-insurer-form"
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
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
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
            </div>

            <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
              <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Contato comercial
              </p>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="contact_name">Nome do contato</Label>
                <Input id="contact_name" {...register("contact_name")} />
              </div>
            </div>

            <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
              <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Configurações
              </p>

              <div className="grid grid-cols-2 gap-3">
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
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" form="create-insurer-form" disabled={createInsurer.isPending}>
            {createInsurer.isPending ? "Criando..." : "Criar"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
