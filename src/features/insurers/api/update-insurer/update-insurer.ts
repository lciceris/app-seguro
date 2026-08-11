import { supabase } from "@/shared/lib/supabase";

export interface UpdateInsurerInput {
  id: string;
  name: string;
  cnpj: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  contact_name: string | null;
  response_time_days: number | null;
  display_order: number | null;
  notes: string | null;
}

export async function updateInsurer({ id, ...values }: UpdateInsurerInput) {
  const { data, error } = await supabase
    .from("insurers")
    .update(values)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
