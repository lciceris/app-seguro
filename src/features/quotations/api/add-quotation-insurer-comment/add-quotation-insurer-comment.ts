import { supabase } from "@/shared/lib/supabase";

export interface AddQuotationInsurerCommentInput {
  quotation_insurer_id: string;
  brokerage_id: string;
  content: string;
}

export async function addQuotationInsurerComment({
  quotation_insurer_id,
  brokerage_id,
  content,
}: AddQuotationInsurerCommentInput) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("quotation_insurer_events")
    .insert({
      quotation_insurer_id,
      brokerage_id,
      event_type: "comment",
      content,
      author_id: user?.id ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
