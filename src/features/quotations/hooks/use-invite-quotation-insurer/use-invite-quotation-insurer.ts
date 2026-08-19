import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuthStore } from "@/features/auth";

import {
  inviteQuotationInsurer,
  type InviteQuotationInsurerInput,
} from "../../api/invite-quotation-insurer";
import { quotationKeys } from "../../constants/query-keys";

export function useInviteQuotationInsurer() {
  const queryClient = useQueryClient();
  const brokerageId = useAuthStore((state) => state.usuario?.brokerage_id);

  return useMutation({
    mutationFn: (input: Omit<InviteQuotationInsurerInput, "brokerage_id">) =>
      inviteQuotationInsurer({ ...input, brokerage_id: brokerageId! }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: quotationKeys.insurers(data.quotation_id) });
    },
  });
}
