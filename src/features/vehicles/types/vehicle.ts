import type { Database } from "@/shared/lib/supabase";

export type Vehicle = Database["public"]["Tables"]["vehicles"]["Row"];

// Usado na listagem (`useVehicles`) — embed com o nome do cliente dono do
// veículo, pra exibir na coluna "Cliente" sem uma segunda query por linha.
export type VehicleWithClient = Vehicle & {
  clients: { id: string; legal_name: string } | null;
};
