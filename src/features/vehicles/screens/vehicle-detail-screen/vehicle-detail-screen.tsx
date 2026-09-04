import { ArrowLeft, Pencil } from "lucide-react";
import { Link, Outlet, useParams } from "react-router-dom";

import { formatCep } from "@/shared/lib/masks";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { DetailField } from "@/shared/components/ui/detail-field";
import { DetailSummaryBand } from "@/shared/components/ui/detail-summary-band";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

import { VEHICLE_TYPE_LABELS, VEHICLE_USAGE_LABELS } from "../../constants/labels";
import { useVehicle } from "../../hooks/use-vehicle";

function formatCurrency(value: number | null) {
  if (value === null) return null;
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function VehicleDetailScreen() {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const { data: vehicle, isLoading, isError, refetch } = useVehicle(vehicleId!);

  return (
    <>
      <div className="mb-4 flex items-center justify-between rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon-sm">
            <Link to="/vehicles">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-lg font-semibold text-foreground">
            {isLoading ? <Skeleton className="h-6 w-32" /> : (vehicle?.plate ?? "Veículo")}
          </h1>
          {!isLoading && vehicle && (
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
          )}
        </div>
        {vehicle && (
          <Button asChild variant="outline">
            <Link to={`/vehicles/${vehicle.id}/edit?return_to=/vehicles/${vehicle.id}`}>
              <Pencil className="h-4 w-4" />
              Editar
            </Link>
          </Button>
        )}
      </div>

      {isLoading && (
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-32" />
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
        <div className="rounded-xl border border-border bg-card p-5">
          <DetailSummaryBand
            items={[
              { label: "Placa", value: vehicle.plate },
              {
                label: "Marca/Modelo",
                value: [vehicle.brand, vehicle.model].filter(Boolean).join(" ") || null,
              },
              { label: "Valor declarado", value: formatCurrency(vehicle.declared_value) },
              {
                label: "Tipo",
                value: vehicle.vehicle_type ? VEHICLE_TYPE_LABELS[vehicle.vehicle_type] : null,
              },
            ]}
          />

          <Tabs defaultValue="identificacao">
            <TabsList variant="line">
              <TabsTrigger value="identificacao">Identificação</TabsTrigger>
              <TabsTrigger value="valores">Valores</TabsTrigger>
              <TabsTrigger value="circulacao">Circulação</TabsTrigger>
              <TabsTrigger value="observacoes">Observações</TabsTrigger>
            </TabsList>

            <TabsContent value="identificacao" className="mt-4">
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <DetailField label="Cliente" value={vehicle.clients?.legal_name ?? null} />
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
            </TabsContent>

            <TabsContent value="valores" className="mt-4">
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <DetailField label="Código FIPE" value={vehicle.fipe_code} />
                <DetailField label="Valor FIPE" value={formatCurrency(vehicle.fipe_value)} />
                <DetailField
                  label="Valor declarado"
                  value={formatCurrency(vehicle.declared_value)}
                />
              </div>
            </TabsContent>

            <TabsContent value="circulacao" className="mt-4">
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <DetailField
                  label="CEP de pernoite"
                  value={vehicle.overnight_zip_code ? formatCep(vehicle.overnight_zip_code) : null}
                />
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
            </TabsContent>

            <TabsContent value="observacoes" className="mt-4">
              <DetailField label="Observações" value={vehicle.notes} />
            </TabsContent>
          </Tabs>
        </div>
      )}

      <Outlet />
    </>
  );
}
