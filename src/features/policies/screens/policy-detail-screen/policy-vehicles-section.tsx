import { COVERAGE_TYPE_LABELS } from "@/features/quotations";
import { usePolicyVehicles } from "@/features/policy-endorsements";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";

function formatCurrency(value: number | null) {
  if (value === null) return "—";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface PolicyVehiclesSectionProps {
  policyId: string;
}

// View-only — a lista de veículos de uma versão de apólice só muda via
// endosso (vehicle_inclusion/vehicle_exclusion/coverage_change), nunca
// diretamente aqui (ver .agents/specs/policy-endorsements/design.md).
export function PolicyVehiclesSection({ policyId }: PolicyVehiclesSectionProps) {
  const { data: policyVehicles, isLoading, isError, refetch } = usePolicyVehicles(policyId);

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-xl border border-border">
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
                </tr>
              ))}

            {isError && !isLoading && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center">
                  <p className="mb-2 text-sm text-muted-foreground">
                    Não foi possível carregar os veículos da apólice.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => refetch()}>
                    Tentar novamente
                  </Button>
                </td>
              </tr>
            )}

            {!isLoading && !isError && policyVehicles?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Nenhum veículo coberto por essa versão.
                </td>
              </tr>
            )}

            {!isLoading &&
              !isError &&
              policyVehicles?.map((policyVehicle) => (
                <tr
                  key={policyVehicle.vehicle_id}
                  className="border-b border-border last:border-0 hover:bg-muted/50"
                >
                  <td className="px-4 py-3 text-foreground">
                    {policyVehicle.vehicles?.plate ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {[policyVehicle.vehicles?.brand, policyVehicle.vehicles?.model]
                      .filter(Boolean)
                      .join(" ") || "—"}
                  </td>
                  <td className="px-4 py-3">
                    {policyVehicle.coverage_type ? (
                      <Badge variant="outline">
                        {COVERAGE_TYPE_LABELS[policyVehicle.coverage_type]}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatCurrency(policyVehicle.casco_value)}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
