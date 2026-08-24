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

import { useBrokerage } from "../../hooks/use-brokerage";
import { usePlans } from "../../hooks/use-plans";
import { useUpdateBrokerage } from "../../hooks/use-update-brokerage";
import type { BrokerageWithPlan } from "../../types/brokerage";
import {
  editBrokerageSchema,
  NO_PLAN_VALUE,
  type EditBrokerageFormValues,
} from "../../validations/edit-brokerage-schema";

// Formulário próprio, montado só quando `brokerage` já existe — os valores
// atuais viram `defaultValues` do useForm diretamente (em vez de popular via
// reset() num useEffect), porque o Select controlado só reflete o valor
// selecionado corretamente quando ele já nasce com esse valor.
function EditBrokerageForm({
  brokerage,
  onSuccess,
}: {
  brokerage: BrokerageWithPlan;
  onSuccess: () => void;
}) {
  const { data: plans } = usePlans();
  const updateBrokerage = useUpdateBrokerage();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<EditBrokerageFormValues>({
    resolver: zodResolver(editBrokerageSchema),
    defaultValues: {
      name: brokerage.name,
      plan_id: brokerage.plan_id ?? NO_PLAN_VALUE,
      plan_expires_at: brokerage.plan_expires_at ? new Date(brokerage.plan_expires_at) : null,
    },
  });

  function onSubmit(values: EditBrokerageFormValues) {
    updateBrokerage.mutate(
      {
        id: brokerage.id,
        name: values.name,
        plan_id: values.plan_id === NO_PLAN_VALUE ? null : values.plan_id,
        plan_expires_at: values.plan_expires_at
          ? values.plan_expires_at.toISOString().slice(0, 10)
          : null,
      },
      {
        onSuccess: () => {
          toast.success("Corretora atualizada com sucesso");
          onSuccess();
        },
        onError: (error) => {
          toast.error(error.message || "Não foi possível atualizar a corretora");
        },
      },
    );
  }

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto bg-muted p-5">
        <form
          id="edit-brokerage-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="plan_id">Plano</Label>
            <Controller
              name="plan_id"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="plan_id" className="w-full">
                    <SelectValue placeholder="Selecione um plano" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_PLAN_VALUE}>Sem plano</SelectItem>
                    {plans?.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.plan_id && <p className="text-sm text-destructive">{errors.plan_id.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="plan_expires_at">Data de expiração do plano</Label>
            <Controller
              name="plan_expires_at"
              control={control}
              render={({ field }) => (
                <DatePicker id="plan_expires_at" value={field.value} onChange={field.onChange} />
              )}
            />
          </div>
        </form>
      </div>

      <SheetFooter className="flex-row justify-end border-t border-border bg-card">
        <Button variant="outline" onClick={onSuccess}>
          Cancelar
        </Button>
        <Button type="submit" form="edit-brokerage-form" disabled={updateBrokerage.isPending}>
          {updateBrokerage.isPending ? "Salvando..." : "Salvar"}
        </Button>
      </SheetFooter>
    </>
  );
}

export function EditBrokerageDrawer() {
  const navigate = useNavigate();
  const { brokerageId } = useParams<{ brokerageId: string }>();
  const { data: brokerage, isLoading, isError, refetch } = useBrokerage(brokerageId!);

  function handleClose() {
    navigate("/brokerages");
  }

  return (
    <Sheet open onOpenChange={(open) => !open && handleClose()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Editar corretora</SheetTitle>
        </SheetHeader>

        {(isLoading || isError) && (
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto bg-muted p-5">
            {isLoading && (
              <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            )}

            {isError && !isLoading && (
              <div className="rounded-xl border border-border bg-card p-5 text-center">
                <p className="mb-2 text-sm text-muted-foreground">
                  Não foi possível carregar os dados da corretora.
                </p>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  Tentar novamente
                </Button>
              </div>
            )}
          </div>
        )}

        {!isLoading && !isError && brokerage && (
          <EditBrokerageForm brokerage={brokerage} onSuccess={handleClose} />
        )}
      </SheetContent>
    </Sheet>
  );
}
