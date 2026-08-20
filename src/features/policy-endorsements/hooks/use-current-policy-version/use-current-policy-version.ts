import { useQuery } from "@tanstack/react-query";

import { getCurrentPolicyVersion } from "../../api/get-current-policy-version";
import { policyEndorsementKeys } from "../../constants/query-keys";

// `enabled` fica a cargo de quem chama — só faz sentido buscar quando a
// versão sendo vista já não é a mais recente (status === 'superseded').
export function useCurrentPolicyVersion(policyId: string, enabled: boolean) {
  return useQuery({
    queryKey: policyEndorsementKeys.currentVersion(policyId),
    queryFn: () => getCurrentPolicyVersion(policyId),
    enabled,
  });
}
