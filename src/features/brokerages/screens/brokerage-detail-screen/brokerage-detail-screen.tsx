import { ArrowLeft, Pencil } from "lucide-react";
import { Link, Outlet, useParams } from "react-router-dom";

import { formatCep, formatCnpj, formatPhone } from "@/shared/lib/masks";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { DetailField } from "@/shared/components/ui/detail-field";
import { DetailSummaryBand } from "@/shared/components/ui/detail-summary-band";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

import { useActiveUsersCount } from "../../hooks/use-active-users-count";
import { useBrokerage } from "../../hooks/use-brokerage";

export function BrokerageDetailScreen() {
  const { brokerageId } = useParams<{ brokerageId: string }>();
  const { data: brokerage, isLoading, isError, refetch } = useBrokerage(brokerageId!);
  const { data: activeUsersCount, isLoading: isLoadingUsersCount } = useActiveUsersCount(
    brokerageId!,
  );

  return (
    <>
      <div className="mb-4 flex items-center justify-between rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon-sm">
            <Link to="/brokerages">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>

          {!isLoading && brokerage && (
            <>
              {brokerage.logo_url ? (
                <img
                  src={brokerage.logo_url}
                  alt={brokerage.name}
                  className="h-10 w-10 shrink-0 rounded-full border-[3px] object-cover"
                  style={{ borderColor: brokerage.primary_color ?? undefined }}
                />
              ) : (
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-[3px] bg-muted text-sm font-semibold text-muted-foreground"
                  style={{ borderColor: brokerage.primary_color ?? undefined }}
                >
                  {brokerage.name.charAt(0).toUpperCase()}
                </div>
              )}
            </>
          )}

          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-foreground">
                {isLoading ? <Skeleton className="h-6 w-40" /> : (brokerage?.name ?? "Corretora")}
              </h1>
              {!isLoading && brokerage && (
                <Badge
                  variant="outline"
                  className={
                    brokerage.status === "active"
                      ? "border-transparent bg-success-bg text-success-text"
                      : "border-transparent bg-neutral-bg text-neutral-text"
                  }
                >
                  {brokerage.status === "active" ? "Ativo" : "Inativo"}
                </Badge>
              )}
            </div>
            {!isLoading && brokerage && (
              <p className="text-xs text-muted-foreground">
                {brokerage.plans?.name ? `Plano ${brokerage.plans.name}` : "Sem plano"}
              </p>
            )}
          </div>
        </div>
        {brokerage && (
          <Button asChild variant="outline">
            <Link to={`/brokerages/${brokerage.id}/edit`}>
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
          <Skeleton className="h-4 w-24" />
        </div>
      )}

      {isError && !isLoading && (
        <div className="rounded-xl border border-border bg-card p-5 text-center">
          <p className="mb-2 text-sm text-muted-foreground">
            Não foi possível carregar os dados da corretora.
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </div>
      )}

      {!isLoading && !isError && brokerage && (
        <div className="rounded-xl border border-border bg-card p-5">
          <DetailSummaryBand
            items={[
              {
                label: "Usuários ativos",
                value: isLoadingUsersCount ? (
                  <Skeleton className="h-4 w-8" />
                ) : (
                  (activeUsersCount ?? "—")
                ),
              },
              { label: "CNPJ", value: brokerage.tax_id ? formatCnpj(brokerage.tax_id) : null },
              {
                label: "Cidade/UF",
                value: [brokerage.city, brokerage.state].filter(Boolean).join("/") || null,
              },
              { label: "Plano", value: brokerage.plans?.name ?? "Sem plano" },
            ]}
          />

          <Tabs defaultValue="empresa">
            <TabsList variant="line">
              <TabsTrigger value="empresa">Empresa</TabsTrigger>
              <TabsTrigger value="endereco">Endereço</TabsTrigger>
              <TabsTrigger value="representante">Representante</TabsTrigger>
              <TabsTrigger value="plano">Plano</TabsTrigger>
            </TabsList>

            <TabsContent value="empresa" className="mt-4">
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div className="col-span-2">
                  <DetailField label="Razão social" value={brokerage.name} />
                </div>
                <DetailField label="Nome fantasia" value={brokerage.trade_name} />
                <DetailField
                  label="CNPJ"
                  value={brokerage.tax_id ? formatCnpj(brokerage.tax_id) : null}
                />
                <DetailField label="CNAE" value={brokerage.business_code} />
                <DetailField label="Inscrição estadual" value={brokerage.state_registration} />
                <DetailField label="E-mail comercial" value={brokerage.email} />
                <DetailField
                  label="Telefone"
                  value={brokerage.phone ? formatPhone(brokerage.phone) : null}
                />
              </div>
            </TabsContent>

            <TabsContent value="endereco" className="mt-4">
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <DetailField
                  label="CEP"
                  value={brokerage.zip_code ? formatCep(brokerage.zip_code) : null}
                />
                <div className="col-span-2">
                  <DetailField label="Logradouro" value={brokerage.street} />
                </div>
                <DetailField label="Número" value={brokerage.street_number} />
                <DetailField label="Complemento" value={brokerage.complement} />
                <DetailField label="Bairro" value={brokerage.neighborhood} />
                <DetailField label="Cidade" value={brokerage.city} />
                <DetailField label="UF" value={brokerage.state} />
              </div>
            </TabsContent>

            <TabsContent value="representante" className="mt-4">
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <DetailField label="Nome do representante" value={brokerage.representative_name} />
                <DetailField
                  label="E-mail do representante"
                  value={brokerage.representative_email}
                />
                <DetailField label="Nome financeiro" value={brokerage.financial_name} />
                <DetailField label="E-mail financeiro" value={brokerage.financial_email} />
              </div>
            </TabsContent>

            <TabsContent value="plano" className="mt-4">
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <DetailField label="Plano" value={brokerage.plans?.name ?? "Sem plano"} />
                <DetailField
                  label="Data de expiração do plano"
                  value={
                    brokerage.plan_expires_at
                      ? new Date(brokerage.plan_expires_at + "T00:00:00").toLocaleDateString(
                          "pt-BR",
                        )
                      : null
                  }
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}

      <Outlet />
    </>
  );
}
