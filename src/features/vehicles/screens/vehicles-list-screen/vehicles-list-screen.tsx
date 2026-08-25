import { Eye, Pencil, Search, UserCheck, UserX } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { toast } from "sonner";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableEmptyState,
  TableErrorState,
  TableHead,
  TableHeader,
  TableRow,
  TableSkeletonRow,
} from "@/shared/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip";

import { VEHICLE_TYPE_LABELS } from "../../constants/labels";
import { DeactivateVehicleConfirmDialog } from "../../components/deactivate-vehicle-confirm-dialog";
import { useReactivateVehicle } from "../../hooks/use-reactivate-vehicle";
import { useVehicles } from "../../hooks/use-vehicles";

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function VehiclesListScreen() {
  const { data: vehicles, isLoading, isError, refetch } = useVehicles();
  const [search, setSearch] = useState("");
  const [deactivateVehicle, setDeactivateVehicle] = useState<{ id: string; plate: string } | null>(
    null,
  );
  const reactivateVehicle = useReactivateVehicle();

  function handleReactivate(id: string) {
    reactivateVehicle.mutate(id, {
      onSuccess: () => toast.success("Veículo reativado com sucesso"),
      onError: (error) => toast.error(error.message || "Não foi possível reativar o veículo"),
    });
  }

  const filteredVehicles = useMemo(() => {
    if (!vehicles) return vehicles;
    const query = normalize(search.trim());
    if (!query) return vehicles;

    return vehicles.filter((vehicle) => {
      const plate = normalize(vehicle.plate);
      const chassis = vehicle.chassis ? normalize(vehicle.chassis) : "";
      const clientName = vehicle.clients ? normalize(vehicle.clients.legal_name) : "";
      return plate.includes(query) || chassis.includes(query) || clientName.includes(query);
    });
  }, [vehicles, search]);

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">Veículos</h1>
        <Button asChild>
          <Link to="/vehicles/add">Novo veículo</Link>
        </Button>
      </div>

      <div className="mb-4 relative max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por placa, chassi ou cliente"
          className="pl-9"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Placa</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Marca/Modelo</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading &&
            Array.from({ length: 3 }).map((_, index) => <TableSkeletonRow key={index} cells={6} />)}

          {isError && !isLoading && (
            <TableErrorState
              colSpan={6}
              message="Não foi possível carregar os veículos."
              onRetry={() => refetch()}
            />
          )}

          {!isLoading && !isError && filteredVehicles?.length === 0 && (
            <TableEmptyState
              colSpan={6}
              message={
                search
                  ? "Nenhum veículo encontrado pra essa busca."
                  : "Nenhum veículo cadastrado ainda."
              }
            />
          )}

          {!isLoading &&
            !isError &&
            filteredVehicles?.map((vehicle) => (
              <TableRow key={vehicle.id}>
                <TableCell className="font-mono-data text-foreground">{vehicle.plate}</TableCell>
                <TableCell className="text-muted-foreground">
                  {vehicle.clients?.legal_name ?? "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {[vehicle.brand, vehicle.model].filter(Boolean).join(" ") || "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {vehicle.vehicle_type ? VEHICLE_TYPE_LABELS[vehicle.vehicle_type] : "—"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      vehicle.is_active
                        ? "border-transparent bg-success-bg text-success-text"
                        : "border-transparent bg-neutral-bg text-neutral-text"
                    }
                  >
                    {vehicle.is_active ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button asChild variant="ghost" size="icon-sm">
                          <Link to={`/vehicles/${vehicle.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Ver</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button asChild variant="ghost" size="icon-sm">
                          <Link to={`/vehicles/${vehicle.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Editar</TooltipContent>
                    </Tooltip>
                    {vehicle.is_active ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() =>
                              setDeactivateVehicle({ id: vehicle.id, plate: vehicle.plate })
                            }
                          >
                            <UserX className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Inativar</TooltipContent>
                      </Tooltip>
                    ) : (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleReactivate(vehicle.id)}
                          >
                            <UserCheck className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Reativar</TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

      <Outlet />

      <DeactivateVehicleConfirmDialog
        vehicleId={deactivateVehicle?.id ?? null}
        vehiclePlate={deactivateVehicle?.plate}
        onOpenChange={(open) => !open && setDeactivateVehicle(null)}
      />
    </div>
  );
}
