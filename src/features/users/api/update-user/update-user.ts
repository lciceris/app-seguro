import type { Database } from "@/shared/lib/supabase";
import { supabase } from "@/shared/lib/supabase";

type EditableRole = Exclude<Database["public"]["Enums"]["user_role"], "platform_admin">;

export interface UpdateUserInput {
  id: string;
  full_name: string;
  phone: string | null;
  role: EditableRole;
}

// E-mail não é editável aqui — mudar o e-mail de login exige um fluxo de
// verificação do Supabase Auth fora do escopo desta spec (ver Requirement 4.3).
export async function updateUser({ id, ...values }: UpdateUserInput) {
  const { data, error } = await supabase
    .from("users")
    .update(values)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
