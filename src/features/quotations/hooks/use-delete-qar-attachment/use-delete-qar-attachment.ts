import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteQarAttachment } from "../../api/delete-qar-attachment";
import { quotationKeys } from "../../constants/query-keys";

export interface DeleteQarAttachmentVariables {
  id: string;
  filePath: string;
  quotationId: string;
}

export function useDeleteQarAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, filePath }: DeleteQarAttachmentVariables) =>
      deleteQarAttachment({ id, filePath }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: quotationKeys.qarAttachments(variables.quotationId),
      });
    },
  });
}
