import { supabase } from "@/shared/lib/supabase";
import type { Database } from "@/shared/lib/supabase";

export interface CreateClientInput {
  brokerage_id: string;
  client_type: Database["public"]["Enums"]["client_type"];
  legal_name: string;
  trade_name: string | null;
  tax_id: string | null;
  birth_date: string | null;
  business_code: string | null;
  industry: string | null;
  state_registration: string | null;
  zip_code: string | null;
  street: string | null;
  street_number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  contact_name: string | null;
  contact_role: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  financial_name: string | null;
  financial_email: string | null;
  notes: string | null;
}

// insert() e select() em duas requisições separadas — nunca encadear
// .insert().select() aqui. Quando quem cria é um seller, o trigger
// auto_link_seller_as_primary (AFTER INSERT) vincula o criador como vendedor
// principal; um INSERT ... RETURNING reavalia a policy de SELECT de clients
// ANTES desse trigger terminar, então a linha ainda não passaria em
// is_my_client() nesse instante (ver .agents/specs/clients/design.md).
export async function createClient(input: CreateClientInput) {
  const id = crypto.randomUUID();

  const { error: insertError } = await supabase.from("clients").insert({ id, ...input });
  if (insertError) throw insertError;

  const { data, error } = await supabase.from("clients").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}
