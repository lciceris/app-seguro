import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuthStore } from "@/features/auth";

import { uploadQarAttachment } from "../../api/upload-qar-attachment";
import { quotationKeys } from "../../constants/query-keys";

export function useUploadQarAttachment() {
  const queryClient = useQueryClient();
  const brokerageId = useAuthStore((state) => state.usuario?.brokerage_id);

  return useMutation({
    mutationFn: ({ quotationId, file }: { quotationId: string; file: File }) =>
      uploadQarAttachment({ brokerageId: brokerageId!, quotationId, file }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: quotationKeys.qarAttachments(data.quotation_id) });
    },
  });
}
