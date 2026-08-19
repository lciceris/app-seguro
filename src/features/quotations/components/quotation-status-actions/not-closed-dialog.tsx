import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";

import { useAdvanceQuotationStatus } from "../../hooks/use-advance-quotation-status";
import {
  notClosedReasonSchema,
  type NotClosedReasonFormValues,
} from "../../validations/not-closed-reason-schema";

interface NotClosedDialogProps {
  quotationId: string | null;
  onOpenChange: (open: boolean) => void;
}

export function NotClosedDialog({ quotationId, onOpenChange }: NotClosedDialogProps) {
  const advanceQuotationStatus = useAdvanceQuotationStatus();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NotClosedReasonFormValues>({
    resolver: zodResolver(notClosedReasonSchema),
    defaultValues: { lost_reason: "" },
  });

  function onSubmit(values: NotClosedReasonFormValues) {
    if (!quotationId) return;

    advanceQuotationStatus.mutate(
      { id: quotationId, status: "not_closed", lost_reason: values.lost_reason },
      {
        onSuccess: () => {
          toast.success("Cotação marcada como não fechada");
          reset();
          onOpenChange(false);
        },
        onError: (error) => toast.error(error.message || "Não foi possível fechar a cotação"),
      },
    );
  }

  return (
    <Dialog open={quotationId !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Marcar como não fechada</DialogTitle>
          <DialogDescription>
            Esse é um status terminal — a cotação não pode mais mudar de status depois disso. Se o
            negócio for retomado com o mesmo cliente, será uma cotação nova.
          </DialogDescription>
        </DialogHeader>

        <form
          id="not-closed-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-1.5"
        >
          <Label htmlFor="lost_reason">Motivo</Label>
          <Textarea id="lost_reason" rows={3} {...register("lost_reason")} />
          {errors.lost_reason && (
            <p className="text-sm text-destructive">{errors.lost_reason.message}</p>
          )}
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="not-closed-form"
            variant="destructive"
            disabled={advanceQuotationStatus.isPending}
          >
            {advanceQuotationStatus.isPending ? "Salvando..." : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
