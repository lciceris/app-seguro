import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuthStore } from "@/features/auth";

import {
  addQuotationInsurerComment,
  type AddQuotationInsurerCommentInput,
} from "../../api/add-quotation-insurer-comment";
import { quotationInsurerEventKeys } from "../../constants/query-keys";

export function useAddQuotationInsurerComment() {
  const queryClient = useQueryClient();
  const brokerageId = useAuthStore((state) => state.usuario?.brokerage_id);

  return useMutation({
    mutationFn: (input: Omit<AddQuotationInsurerCommentInput, "brokerage_id">) =>
      addQuotationInsurerComment({ ...input, brokerage_id: brokerageId! }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: quotationInsurerEventKeys.list(data.quotation_insurer_id),
      });
    },
  });
}
