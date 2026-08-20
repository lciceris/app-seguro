import { toast } from "sonner";

import { useAuthStore } from "@/features/auth";
import { Button } from "@/shared/components/ui/button";

import { useAdvancePolicyEndorsementStatus } from "../../hooks/use-advance-policy-endorsement-status";
import type { PolicyEndorsement } from "../../types/policy-endorsement";
import {
  getAvailableEndorsementActions,
  type EndorsementAction,
} from "./get-available-endorsement-actions";

interface PolicyEndorsementStatusActionsProps {
  endorsement: PolicyEndorsement;
  onRequireForm: (form: NonNullable<EndorsementAction["form"]>) => void;
}

export function PolicyEndorsementStatusActions({
  endorsement,
  onRequireForm,
}: PolicyEndorsementStatusActionsProps) {
  const usuario = useAuthStore((state) => state.usuario);
  const advanceStatus = useAdvancePolicyEndorsementStatus();

  if (!usuario) return null;

  const actions = getAvailableEndorsementActions(endorsement, usuario.role);
  if (actions.length === 0) return null;

  function handleClick(action: EndorsementAction) {
    if (action.form) {
      onRequireForm(action.form);
      return;
    }
    advanceStatus.mutate(
      { id: endorsement.id, status: action.targetStatus },
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
          disabled={advanceStatus.isPending}
          onClick={() => handleClick(action)}
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
}
