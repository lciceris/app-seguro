import type { Database } from "@/shared/lib/supabase";

export type User = Database["public"]["Tables"]["users"]["Row"];
