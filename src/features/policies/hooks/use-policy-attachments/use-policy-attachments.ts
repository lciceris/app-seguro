import { useQuery } from "@tanstack/react-query";

import { listPolicyAttachments } from "../../api/list-policy-attachments";
import { policyKeys } from "../../constants/query-keys";

export function usePolicyAttachments(policyId: string) {
  return useQuery({
    queryKey: policyKeys.attachments(policyId),
    queryFn: () => listPolicyAttachments(policyId),
  });
}
