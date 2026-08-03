import type { Database } from "@/shared/lib/supabase";

export type Brokerage = Database["public"]["Tables"]["brokerages"]["Row"];
