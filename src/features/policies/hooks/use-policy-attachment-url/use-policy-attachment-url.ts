import { useMutation } from "@tanstack/react-query";

import { getPolicyAttachmentUrl } from "../../api/get-policy-attachment-url";

// Ação sob demanda (clique em "baixar"), não uma query automática — por
// isso é uma mutation, não um useQuery.
export function usePolicyAttachmentUrl() {
  return useMutation({
    mutationFn: getPolicyAttachmentUrl,
  });
}
