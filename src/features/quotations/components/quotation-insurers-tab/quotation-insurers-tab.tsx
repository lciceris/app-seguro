import { useMemo, useState } from "react";
import { toast } from "sonner";

import { useAuthStore } from "@/features/auth";
import { useInsurerCatalog } from "@/features/insurers";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Skeleton } from "@/shared/components/ui/skeleton";

import {
  INSURER_RESPONSE_STATUS_BADGE_CLASSES,
  INSURER_RESPONSE_STATUS_LABELS,
} from "../../constants/labels";
import { useInviteQuotationInsurer } from "../../hooks/use-invite-quotation-insurer";
import { useQuotationInsurers } from "../../hooks/use-quotation-insurers";
import type { Quotation } from "../../types/quotation";
import { QuotationInsurerDrawer } from "./quotation-insurer-drawer";

const NO_INSURER_VALUE = "none";
const MANAGE_ROLES = new Set(["analyst", "supervisor", "brokerage_admin", "platform_admin"]);
const WINNER_LOCKED_STATUSES = new Set([
  "presented",
  "waiting_effect",
  "client_accepted",
  "effected",
  "not_closed",
]);

function formatCurrency(value: number | null) {
  if (value === null) return "—";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface QuotationInsurersTabProps {
  quotation: Quotation;
}

export function QuotationInsurersTab({ quotation }: QuotationInsurersTabProps) {
  const usuario = useAuthStore((state) => state.usuario);
  const canEdit = !!usuario && MANAGE_ROLES.has(usuario.role);
  const canMarkWinner = canEdit && !WINNER_LOCKED_STATUSES.has(quotation.status);

  const {
    data: quotationInsurers,
    isLoading,
    isError,
    refetch,
  } = useQuotationInsurers(quotation.id);
  const { data: catalog, isLoading: isCatalogLoading } = useInsurerCatalog();
  const inviteQuotationInsurer = useInviteQuotationInsurer();

  const [selectedInsurerId, setSelectedInsurerId] = useState(NO_INSURER_VALUE);
  // Guarda só o id, não o objeto — o objeto vem sempre da query mais recente
  // (`quotationInsurers`), senão o drawer fica preso no snapshot de quando
  // foi aberto e "Marcar como vencedora" nunca aparece depois de salvar um
  // retorno que acabou de virar `accepted` na mesma sessão do drawer.
  const [selectedQuotationInsurerId, setSelectedQuotationInsurerId] = useState<string | null>(null);
  const selectedQuotationInsurer =
    quotationInsurers?.find((item) => item.id === selectedQuotationInsurerId) ?? null;

  const availableInsurers = useMemo(() => {
    if (!catalog) return [];
    const invitedIds = new Set((quotationInsurers ?? []).map((item) => item.insurer_id));
    return catalog.filter(
      (entry) => entry.brokerage_disabled_insurers.length === 0 && !invitedIds.has(entry.id),
    );
  }, [catalog, quotationInsurers]);

  function handleInvite() {
    if (selectedInsurerId === NO_INSURER_VALUE) return;

    inviteQuotationInsurer.mutate(
      { quotation_id: quotation.id, insurer_id: selectedInsurerId },
      {
        onSuccess: () => {
          toast.success("Seguradora convidada com sucesso");
          setSelectedInsurerId(NO_INSURER_VALUE);
        },
        onError: (error) => toast.error(error.message || "Não foi possível convidar a seguradora"),
      },
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {canEdit && (
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-5">
          <Select
            value={selectedInsurerId}
            onValueChange={setSelectedInsurerId}
            disabled={isCatalogLoading}
          >
            <SelectTrigger className="w-full max-w-sm">
              <SelectValue placeholder="Selecione uma seguradora" />
            </SelectTrigger>
            <SelectContent>
              {availableInsurers.length === 0 && (
                <SelectItem value={NO_INSURER_VALUE} disabled>
                  Nenhuma seguradora disponível
                </SelectItem>
              )}
              {availableInsurers.map((insurer) => (
                <SelectItem key={insurer.id} value={insurer.id}>
                  {insurer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleInvite}
            disabled={selectedInsurerId === NO_INSURER_VALUE || inviteQuotationInsurer.isPending}
          >
            Convidar seguradora
          </Button>
        </div>
      )}

      {isLoading && (
        <div className="rounded-xl border border-border bg-card p-5">
          <Skeleton className="h-4 w-full" />
        </div>
      )}

      {isError && !isLoading && (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="mb-2 text-sm text-muted-foreground">
            Não foi possível carregar as seguradoras da cotação.
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </div>
      )}

      {!isLoading && !isError && quotationInsurers?.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Nenhuma seguradora convidada ainda.
        </div>
      )}

      {!isLoading && !isError && quotationInsurers && quotationInsurers.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="w-40 px-4 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Critérios
                </th>
                {quotationInsurers.map((quotationInsurer) => (
                  <th
                    key={quotationInsurer.id}
                    className="min-w-48 px-4 py-3 text-left align-bottom"
                  >
                    <div className="flex flex-col gap-1.5">
                      <span className="text-sm font-semibold text-foreground">
                        {quotationInsurer.insurers?.name ?? "—"}
                      </span>
                      {quotationInsurer.is_winner && (
                        <Badge
                          variant="outline"
                          className="w-fit border-transparent bg-warning-bg text-warning-text"
                        >
                          Vencedora
                        </Badge>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-border">
                <td className="px-4 py-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Status
                </td>
                {quotationInsurers.map((quotationInsurer) => (
                  <td key={quotationInsurer.id} className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={
                        INSURER_RESPONSE_STATUS_BADGE_CLASSES[quotationInsurer.response_status]
                      }
                    >
                      {INSURER_RESPONSE_STATUS_LABELS[quotationInsurer.response_status]}
                    </Badge>
                  </td>
                ))}
              </tr>
              <tr className="border-t border-border">
                <td className="px-4 py-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Prêmio
                </td>
                {quotationInsurers.map((quotationInsurer) => (
                  <td
                    key={quotationInsurer.id}
                    className="px-4 py-3 font-mono-data text-foreground"
                  >
                    {formatCurrency(quotationInsurer.premium_amount)}
                  </td>
                ))}
              </tr>
              <tr className="border-t border-border">
                <td className="px-4 py-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Detalhes
                </td>
                {quotationInsurers.map((quotationInsurer) => (
                  <td key={quotationInsurer.id} className="px-4 py-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedQuotationInsurerId(quotationInsurer.id)}
                    >
                      {canEdit ? "Editar" : "Ver"}
                    </Button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <QuotationInsurerDrawer
        quotationId={quotation.id}
        quotationInsurer={selectedQuotationInsurer}
        canEdit={canEdit}
        canMarkWinner={canMarkWinner}
        onOpenChange={(open) => !open && setSelectedQuotationInsurerId(null)}
      />
    </div>
  );
}
