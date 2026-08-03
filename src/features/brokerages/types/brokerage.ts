import type { Database } from "@/shared/lib/supabase";

export type Brokerage = Database["public"]["Tables"]["brokerages"]["Row"];

// brokerages tem só 1 relacionamento com plans (plan_id) — embed direto é seguro
// aqui, diferente do caso de quotations/quotation_insurers (2 relacionamentos).
export type BrokerageWithPlan = Brokerage & { plans: { name: string } | null };
