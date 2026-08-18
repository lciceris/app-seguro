import { Eye, Pencil, Search, UserCheck, UserX } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { toast } from "sonner";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Skeleton } from "@/shared/components/ui/skeleton";
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

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Placa
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Cliente
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Marca/Modelo
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Tipo
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: 3 }).map((_, index) => (
                <tr key={index} className="border-b border-border">
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-32" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-28" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-16" />
                  </td>
                  <td className="px-4 py-3" />
                </tr>
              ))}

            {isError && !isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center">
                  <p className="mb-2 text-sm text-muted-foreground">
                    Não foi possível carregar os veículos.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => refetch()}>
                    Tentar novamente
                  </Button>
                </td>
              </tr>
            )}

            {!isLoading && !isError && filteredVehicles?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  {search
                    ? "Nenhum veículo encontrado pra essa busca."
                    : "Nenhum veículo cadastrado ainda."}
                </td>
              </tr>
            )}

            {!isLoading &&
              !isError &&
              filteredVehicles?.map((vehicle) => (
                <tr
                  key={vehicle.id}
                  className="border-b border-border last:border-0 hover:bg-muted/50"
                >
                  <td className="px-4 py-3 text-foreground">{vehicle.plate}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {vehicle.clients?.legal_name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {[vehicle.brand, vehicle.model].filter(Boolean).join(" ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {vehicle.vehicle_type ? VEHICLE_TYPE_LABELS[vehicle.vehicle_type] : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={
                        vehicle.is_active
                          ? "border-transparent bg-emerald-100 text-emerald-700"
                          : "border-transparent bg-slate-100 text-slate-500"
                      }
                    >
                      {vehicle.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
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
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <Outlet />

      <DeactivateVehicleConfirmDialog
        vehicleId={deactivateVehicle?.id ?? null}
        vehiclePlate={deactivateVehicle?.plate}
        onOpenChange={(open) => !open && setDeactivateVehicle(null)}
      />
    </div>
  );
}
