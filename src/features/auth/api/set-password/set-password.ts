import { supabase } from "@/shared/lib/supabase";

export async function setPassword(password: string) {
  const { error } = await supabase.auth.updateUser({ password });

  if (error) throw error;
}
