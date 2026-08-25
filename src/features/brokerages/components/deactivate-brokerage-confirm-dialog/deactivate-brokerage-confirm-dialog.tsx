import type { MouseEvent } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";

import { useDeactivateBrokerage } from "../../hooks/use-deactivate-brokerage";

interface DeactivateBrokerageConfirmDialogProps {
  brokerageId: string | null;
  brokerageName?: string;
  onOpenChange: (open: boolean) => void;
}

export function DeactivateBrokerageConfirmDialog({
  brokerageId,
  brokerageName,
  onOpenChange,
}: DeactivateBrokerageConfirmDialogProps) {
  const deactivateBrokerage = useDeactivateBrokerage();

  function handleConfirm(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    if (!brokerageId) return;

    deactivateBrokerage.mutate(brokerageId, {
      onSuccess: () => {
        toast.success("Corretora desativada com sucesso");
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error(error.message || "Não foi possível desativar a corretora");
      },
    });
  }

  return (
    <AlertDialog open={brokerageId !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Desativar corretora</AlertDialogTitle>
          <AlertDialogDescription>
            {brokerageName ? `${brokerageName} perderá` : "A corretora perderá"} o acesso à
            plataforma — todos os usuários dela ficam bloqueados até a reativação. Os dados
            vinculados a ela permanecem intactos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleConfirm}
            disabled={deactivateBrokerage.isPending}
          >
            {deactivateBrokerage.isPending ? "Desativando..." : "Desativar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
