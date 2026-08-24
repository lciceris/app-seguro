import { supabase } from "@/shared/lib/supabase";
import { extractFunctionErrorMessage } from "@/shared/utils/extract-function-error-message";

export interface CreateBrokerageInput {
  brokerage_name: string;
  admin_full_name: string;
  admin_email: string;
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
  representative_name: string | null;
  representative_email: string | null;
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
