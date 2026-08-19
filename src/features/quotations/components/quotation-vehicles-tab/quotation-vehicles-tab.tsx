import { Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { useAuthStore } from "@/features/auth";
import { useVehicles } from "@/features/vehicles";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip";

import { COVERAGE_TYPE_LABELS } from "../../constants/labels";
import { useAddQuotationVehicle } from "../../hooks/use-add-quotation-vehicle";
import { useQuotationVehicles } from "../../hooks/use-quotation-vehicles";
import { useRemoveQuotationVehicle } from "../../hooks/use-remove-quotation-vehicle";
import type { Quotation, QuotationVehicleWithVehicle } from "../../types/quotation";
import { QuotationVehicleCoverageDrawer } from "./quotation-vehicle-coverage-drawer";

const NO_VEHICLE_VALUE = "none";

function formatCurrency(value: number | null) {
  if (value === null) return "—";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface QuotationVehiclesTabProps {
  quotation: Quotation;
}

export function QuotationVehiclesTab({ quotation }: QuotationVehiclesTabProps) {
  const usuario = useAuthStore((state) => state.usuario);
  const canManage = usuario?.role !== "viewer";
  const canManageList = canManage && ["waiting", "in_progress"].includes(quotation.status);

  const {
    data: quotationVehicles,
    isLoading,
    isError,
    refetch,
  } = useQuotationVehicles(quotation.id);
  const { data: allVehicles, isLoading: isVehiclesLoading } = useVehicles();
  const addQuotationVehicle = useAddQuotationVehicle();
  const removeQuotationVehicle = useRemoveQuotationVehicle();

  const [selectedVehicleId, setSelectedVehicleId] = useState(NO_VEHICLE_VALUE);
  const [editingVehicle, setEditingVehicle] = useState<QuotationVehicleWithVehicle | null>(null);

  const availableVehicles = useMemo(() => {
    if (!allVehicles) return [];
    const addedIds = new Set((quotationVehicles ?? []).map((item) => item.vehicle_id));
    return allVehicles.filter(
      (vehicle) => vehicle.client_id === quotation.client_id && !addedIds.has(vehicle.id),
    );
  }, [allVehicles, quotationVehicles, quotation.client_id]);

  function handleAdd() {
    if (selectedVehicleId === NO_VEHICLE_VALUE) return;

    addQuotationVehicle.mutate(
      {
        quotation_id: quotation.id,
        vehicle_id: selectedVehicleId,
        coverage_type: null,
        casco_percentage: null,
        casco_value: null,
        franchise_type: null,
        bonus: null,
        claims_count: null,
        rcf_dm: null,
        rcf_dc: null,
        rcf_dmo: null,
        app_death: null,
        app_disability: null,
        assistance: null,
        glass_coverage: null,
        reserve_car: null,
        bodywork_value: null,
        bodywork_type: null,
        equipment_value: null,
        equipment_type: null,
        armoring_value: null,
      },
      {
        onSuccess: () => {
          toast.success("Veículo adicionado com sucesso");
          setSelectedVehicleId(NO_VEHICLE_VALUE);
        },
        onError: (error) => {
          toast.error(error.message || "Não foi possível adicionar o veículo");
        },
      },
    );
  }

  function handleRemove(vehicleId: string) {
    removeQuotationVehicle.mutate(
      { quotation_id: quotation.id, vehicle_id: vehicleId },
      {
        onSuccess: () => toast.success("Veículo removido com sucesso"),
        onError: (error) => toast.error(error.message || "Não foi possível remover o veículo"),
      },
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {canManageList && (
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-5">
          <Select
            value={selectedVehicleId}
            onValueChange={setSelectedVehicleId}
            disabled={isVehiclesLoading}
          >
            <SelectTrigger className="w-full max-w-sm">
              <SelectValue placeholder="Selecione um veículo do cliente" />
            </SelectTrigger>
            <SelectContent>
              {availableVehicles.length === 0 && (
                <SelectItem value={NO_VEHICLE_VALUE} disabled>
                  Nenhum veículo disponível
                </SelectItem>
              )}
              {availableVehicles.map((vehicle) => (
                <SelectItem key={vehicle.id} value={vehicle.id}>
                  {vehicle.plate} — {[vehicle.brand, vehicle.model].filter(Boolean).join(" ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleAdd}
            disabled={selectedVehicleId === NO_VEHICLE_VALUE || addQuotationVehicle.isPending}
          >
            Adicionar veículo
          </Button>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Placa
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Marca/Modelo
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Cobertura
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Valor de casco
              </th>
              {canManage && (
                <th className="px-4 py-3 text-right text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Ações
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: 2 }).map((_, index) => (
                <tr key={index} className="border-b border-border">
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-32" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  {canManage && <td className="px-4 py-3" />}
                </tr>
              ))}

            {isError && !isLoading && (
              <tr>
                <td colSpan={canManage ? 5 : 4} className="px-4 py-8 text-center">
                  <p className="mb-2 text-sm text-muted-foreground">
                    Não foi possível carregar os veículos da cotação.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => refetch()}>
                    Tentar novamente
                  </Button>
                </td>
              </tr>
            )}

            {!isLoading && !isError && quotationVehicles?.length === 0 && (
              <tr>
                <td
                  colSpan={canManage ? 5 : 4}
                  className="px-4 py-8 text-center text-sm text-muted-foreground"
                >
                  Nenhum veículo adicionado ainda.
                </td>
              </tr>
            )}

            {!isLoading &&
              !isError &&
              quotationVehicles?.map((quotationVehicle) => (
                <tr
                  key={quotationVehicle.vehicle_id}
                  className="border-b border-border last:border-0 hover:bg-muted/50"
                >
                  <td className="px-4 py-3 text-foreground">
                    {quotationVehicle.vehicles?.plate ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {[quotationVehicle.vehicles?.brand, quotationVehicle.vehicles?.model]
                      .filter(Boolean)
                      .join(" ") || "—"}
                  </td>
                  <td className="px-4 py-3">
                    {quotationVehicle.coverage_type ? (
                      <Badge variant="outline">
                        {COVERAGE_TYPE_LABELS[quotationVehicle.coverage_type]}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatCurrency(quotationVehicle.casco_value)}
                  </td>
                  {canManage && (
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => setEditingVehicle(quotationVehicle)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Editar cobertura</TooltipContent>
                        </Tooltip>
                        {canManageList && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => handleRemove(quotationVehicle.vehicle_id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Remover</TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <QuotationVehicleCoverageDrawer
        quotationVehicle={editingVehicle}
        onOpenChange={(open) => !open && setEditingVehicle(null)}
      />
    </div>
  );
}
