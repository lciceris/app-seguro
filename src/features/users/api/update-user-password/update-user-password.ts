import { supabase } from "@/shared/lib/supabase";

export interface UpdateUserPasswordInput {
  user_id: string;
  new_password: string;
}

export async function updateUserPassword(input: UpdateUserPasswordInput) {
  const { data, error } = await supabase.functions.invoke("update-user-password", { body: input });

  if (error) throw error;
  return data;
}
