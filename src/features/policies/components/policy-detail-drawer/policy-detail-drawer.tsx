import { Link, useNavigate, useParams } from "react-router-dom";

import { useAuthStore } from "@/features/auth";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { DetailField } from "@/shared/components/ui/detail-field";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";
import { Skeleton } from "@/shared/components/ui/skeleton";

import {
  DERIVED_POLICY_STATUS_BADGE_CLASSES,
  DERIVED_POLICY_STATUS_LABELS,
} from "../../constants/labels";
import { usePolicy } from "../../hooks/use-policy";
import { useRenewedByPolicy } from "../../hooks/use-renewed-by-policy";
import { useRenewedFromPolicy } from "../../hooks/use-renewed-from-policy";
import { getDerivedPolicyStatus } from "../../lib/get-derived-policy-status";
import { PolicyAttachmentsSection } from "./policy-attachments-section";
import { PolicyEndorsementsSection } from "./policy-endorsements-section";
import { PolicyVehiclesSection } from "./policy-vehicles-section";

const MANAGE_ROLES = new Set(["supervisor", "brokerage_admin", "platform_admin"]);

function formatCurrency(value: number | null) {
  if (value === null) return null;
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(value: string | null) {
  if (!value) return null;
  return new Date(`${value}T00:00:00`).toLocaleDateString("pt-BR");
}

export function PolicyDetailDrawer() {
  const navigate = useNavigate();
  const { policyId } = useParams<{ policyId: string }>();
  const { data: policy, isLoading, isError, refetch } = usePolicy(policyId!);
  const { data: renewedBy } = useRenewedByPolicy(policyId!);
  const { data: renewedFrom } = useRenewedFromPolicy(policy?.renewed_from_policy_id ?? null);
  const usuario = useAuthStore((state) => state.usuario);
  const canManage = !!usuario && MANAGE_ROLES.has(usuario.role);

  function handleClose() {
    navigate("/policies");
  }

  return (
    <Sheet open onOpenChange={(open) => !open && handleClose()}>
      <SheetContent size="lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {isLoading ? (
              <Skeleton className="h-6 w-40" />
            ) : (
              (policy?.policy_number ?? "Pendente de emissão")
            )}
            {!isLoading && policy && (
              <Badge
                variant="outline"
                className={DERIVED_POLICY_STATUS_BADGE_CLASSES[getDerivedPolicyStatus(policy)]}
              >
                {DERIVED_POLICY_STATUS_LABELS[getDerivedPolicyStatus(policy)]}
              </Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto bg-muted p-5">
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
                Não foi possível carregar os dados da apólice.
              </p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Tentar novamente
              </Button>
            </div>
          )}

          {!isLoading && !isError && policy && (
            <>
              <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
                <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Dados gerais
                </p>
                <DetailField label="Cliente" value={policy.clients?.legal_name ?? null} />
                <DetailField label="Seguradora" value={policy.insurers?.name ?? null} />
                <DetailField label="Prêmio" value={formatCurrency(policy.premium_amount)} />
                <DetailField
                  label="Valor total da frota"
                  value={formatCurrency(policy.total_fleet_value)}
                />
                <DetailField label="Início da vigência" value={formatDate(policy.coverage_start)} />
                <DetailField label="Fim da vigência" value={formatDate(policy.coverage_end)} />
              </div>

              <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
                <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Origem
                </p>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Cotação
                  </span>
                  {policy.quotations ? (
                    <Link
                      to={`/quotations/${policy.quotations.id}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {policy.quotations.number}
                    </Link>
                  ) : (
                    <span className="text-sm text-foreground">Não informado</span>
                  )}
                </div>
                {renewedFrom && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                      Renova a apólice
                    </span>
                    <Link
                      to={`/policies/${renewedFrom.id}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {renewedFrom.policy_number ?? "Pendente de emissão"}
                    </Link>
                  </div>
                )}
                {renewedBy && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                      Renovada pela apólice
                    </span>
                    <Link
                      to={`/policies/${renewedBy.id}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {renewedBy.policy_number ?? "Pendente de emissão"}
                    </Link>
                  </div>
                )}
              </div>

              <PolicyVehiclesSection policyId={policy.id} />

              <PolicyEndorsementsSection policy={policy} />

              <PolicyAttachmentsSection policyId={policy.id} canManage={canManage} />
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
