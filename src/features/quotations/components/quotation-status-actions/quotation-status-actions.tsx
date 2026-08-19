import { useState } from "react";
import { toast } from "sonner";

import { useAuthStore } from "@/features/auth";
import { Button } from "@/shared/components/ui/button";

import { useAdvanceQuotationStatus } from "../../hooks/use-advance-quotation-status";
import type { Quotation } from "../../types/quotation";
import { getAvailableStatusActions } from "./get-available-status-actions";
import { NotClosedDialog } from "./not-closed-dialog";

interface QuotationStatusActionsProps {
  quotation: Quotation;
}

export function QuotationStatusActions({ quotation }: QuotationStatusActionsProps) {
  const usuario = useAuthStore((state) => state.usuario);
  const advanceQuotationStatus = useAdvanceQuotationStatus();
  const [notClosedQuotationId, setNotClosedQuotationId] = useState<string | null>(null);

  if (!usuario) return null;

  const actions = getAvailableStatusActions(quotation, usuario.role, usuario.id);
  if (actions.length === 0) return null;

  function handleClick(targetStatus: Quotation["status"]) {
    advanceQuotationStatus.mutate(
      { id: quotation.id, status: targetStatus },
      {
        onSuccess: () => toast.success("Status atualizado com sucesso"),
        onError: (error) => toast.error(error.message || "Não foi possível atualizar o status"),
      },
    );
  }

  return (
    <div className="flex items-center gap-2">
      {actions.map((action) => (
        <Button
          key={action.targetStatus}
          variant={action.variant}
          disabled={advanceQuotationStatus.isPending}
          onClick={() =>
            action.requiresLostReason
              ? setNotClosedQuotationId(quotation.id)
              : handleClick(action.targetStatus)
          }
        >
          {action.label}
        </Button>
      ))}

      <NotClosedDialog
        quotationId={notClosedQuotationId}
        onOpenChange={(open) => !open && setNotClosedQuotationId(null)}
      />
    </div>
  );
}
