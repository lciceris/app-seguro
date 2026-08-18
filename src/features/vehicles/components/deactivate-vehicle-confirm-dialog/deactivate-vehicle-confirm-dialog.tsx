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

import { useDeactivateVehicle } from "../../hooks/use-deactivate-vehicle";

interface DeactivateVehicleConfirmDialogProps {
  vehicleId: string | null;
  vehiclePlate?: string;
  onOpenChange: (open: boolean) => void;
}

export function DeactivateVehicleConfirmDialog({
  vehicleId,
  vehiclePlate,
  onOpenChange,
}: DeactivateVehicleConfirmDialogProps) {
  const deactivateVehicle = useDeactivateVehicle();

  function handleConfirm(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    if (!vehicleId) return;

    deactivateVehicle.mutate(vehicleId, {
      onSuccess: () => {
        toast.success("Veículo inativado com sucesso");
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error(error.message || "Não foi possível inativar o veículo");
      },
    });
  }

  return (
    <AlertDialog open={vehicleId !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Inativar veículo</AlertDialogTitle>
          <AlertDialogDescription>
            {vehiclePlate ? `O veículo ${vehiclePlate} deixa` : "O veículo deixa"} de aparecer nas
            telas operacionais até ser reativado. Os dados permanecem intactos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={deactivateVehicle.isPending}>
            {deactivateVehicle.isPending ? "Inativando..." : "Inativar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
