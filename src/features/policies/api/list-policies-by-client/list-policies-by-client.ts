import { supabase } from "@/shared/lib/supabase";

// Usado no formulário do QAR (spec quotations) pra montar o seletor de
// "apólice anterior" — só id/número, sem os embeds pesados de list-policies.
export async function listPoliciesByClient(clientId: string) {
  const { data, error } = await supabase
    .from("policies")
    .select("id, policy_number")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}
