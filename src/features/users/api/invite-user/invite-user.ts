import type { Database } from "@/shared/lib/supabase";
import { supabase } from "@/shared/lib/supabase";

// platform_admin fica de fora — não é atribuível pelo fluxo comum de convite.
type InvitableRole = Exclude<Database["public"]["Enums"]["user_role"], "platform_admin">;

export interface InviteUserInput {
  full_name: string;
  email: string;
  phone: string | null;
  role: InvitableRole;
  brokerage_id: string;
}

export async function inviteUser(input: InviteUserInput) {
  const { data, error } = await supabase.functions.invoke("invite-user", { body: input });

  if (error) throw error;
  return data;
}
