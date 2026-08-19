import type { Database } from "@/shared/lib/supabase";

export type Policy = Database["public"]["Tables"]["policies"]["Row"];
export type PolicyAttachment = Database["public"]["Tables"]["policy_attachments"]["Row"];

// Usado na listagem e no detalhe — embed com cliente, seguradora e número da
// cotação de origem, pra exibir sem uma segunda query por linha.
export type PolicyWithRelations = Policy & {
  clients: { id: string; legal_name: string } | null;
  insurers: { id: string; name: string } | null;
  quotations: { id: string; number: string } | null;
};
