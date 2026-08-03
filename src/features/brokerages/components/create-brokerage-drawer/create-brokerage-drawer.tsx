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

import { useCreateBrokerage } from "../../hooks/use-create-brokerage";
import {
  createBrokerageSchema,
  type CreateBrokerageFormValues,
} from "../../validations/create-brokerage-schema";

export function CreateBrokerageDrawer() {
  const navigate = useNavigate();
  const createBrokerage = useCreateBrokerage();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateBrokerageFormValues>({
    resolver: zodResolver(createBrokerageSchema),
  });

  function handleClose() {
    navigate("/brokerages");
  }

  function onSubmit(values: CreateBrokerageFormValues) {
    createBrokerage.mutate(values, {
      onSuccess: () => {
        toast.success("Corretora criada com sucesso");
        handleClose();
      },
      onError: (error) => {
        toast.error(error.message || "Não foi possível criar a corretora");
      },
    });
  }

  return (
    <Sheet open onOpenChange={(open) => !open && handleClose()}>
      <SheetContent className="flex w-full flex-col sm:max-w-[720px]">
        <SheetHeader>
          <SheetTitle>Nova corretora</SheetTitle>
        </SheetHeader>

        <form
          id="create-brokerage-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-1 flex-col gap-4 overflow-y-auto bg-muted p-5"
        >
          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="brokerage_name">Nome da corretora</Label>
              <Input id="brokerage_name" {...register("brokerage_name")} />
              {errors.brokerage_name && (
                <p className="text-sm text-destructive">{errors.brokerage_name.message}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Primeiro administrador
            </p>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="admin_full_name">Nome</Label>
              <Input id="admin_full_name" {...register("admin_full_name")} />
              {errors.admin_full_name && (
                <p className="text-sm text-destructive">{errors.admin_full_name.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="admin_email">E-mail</Label>
              <Input id="admin_email" type="email" {...register("admin_email")} />
              {errors.admin_email && (
                <p className="text-sm text-destructive">{errors.admin_email.message}</p>
              )}
            </div>
          </div>
        </form>

        <SheetFooter className="flex-row justify-end border-t border-border bg-card">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" form="create-brokerage-form" disabled={createBrokerage.isPending}>
            {createBrokerage.isPending ? "Criando..." : "Criar"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
