import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

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

import { usePolicy } from "../../hooks/use-policy";
import { useUpdatePolicy } from "../../hooks/use-update-policy";
import type { PolicyWithRelations } from "../../types/policy";
import { editPolicySchema, type EditPolicyFormValues } from "../../validations/edit-policy-schema";

function sanitize(value: string | undefined) {
  return value === "" || value === undefined ? null : value;
}

function sanitizeNum(value: string | undefined) {
  return value === "" || value === undefined || Number.isNaN(Number(value)) ? null : Number(value);
}

function toDateOnly(date: Date | null) {
  return date ? date.toISOString().slice(0, 10) : null;
}

function fromDateOnly(value: string | null) {
  return value ? new Date(`${value}T00:00:00`) : null;
}

function EditPolicyForm({
  policy,
  onSuccess,
}: {
  policy: PolicyWithRelations;
  onSuccess: () => void;
}) {
  const updatePolicy = useUpdatePolicy();

  const { register, handleSubmit, control } = useForm<EditPolicyFormValues>({
    resolver: zodResolver(editPolicySchema),
    defaultValues: {
      policy_number: policy.policy_number ?? "",
      coverage_start: fromDateOnly(policy.coverage_start),
      coverage_end: fromDateOnly(policy.coverage_end),
      premium_amount: policy.premium_amount?.toString() ?? "",
      total_fleet_value: policy.total_fleet_value?.toString() ?? "",
    },
  });

  function onSubmit(values: EditPolicyFormValues) {
    updatePolicy.mutate(
      {
        id: policy.id,
        policy_number: sanitize(values.policy_number),
        coverage_start: toDateOnly(values.coverage_start),
        coverage_end: toDateOnly(values.coverage_end),
        premium_amount: sanitizeNum(values.premium_amount),
        total_fleet_value: sanitizeNum(values.total_fleet_value),
      },
      {
        onSuccess: () => {
          toast.success("Apólice atualizada com sucesso");
          onSuccess();
        },
        onError: (error) => {
          toast.error(error.message || "Não foi possível atualizar a apólice");
        },
      },
    );
  }

  return (
    <>
      <form
        id="edit-policy-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-1 flex-col gap-4 overflow-y-auto p-5"
      >
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
          <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Emissão
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="policy_number">Número da apólice</Label>
              <Input id="policy_number" {...register("policy_number")} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="coverage_start">Início da vigência</Label>
              <Controller
                name="coverage_start"
                control={control}
                render={({ field }) => (
                  <DatePicker id="coverage_start" value={field.value} onChange={field.onChange} />
                )}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="coverage_end">Fim da vigência</Label>
              <Controller
                name="coverage_end"
                control={control}
                render={({ field }) => (
                  <DatePicker id="coverage_end" value={field.value} onChange={field.onChange} />
                )}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
          <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Valores
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="premium_amount">Prêmio (R$)</Label>
              <Input
                id="premium_amount"
                type="number"
                step="0.01"
                {...register("premium_amount")}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="total_fleet_value">Valor total da frota (R$)</Label>
              <Input
                id="total_fleet_value"
                type="number"
                step="0.01"
                {...register("total_fleet_value")}
              />
            </div>
          </div>
        </div>
      </form>

      <SheetFooter className="flex-row justify-end border-t border-border bg-card">
        <Button variant="outline" onClick={onSuccess}>
          Cancelar
        </Button>
        <Button type="submit" form="edit-policy-form" disabled={updatePolicy.isPending}>
          {updatePolicy.isPending ? "Salvando..." : "Salvar"}
        </Button>
      </SheetFooter>
    </>
  );
}

export function EditPolicyDrawer() {
  const navigate = useNavigate();
  const { policyId } = useParams<{ policyId: string }>();
  const { data: policy, isLoading, isError, refetch } = usePolicy(policyId!);

  function handleClose() {
    navigate(`/policies/${policyId}`);
  }

  return (
    <Sheet open onOpenChange={(open) => !open && handleClose()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Editar apólice</SheetTitle>
        </SheetHeader>

        {(isLoading || isError) && (
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
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
                  Não foi possível carregar os dados da apólice.
                </p>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  Tentar novamente
                </Button>
              </div>
            )}
          </div>
        )}

        {!isLoading && !isError && policy && (
          <EditPolicyForm policy={policy} onSuccess={handleClose} />
        )}
      </SheetContent>
    </Sheet>
  );
}
