import { ArrowLeft, Pencil } from "lucide-react";
import { Link, Outlet, useParams } from "react-router-dom";

import { useAuthStore } from "@/features/auth";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { DetailField } from "@/shared/components/ui/detail-field";
import { DetailSummaryBand } from "@/shared/components/ui/detail-summary-band";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

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

export function PolicyDetailScreen() {
  const { policyId } = useParams<{ policyId: string }>();
  const { data: policy, isLoading, isError, refetch } = usePolicy(policyId!);
  const { data: renewedBy } = useRenewedByPolicy(policyId!);
  const { data: renewedFrom } = useRenewedFromPolicy(policy?.renewed_from_policy_id ?? null);
  const usuario = useAuthStore((state) => state.usuario);
  const canManage = !!usuario && MANAGE_ROLES.has(usuario.role);

  return (
    <>
      <div className="mb-4 flex items-center justify-between rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon-sm">
            <Link to="/policies">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-lg font-semibold text-foreground">
            {isLoading ? (
              <Skeleton className="h-6 w-40" />
            ) : (
              (policy?.policy_number ?? "Pendente de emissão")
            )}
          </h1>
          {!isLoading && policy && (
            <Badge
              variant="outline"
              className={DERIVED_POLICY_STATUS_BADGE_CLASSES[getDerivedPolicyStatus(policy)]}
            >
              {DERIVED_POLICY_STATUS_LABELS[getDerivedPolicyStatus(policy)]}
            </Badge>
          )}
        </div>
        {policy && canManage && (
          <Button asChild variant="outline">
            <Link to={`/policies/${policy.id}/edit`}>
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
            Não foi possível carregar os dados da apólice.
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </div>
      )}

      {!isLoading && !isError && policy && (
        <div className="rounded-xl border border-border bg-card p-5">
          <DetailSummaryBand
            items={[
              { label: "Cliente", value: policy.clients?.legal_name ?? null },
              { label: "Seguradora", value: policy.insurers?.name ?? null },
              { label: "Prêmio", value: formatCurrency(policy.premium_amount) },
              {
                label: "Vigência",
                value:
                  policy.coverage_start || policy.coverage_end
                    ? `${formatDate(policy.coverage_start) ?? "—"} – ${formatDate(policy.coverage_end) ?? "—"}`
                    : null,
              },
            ]}
          />

          <Tabs defaultValue="dados">
            <TabsList variant="line">
              <TabsTrigger value="dados">Dados gerais</TabsTrigger>
              <TabsTrigger value="origem">Origem</TabsTrigger>
              <TabsTrigger value="veiculos">Veículos</TabsTrigger>
              <TabsTrigger value="endossos">Endossos</TabsTrigger>
              <TabsTrigger value="documentos">Documentos</TabsTrigger>
            </TabsList>

            <TabsContent value="dados" className="mt-4">
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
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
            </TabsContent>

            <TabsContent value="origem" className="mt-4">
              <div className="flex flex-col gap-4">
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
            </TabsContent>

            <TabsContent value="veiculos" className="mt-4">
              <PolicyVehiclesSection policyId={policy.id} />
            </TabsContent>

            <TabsContent value="endossos" className="mt-4">
              <PolicyEndorsementsSection policy={policy} />
            </TabsContent>

            <TabsContent value="documentos" className="mt-4">
              <PolicyAttachmentsSection policyId={policy.id} canManage={canManage} />
            </TabsContent>
          </Tabs>
        </div>
      )}

      <Outlet />
    </>
  );
}
