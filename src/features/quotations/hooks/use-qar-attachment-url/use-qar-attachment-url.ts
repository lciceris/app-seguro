import { useMutation } from "@tanstack/react-query";

import { getQarAttachmentUrl } from "../../api/get-qar-attachment-url";

// Ação sob demanda (clique em "baixar"), não uma query automática — por
// isso é uma mutation, não um useQuery.
export function useQarAttachmentUrl() {
  return useMutation({
    mutationFn: getQarAttachmentUrl,
  });
}
