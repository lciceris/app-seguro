import { useNavigate, useParams } from "react-router-dom";

import { formatCep, formatCnpj, formatPhone } from "@/shared/lib/masks";
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

import { useBrokerage } from "../../hooks/use-brokerage";

export function BrokerageDetailDrawer() {
  const navigate = useNavigate();
  const { brokerageId } = useParams<{ brokerageId: string }>();
  const { data: brokerage, isLoading, isError, refetch } = useBrokerage(brokerageId!);

  function handleClose() {
    navigate("/brokerages");
  }

  return (
    <Sheet open onOpenChange={(open) => !open && handleClose()}>
      <SheetContent size="lg">
        <SheetHeader>
          <SheetTitle>Detalhe da corretora</SheetTitle>
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
                <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
                  <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Empresa
                  </p>
                  <DetailField label="Razão social" value={brokerage.name} />
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

                <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
                  <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Endereço
                  </p>
                  <DetailField
                    label="CEP"
                    value={brokerage.zip_code ? formatCep(brokerage.zip_code) : null}
                  />
                  <DetailField label="Logradouro" value={brokerage.street} />
                  <DetailField label="Número" value={brokerage.street_number} />
                  <DetailField label="Complemento" value={brokerage.complement} />
                  <DetailField label="Bairro" value={brokerage.neighborhood} />
                  <DetailField label="Cidade" value={brokerage.city} />
                  <DetailField label="UF" value={brokerage.state} />
                </div>

                <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
                  <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Representante e contato
                  </p>
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

                <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
                  <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Plano e status
                  </p>
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
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                      Status
                    </span>
                    <span
                      className={
                        brokerage.status === "active"
                          ? "text-sm font-medium text-success-text"
                          : "text-sm font-medium text-neutral-text"
                      }
                    >
                      {brokerage.status === "active" ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
                  <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Identidade visual
                  </p>
                  <DetailField label="URL do logo" value={brokerage.logo_url} />
                  <DetailField label="Cor primária" value={brokerage.primary_color} />
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
