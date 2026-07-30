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

// O client do Supabase não expõe a mensagem de erro da Edge Function por padrão
// (`error.message` vem genérico) — o corpo real fica em `error.context`, um Response.
async function extractErrorMessage(error: unknown): Promise<string | undefined> {
  if (error && typeof error === "object" && "context" in error) {
    const context = (error as { context?: Response }).context;
    if (context instanceof Response) {
      try {
        const body = await context.clone().json();
        if (typeof body?.error === "string") return body.error;
      } catch {
        // corpo não era JSON — segue com a mensagem padrão do client
      }
    }
  }
  return undefined;
}

export async function inviteUser(input: InviteUserInput) {
  const { data, error } = await supabase.functions.invoke("invite-user", { body: input });

  if (error) {
    const message = await extractErrorMessage(error);
    throw new Error(message ?? error.message);
  }
  return data;
}
