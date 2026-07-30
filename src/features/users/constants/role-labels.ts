import type { Database } from "@/shared/lib/supabase";

export const ROLE_LABELS: Record<Database["public"]["Enums"]["user_role"], string> = {
  platform_admin: "Admin da plataforma",
  brokerage_admin: "Admin da corretora",
  supervisor: "Supervisor",
  seller: "Vendedor",
  analyst: "Calculista",
  viewer: "Visualização",
};
