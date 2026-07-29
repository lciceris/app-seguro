import type { Database } from "@/shared/lib/supabase";

type UserRole = Database["public"]["Enums"]["user_role"];

export const INITIAL_ROUTE_BY_ROLE: Record<UserRole, string> = {
  platform_admin: "/admin/insurers",
  brokerage_admin: "/quotations",
  supervisor: "/quotations",
  seller: "/",
  analyst: "/",
  viewer: "/clients",
};
