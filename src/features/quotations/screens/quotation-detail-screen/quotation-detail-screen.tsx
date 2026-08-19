import { ArrowLeft, Pencil } from "lucide-react";
import { Link, Outlet, useParams } from "react-router-dom";

import { useAuthStore } from "@/features/auth";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

import {
  QUOTATION_STATUS_BADGE_CLASSES,
  QUOTATION_STATUS_LABELS,
  QUOTATION_TYPE_LABELS,
} from "../../constants/labels";
import { useQuotation } from "../../hooks/use-quotation";
import { QuotationVehiclesTab } from "../../components/quotation-vehicles-tab";
import { QuotationQarTab } from "../../components/quotation-qar-tab";
import { QuotationInsurersTab } from "../../components/quotation-insurers-tab";
import { QuotationStatusActions } from "../../components/quotation-status-actions";

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

function formatDate(value: string | null) {
  if (!value) return null;
  return new Date(`${value}T00:00:00`).toLocaleDateString("pt-BR");
}

function QuotationOverviewTab({
  quotation,
}: {
  quotation: NonNullable<ReturnType<typeof useQuotation>["data"]>;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
        <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Dados gerais
        </p>
        <DetailField label="Cliente" value={quotation.clients?.legal_name ?? null} />
        <DetailField label="Vendedor" value={quotation.seller?.full_name ?? null} />
        <DetailField
          label="Tipo"
          value={quotation.quotation_type ? QUOTATION_TYPE_LABELS[quotation.quotation_type] : null}
        />
        <DetailField label="Prazo pra fechar" value={formatDate(quotation.due_date)} />
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
        <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Cobertura pretendida
        </p>
        <DetailField label="Início da cobertura" value={formatDate(quotation.coverage_start)} />
        <DetailField label="Fim da cobertura" value={formatDate(quotation.coverage_end)} />
        <DetailField
          label="Coberturas desejadas"
          value={
            quotation.coverages && quotation.coverages.length > 0
              ? quotation.coverages.join(", ")
              : null
          }
        />
        <DetailField label="Preferência de franquia" value={quotation.deductible_pref} />
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
        <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Observações
        </p>
        <DetailField label="Observações do vendedor" value={quotation.seller_notes} />
        {quotation.status === "not_closed" && (
          <DetailField label="Motivo de não fechamento" value={quotation.lost_reason} />
        )}
      </div>
    </div>
  );
}

export function QuotationDetailScreen() {
  const { quotationId } = useParams<{ quotationId: string }>();
  const { data: quotation, isLoading, isError, refetch } = useQuotation(quotationId!);
  const usuario = useAuthStore((state) => state.usuario);
  const canEdit = usuario?.role !== "viewer";

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon-sm">
            <Link to="/quotations">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              {isLoading ? <Skeleton className="h-6 w-32" /> : (quotation?.number ?? "Cotação")}
            </h1>
          </div>
          {!isLoading && quotation && (
            <Badge variant="outline" className={QUOTATION_STATUS_BADGE_CLASSES[quotation.status]}>
              {QUOTATION_STATUS_LABELS[quotation.status]}
            </Badge>
          )}
        </div>
        {quotation && (
          <div className="flex items-center gap-2">
            <QuotationStatusActions quotation={quotation} />
            {canEdit && (
              <Button asChild variant="outline">
                <Link to={`/quotations/${quotation.id}/edit`}>
                  <Pencil className="h-4 w-4" />
                  Editar
                </Link>
              </Button>
            )}
          </div>
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
            Não foi possível carregar os dados da cotação.
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </div>
      )}

      {!isLoading && !isError && quotation && (
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Visão geral</TabsTrigger>
            <TabsTrigger value="vehicles">Veículos</TabsTrigger>
            <TabsTrigger value="qar">QAR</TabsTrigger>
            <TabsTrigger value="insurers">Seguradoras</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <QuotationOverviewTab quotation={quotation} />
          </TabsContent>

          <TabsContent value="vehicles" className="mt-4">
            <QuotationVehiclesTab quotation={quotation} />
          </TabsContent>

          <TabsContent value="qar" className="mt-4">
            <QuotationQarTab quotationId={quotation.id} />
          </TabsContent>

          <TabsContent value="insurers" className="mt-4">
            <QuotationInsurersTab quotation={quotation} />
          </TabsContent>
        </Tabs>
      )}

      <Outlet />
    </div>
  );
}
