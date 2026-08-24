import { supabase } from "@/shared/lib/supabase";
import { extractFunctionErrorMessage } from "@/shared/utils/extract-function-error-message";

// O representante é convidado automaticamente como primeiro brokerage_admin
// da corretora — não há um "admin" separado do representante.
export interface CreateBrokerageInput {
  brokerage_name: string;
  representative_name: string;
  representative_email: string;
  trade_name: string | null;
  tax_id: string | null;
  business_code: string | null;
  state_registration: string | null;
  email: string | null;
  phone: string | null;
  zip_code: string | null;
  street: string | null;
  street_number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  financial_name: string | null;
  financial_email: string | null;
}

export async function createBrokerage(input: CreateBrokerageInput) {
  const { data, error } = await supabase.functions.invoke("create-brokerage", { body: input });

  if (error) {
    const message = await extractFunctionErrorMessage(error);
    throw new Error(message ?? error.message);
  }
  return data;
}
