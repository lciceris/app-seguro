import { supabase } from "@/shared/lib/supabase";

export async function listQarAttachments(quotationId: string) {
  const { data, error } = await supabase
    .from("quotation_qar_attachments")
    .select("*")
    .eq("quotation_id", quotationId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}
