import { useNavigate, useParams } from "react-router-dom";

import { formatCep, formatCnpj, formatPhone } from "@/shared/lib/masks";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { DetailField } from "@/shared/components/ui/detail-field";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";

import { useActiveUsersCount } from "../../hooks/use-active-users-count";
import { useBrokerage } from "../../hooks/use-brokerage";

export function BrokerageDetailDrawer() {
  const navigate = useNavigate();
  const { brokerageId } = useParams<{ brokerageId: string }>();
  const { data: brokerage, isLoading, isError, refetch } = useBrokerage(brokerageId!);
  const { data: activeUsersCount, isLoading: isLoadingUsersCount } = useActiveUsersCount(
    brokerageId!,
  );

  function handleClose() {
    navigate("/brokerages");
  }

  return (
    <Sheet open onOpenChange={(open) => !open && handleClose()}>
      <SheetContent size="lg">
        <SheetHeader>
          <div className="flex items-center gap-3">
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
              <SheetTitle className="flex items-center gap-2">
                {isLoading ? (
                  <Skeleton className="h-6 w-40" />
                ) : (
                  (brokerage?.name ?? "Detalhe da corretora")
                )}
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
              </SheetTitle>
              {!isLoading && brokerage && (
                <p className="text-xs text-muted-foreground">
                  {brokerage.plans?.name
                    ? `Detalhe da corretora · Plano ${brokerage.plans.name}`
                    : "Detalhe da corretora · Sem plano"}
                </p>
              )}
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 min-h-0 overflow-y-auto bg-background">
          <div className="mx-auto flex w-full max-w-[1000px] flex-col gap-4 p-5">
            {isLoading && (
              <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-24" />
              </div>
            )}

            {isError && !isLoading && (
              <div className="rounded-xl border border-border bg-card shadow-sm p-5 text-center">
                <p className="mb-2 text-sm text-muted-foreground">
                  Não foi possível carregar os dados da corretora.
                </p>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  Tentar novamente
                </Button>
              </div>
            )}

            {!isLoading && !isError && brokerage && (
              <>
                <div className="flex flex-col gap-2 rounded-xl border border-border bg-card shadow-sm p-5">
                  <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Usuários ativos
                  </p>
                  {isLoadingUsersCount ? (
                    <Skeleton className="h-7 w-16" />
                  ) : (
                    <p className="text-2xl font-bold text-foreground">
                      {activeUsersCount ?? "—"}
                      <span className="ml-1.5 text-sm font-normal text-muted-foreground">
                        usuários ativos
                      </span>
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
                  <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Empresa
                  </p>
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
                </div>

                <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
                  <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Endereço
                  </p>
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
                </div>

                <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
                  <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Representante e contato
                  </p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <DetailField
                      label="Nome do representante"
                      value={brokerage.representative_name}
                    />
                    <DetailField
                      label="E-mail do representante"
                      value={brokerage.representative_email}
                    />
                    <DetailField label="Nome financeiro" value={brokerage.financial_name} />
                    <DetailField label="E-mail financeiro" value={brokerage.financial_email} />
                  </div>
                </div>

                <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
                  <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Plano
                  </p>
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
                </div>
              </>
            )}
          </div>
        </div>

        <SheetFooter className="flex-row justify-end">
          <Button variant="outline" onClick={handleClose}>
            Fechar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
