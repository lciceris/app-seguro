import { useNavigate, useParams } from "react-router-dom";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";

import { VEHICLE_TYPE_LABELS, VEHICLE_USAGE_LABELS } from "../../constants/labels";
import { useVehicle } from "../../hooks/use-vehicle";

function DetailField({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        {label}
      </span>
      <span className="text-sm text-foreground">{value ?? "Não informado"}</span>
    </div>
  );
}

function formatCurrency(value: number | null) {
  if (value === null) return null;
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function VehicleDetailDrawer() {
  const navigate = useNavigate();
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const { data: vehicle, isLoading, isError, refetch } = useVehicle(vehicleId!);

  function handleClose() {
    navigate("/vehicles");
  }

  return (
    <Sheet open onOpenChange={(open) => !open && handleClose()}>
      <SheetContent className="flex w-full flex-col sm:max-w-[1000px]">
        <SheetHeader>
          <SheetTitle>Detalhe do veículo</SheetTitle>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto bg-muted p-5">
          {isLoading && (
            <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          )}

          {isError && !isLoading && (
            <div className="rounded-xl border border-border bg-card p-5 text-center">
              <p className="mb-2 text-sm text-muted-foreground">
                Não foi possível carregar os dados do veículo.
              </p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Tentar novamente
              </Button>
            </div>
          )}

          {!isLoading && !isError && vehicle && (
            <>
              <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
                <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Identificação
                </p>
                <DetailField label="Cliente" value={vehicle.clients?.legal_name ?? null} />
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Status
                  </span>
                  <Badge
                    variant="outline"
                    className={
                      vehicle.is_active
                        ? "w-fit border-transparent bg-emerald-100 text-emerald-700"
                        : "w-fit border-transparent bg-slate-100 text-slate-500"
                    }
                  >
                    {vehicle.is_active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                <DetailField label="Placa" value={vehicle.plate} />
                <DetailField label="Chassi" value={vehicle.chassis} />
                <DetailField label="Código de identificação" value={vehicle.identification_code} />
                <DetailField label="RENAVAM" value={vehicle.renavam} />
                <DetailField label="Marca" value={vehicle.brand} />
                <DetailField label="Modelo" value={vehicle.model} />
                <DetailField
                  label="Ano de fabricação"
                  value={vehicle.manufacture_year?.toString() ?? null}
                />
                <DetailField label="Ano do modelo" value={vehicle.model_year?.toString() ?? null} />
                <DetailField
                  label="Tipo"
                  value={vehicle.vehicle_type ? VEHICLE_TYPE_LABELS[vehicle.vehicle_type] : null}
                />
                <DetailField
                  label="Uso"
                  value={vehicle.vehicle_usage ? VEHICLE_USAGE_LABELS[vehicle.vehicle_usage] : null}
                />
                <DetailField label="Combustível" value={vehicle.fuel_type} />
              </div>

              <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
                <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Valores
                </p>
                <DetailField label="Código FIPE" value={vehicle.fipe_code} />
                <DetailField label="Valor FIPE" value={formatCurrency(vehicle.fipe_value)} />
                <DetailField
                  label="Valor declarado"
                  value={formatCurrency(vehicle.declared_value)}
                />
              </div>

              <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
                <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Circulação
                </p>
                <DetailField label="CEP de pernoite" value={vehicle.overnight_zip_code} />
                <DetailField label="UF principal" value={vehicle.main_state} />
                <DetailField
                  label="Possui rastreador"
                  value={vehicle.has_tracker ? "Sim" : "Não"}
                />
                <DetailField label="Modelo do rastreador" value={vehicle.tracker_model} />
                <DetailField label="Acessórios" value={vehicle.accessories} />
                <DetailField label="Condutor principal" value={vehicle.main_driver} />
                <DetailField
                  label="Possui histórico de sinistro"
                  value={vehicle.has_claim_history ? "Sim" : "Não"}
                />
              </div>

              <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
                <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Observações
                </p>
                <DetailField label="Observações" value={vehicle.notes} />
              </div>
            </>
          )}
        </div>

        <SheetFooter className="flex-row justify-end border-t border-border bg-card">
          <Button variant="outline" onClick={handleClose}>
            Fechar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
