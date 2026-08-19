import { useQuery } from "@tanstack/react-query";

import { listQarAttachments } from "../../api/list-qar-attachments";
import { quotationKeys } from "../../constants/query-keys";

export function useQarAttachments(quotationId: string) {
  return useQuery({
    queryKey: quotationKeys.qarAttachments(quotationId),
    queryFn: () => listQarAttachments(quotationId),
  });
}
