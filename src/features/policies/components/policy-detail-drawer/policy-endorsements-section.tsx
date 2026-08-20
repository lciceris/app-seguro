import { Eye, FilePlus } from "lucide-react";
import { Link } from "react-router-dom";

import { useAuthStore } from "@/features/auth";
import {
  POLICY_ENDORSEMENT_STATUS_BADGE_CLASSES,
  POLICY_ENDORSEMENT_STATUS_LABELS,
  POLICY_ENDORSEMENT_TYPE_LABELS,
  useCurrentPolicyVersion,
  usePolicyEndorsementsByChain,
} from "@/features/policy-endorsements";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip";

import type { Policy } from "../../types/policy";

const OPEN_ENDORSEMENT_ROLES = new Set([
  "seller",
  "supervisor",
  "brokerage_admin",
  "platform_admin",
]);

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("pt-BR");
}

interface PolicyEndorsementsSectionProps {
  policy: Policy;
}

export function PolicyEndorsementsSection({ policy }: PolicyEndorsementsSectionProps) {
  const usuario = useAuthStore((state) => state.usuario);
  const {
    data: endorsements,
    isLoading,
    isError,
    refetch,
  } = usePolicyEndorsementsByChain(policy.id);
  const isSuperseded = policy.status === "superseded";
  const { data: currentVersion } = useCurrentPolicyVersion(policy.id, isSuperseded);

  const canOpenEndorsement =
    !!usuario && OPEN_ENDORSEMENT_ROLES.has(usuario.role) && policy.status === "active";

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Endossos
        </p>
        {canOpenEndorsement && (
          <Button asChild variant="outline" size="sm">
            <Link to={`/policies/${policy.id}/endorsements/add`}>
              <FilePlus className="h-4 w-4" />
              Abrir endosso
            </Link>
          </Button>
        )}
      </div>

      {isSuperseded && currentVersion && currentVersion.id !== policy.id && (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
          <span className="text-sm text-amber-800">
            Essa não é a versão mais recente da apólice — foi substituída por um endosso.
          </span>
          <Link
            to={`/policies/${currentVersion.id}`}
            className="shrink-0 text-sm font-medium text-amber-800 underline underline-offset-2"
          >
            Ver versão atual
          </Link>
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      )}

      {isError && !isLoading && (
        <div className="text-center">
          <p className="mb-2 text-sm text-muted-foreground">
            Não foi possível carregar os endossos.
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </div>
      )}

      {!isLoading && !isError && endorsements?.length === 0 && (
        <p className="text-sm text-muted-foreground">Nenhum endosso aberto ainda.</p>
      )}

      {!isLoading && !isError && endorsements && endorsements.length > 0 && (
        <ul className="flex flex-col gap-2">
          {endorsements.map((endorsement) => (
            <li
              key={endorsement.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2"
            >
              <div className="flex min-w-0 flex-col gap-1">
                <span className="truncate text-sm text-foreground">
                  {POLICY_ENDORSEMENT_TYPE_LABELS[endorsement.endorsement_type]}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDateTime(endorsement.created_at)}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge
                  variant="outline"
                  className={POLICY_ENDORSEMENT_STATUS_BADGE_CLASSES[endorsement.status]}
                >
                  {POLICY_ENDORSEMENT_STATUS_LABELS[endorsement.status]}
                </Badge>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button asChild variant="ghost" size="icon-sm">
                      <Link
                        to={`/policies/${endorsement.policy_id}/endorsements/${endorsement.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Ver</TooltipContent>
                </Tooltip>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
