import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { COVERAGE_TYPE_LABELS } from "@/features/quotations";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";
import { Skeleton } from "@/shared/components/ui/skeleton";

import {
  POLICY_ENDORSEMENT_STATUS_BADGE_CLASSES,
  POLICY_ENDORSEMENT_STATUS_LABELS,
  POLICY_ENDORSEMENT_TYPE_LABELS,
} from "../../constants/labels";
import { usePolicyEndorsement } from "../../hooks/use-policy-endorsement";
import { PolicyEndorsementPdfActions } from "../policy-endorsement-document";
import type { EndorsementAction } from "./get-available-endorsement-actions";
import { InsurerResponseForm } from "./insurer-response-form";
import { NotClosedReasonForm } from "./not-closed-reason-form";
import { PolicyEndorsementStatusActions } from "./policy-endorsement-status-actions";

const VEHICLE_TYPES = new Set(["vehicle_inclusion", "vehicle_exclusion", "coverage_change"]);
const COVERAGE_TYPES = new Set(["vehicle_inclusion", "coverage_change"]);

function DetailField({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        {label}
      </span>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  );
}

function formatCurrency(value: number | null) {
  if (value === null) return null;
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(value: string | null) {
  if (!value) return null;
  return new Date(`${value}T00:00:00`).toLocaleDateString("pt-BR");
}

function formatDateTime(value: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleString("pt-BR");
}

export function PolicyEndorsementDetailDrawer() {
  const navigate = useNavigate();
  const { policyId, endorsementId } = useParams<{ policyId: string; endorsementId: string }>();
  const { data: endorsement, isLoading, isError, refetch } = usePolicyEndorsement(endorsementId!);
  const [subView, setSubView] = useState<NonNullable<EndorsementAction["form"]> | "detail">(
    "detail",
  );

  function handleClose() {
    navigate(`/policies/${policyId}`);
  }

  return (
    <Sheet
      open
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <SheetContent className="flex w-full flex-col sm:max-w-[720px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {isLoading ? (
              <Skeleton className="h-6 w-40" />
            ) : (
              ((endorsement && POLICY_ENDORSEMENT_TYPE_LABELS[endorsement.endorsement_type]) ??
              "Endosso")
            )}
            {!isLoading && endorsement && (
              <Badge
                variant="outline"
                className={POLICY_ENDORSEMENT_STATUS_BADGE_CLASSES[endorsement.status]}
              >
                {POLICY_ENDORSEMENT_STATUS_LABELS[endorsement.status]}
              </Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        {endorsement && subView === "insurer-response" && (
          <InsurerResponseForm endorsementId={endorsement.id} onBack={() => setSubView("detail")} />
        )}

        {endorsement && subView === "not-closed-reason" && (
          <NotClosedReasonForm endorsementId={endorsement.id} onBack={() => setSubView("detail")} />
        )}

        {subView === "detail" && (
          <>
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
                    Não foi possível carregar os dados do endosso.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => refetch()}>
                    Tentar novamente
                  </Button>
                </div>
              )}

              {!isLoading && !isError && endorsement && (
                <>
                  <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
                    <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                      Dados gerais
                    </p>
                    <DetailField label="Descrição" value={endorsement.description} />
                    {VEHICLE_TYPES.has(endorsement.endorsement_type) && (
                      <DetailField
                        label="Veículo"
                        value={
                          endorsement.vehicles
                            ? `${endorsement.vehicles.plate} — ${[endorsement.vehicles.brand, endorsement.vehicles.model].filter(Boolean).join(" ")}`
                            : null
                        }
                      />
                    )}
                    {COVERAGE_TYPES.has(endorsement.endorsement_type) && (
                      <DetailField
                        label="Cobertura"
                        value={
                          endorsement.coverage_type
                            ? COVERAGE_TYPE_LABELS[endorsement.coverage_type]
                            : null
                        }
                      />
                    )}
                    {COVERAGE_TYPES.has(endorsement.endorsement_type) && (
                      <DetailField
                        label="Valor de casco"
                        value={formatCurrency(endorsement.casco_value)}
                      />
                    )}
                    {(endorsement.endorsement_type === "extension" ||
                      endorsement.endorsement_type === "administrative_correction") && (
                      <DetailField
                        label="Nova data de fim de vigência"
                        value={formatDate(endorsement.new_coverage_end)}
                      />
                    )}
                    {endorsement.endorsement_type === "administrative_correction" && (
                      <>
                        <DetailField
                          label="Novo número da apólice"
                          value={endorsement.new_policy_number}
                        />
                        <DetailField
                          label="Novo prêmio"
                          value={formatCurrency(endorsement.new_premium_amount)}
                        />
                        <DetailField
                          label="Novo valor total da frota"
                          value={formatCurrency(endorsement.new_total_fleet_value)}
                        />
                        <DetailField
                          label="Novo início de vigência"
                          value={formatDate(endorsement.new_coverage_start)}
                        />
                      </>
                    )}
                  </div>

                  {endorsement.responded_at && (
                    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
                      <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                        Retorno da seguradora
                      </p>
                      <DetailField
                        label="Ajuste de prêmio"
                        value={formatCurrency(endorsement.premium_adjustment)}
                      />
                      <DetailField label="Notas" value={endorsement.insurer_response_notes} />
                      <DetailField
                        label="Registrado em"
                        value={formatDateTime(endorsement.responded_at)}
                      />
                    </div>
                  )}

                  {endorsement.client_responded_at && (
                    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
                      <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                        Resposta do cliente
                      </p>
                      <DetailField label="Notas" value={endorsement.client_response_notes} />
                      <DetailField
                        label="Registrado em"
                        value={formatDateTime(endorsement.client_responded_at)}
                      />
                    </div>
                  )}

                  {endorsement.status === "not_closed" && (
                    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
                      <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                        Não fechado
                      </p>
                      <DetailField label="Motivo" value={endorsement.not_closed_reason} />
                    </div>
                  )}

                  {endorsement.effected_at && (
                    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
                      <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                        Efetivação
                      </p>
                      <DetailField
                        label="Efetivado em"
                        value={formatDateTime(endorsement.effected_at)}
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            <SheetFooter className="flex-row items-center justify-between border-t border-border bg-card">
              <div className="flex items-center gap-2">
                {endorsement && (
                  <PolicyEndorsementStatusActions
                    endorsement={endorsement}
                    onRequireForm={setSubView}
                  />
                )}
                {endorsement && <PolicyEndorsementPdfActions endorsement={endorsement} />}
              </div>
              <Button variant="outline" onClick={handleClose}>
                Fechar
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
