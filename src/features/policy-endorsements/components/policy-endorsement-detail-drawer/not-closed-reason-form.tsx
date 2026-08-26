import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";

import { useAdvancePolicyEndorsementStatus } from "../../hooks/use-advance-policy-endorsement-status";
import {
  notClosedReasonSchema,
  type NotClosedReasonFormValues,
} from "../../validations/not-closed-reason-schema";

interface NotClosedReasonFormProps {
  endorsementId: string;
  onBack: () => void;
}

// Sub-view do drawer (waiting/presented/client_accepted -> not_closed) —
// navegação interna com ← Voltar em vez de modal (CLAUDE.md regra 4).
export function NotClosedReasonForm({ endorsementId, onBack }: NotClosedReasonFormProps) {
  const advanceStatus = useAdvancePolicyEndorsementStatus();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NotClosedReasonFormValues>({
    resolver: zodResolver(notClosedReasonSchema),
    defaultValues: { not_closed_reason: "" },
  });

  function onSubmit(values: NotClosedReasonFormValues) {
    advanceStatus.mutate(
      { id: endorsementId, status: "not_closed", not_closed_reason: values.not_closed_reason },
      {
        onSuccess: () => {
          toast.success("Endosso marcado como não fechado");
          onBack();
        },
        onError: (error) => toast.error(error.message || "Não foi possível fechar o endosso"),
      },
    );
  }

  return (
    <>
      <div className="flex-1 min-h-0 overflow-y-auto bg-background">
        <div className="mx-auto flex w-full max-w-[720px] flex-col gap-4 p-5">
          <button
            type="button"
            onClick={onBack}
            className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>

          <form
            id="not-closed-reason-form"
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-1.5 rounded-xl border border-border bg-card shadow-sm p-5"
          >
            <p className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Marcar como não fechado
            </p>
            <Label htmlFor="not_closed_reason">Motivo</Label>
            <Textarea id="not_closed_reason" rows={3} {...register("not_closed_reason")} />
            {errors.not_closed_reason && (
              <p className="text-sm text-destructive">{errors.not_closed_reason.message}</p>
            )}
          </form>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-border bg-card p-4">
        <Button variant="outline" onClick={onBack}>
          Cancelar
        </Button>
        <Button
          type="submit"
          form="not-closed-reason-form"
          variant="destructive"
          disabled={advanceStatus.isPending}
        >
          {advanceStatus.isPending ? "Salvando..." : "Confirmar"}
        </Button>
      </div>
    </>
  );
}
