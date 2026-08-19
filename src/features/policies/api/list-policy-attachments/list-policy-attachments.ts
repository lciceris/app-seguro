import { supabase } from "@/shared/lib/supabase";

export async function listPolicyAttachments(policyId: string) {
  const { data, error } = await supabase
    .from("policy_attachments")
    .select("*")
    .eq("policy_id", policyId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}
