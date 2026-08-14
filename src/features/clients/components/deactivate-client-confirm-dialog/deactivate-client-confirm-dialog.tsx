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

import { useDeactivateClient } from "../../hooks/use-deactivate-client";

interface DeactivateClientConfirmDialogProps {
  clientId: string | null;
  clientName?: string;
  onOpenChange: (open: boolean) => void;
}

export function DeactivateClientConfirmDialog({
  clientId,
  clientName,
  onOpenChange,
}: DeactivateClientConfirmDialogProps) {
  const deactivateClient = useDeactivateClient();

  function handleConfirm(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    if (!clientId) return;

    deactivateClient.mutate(clientId, {
      onSuccess: () => {
        toast.success("Cliente inativado com sucesso");
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error(error.message || "Não foi possível inativar o cliente");
      },
    });
  }

  return (
    <AlertDialog open={clientId !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Inativar cliente</AlertDialogTitle>
          <AlertDialogDescription>
            {clientName ? `${clientName} deixa` : "O cliente deixa"} de aparecer nas telas
            operacionais até ser reativado. Os dados e vínculos com vendedores permanecem intactos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={deactivateClient.isPending}>
            {deactivateClient.isPending ? "Inativando..." : "Inativar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
