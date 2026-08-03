import { supabase } from "@/shared/lib/supabase";
import { extractFunctionErrorMessage } from "@/shared/utils/extract-function-error-message";

export interface CreateBrokerageInput {
  brokerage_name: string;
  admin_full_name: string;
  admin_email: string;
}

export async function createBrokerage(input: CreateBrokerageInput) {
  const { data, error } = await supabase.functions.invoke("create-brokerage", { body: input });

  if (error) {
    const message = await extractFunctionErrorMessage(error);
    throw new Error(message ?? error.message);
  }
  return data;
}
