import { supabase } from "@/shared/lib/supabase";

// plans ainda não tem spec própria — esta é a única consumidora até agora
// (Select de plano no edit-brokerage-drawer). SELECT é liberado a todo
// usuário autenticado (ver .agents/specs/auth/design.md).
export async function listPlans() {
  const { data, error } = await supabase
    .from("plans")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) throw error;
  return data;
}
