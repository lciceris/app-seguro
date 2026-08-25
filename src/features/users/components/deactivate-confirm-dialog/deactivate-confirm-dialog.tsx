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

import { useDeactivateUser } from "../../hooks/use-deactivate-user";

interface DeactivateConfirmDialogProps {
  userId: string | null;
  userName?: string;
  onOpenChange: (open: boolean) => void;
}

export function DeactivateConfirmDialog({
  userId,
  userName,
  onOpenChange,
}: DeactivateConfirmDialogProps) {
  const deactivateUser = useDeactivateUser();

  function handleConfirm(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    if (!userId) return;

    deactivateUser.mutate(userId, {
      onSuccess: () => {
        toast.success("Usuário desativado com sucesso");
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error(error.message || "Não foi possível desativar o usuário");
      },
    });
  }

  return (
    <AlertDialog open={userId !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Desativar usuário</AlertDialogTitle>
          <AlertDialogDescription>
            {userName ? `${userName} perderá` : "O usuário perderá"} o acesso à plataforma. Os dados
            vinculados a ele (cotações, clientes) permanecem intactos e o acesso pode ser restaurado
            reativando a conta depois.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleConfirm}
            disabled={deactivateUser.isPending}
          >
            {deactivateUser.isPending ? "Desativando..." : "Desativar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
