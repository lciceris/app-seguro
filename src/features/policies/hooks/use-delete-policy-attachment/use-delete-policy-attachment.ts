import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deletePolicyAttachment } from "../../api/delete-policy-attachment";
import { policyKeys } from "../../constants/query-keys";

export interface DeletePolicyAttachmentVariables {
  id: string;
  filePath: string;
  policyId: string;
}

export function useDeletePolicyAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, filePath }: DeletePolicyAttachmentVariables) =>
      deletePolicyAttachment({ id, filePath }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: policyKeys.attachments(variables.policyId) });
    },
  });
}
