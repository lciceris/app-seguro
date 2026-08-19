import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuthStore } from "@/features/auth";

import { uploadPolicyAttachment } from "../../api/upload-policy-attachment";
import { policyKeys } from "../../constants/query-keys";

export function useUploadPolicyAttachment() {
  const queryClient = useQueryClient();
  const brokerageId = useAuthStore((state) => state.usuario?.brokerage_id);

  return useMutation({
    mutationFn: ({ policyId, file }: { policyId: string; file: File }) =>
      uploadPolicyAttachment({ brokerageId: brokerageId!, policyId, file }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: policyKeys.attachments(data.policy_id) });
    },
  });
}
