import type { Database } from "@/shared/lib/supabase";

export type PolicyEndorsement = Database["public"]["Tables"]["policy_endorsements"]["Row"];
export type PolicyVehicle = Database["public"]["Tables"]["policy_vehicles"]["Row"];

// Usado no detalhe do endosso — embed com os dados do veículo (placa, marca/modelo).
export type PolicyEndorsementWithVehicle = PolicyEndorsement & {
  vehicles: {
    id: string;
    plate: string;
    brand: string | null;
    model: string | null;
  } | null;
};

// Usado na aba Veículos do detalhe da apólice — embed com os dados do veículo.
export type PolicyVehicleWithVehicle = PolicyVehicle & {
  vehicles: {
    id: string;
    plate: string;
    brand: string | null;
    model: string | null;
  } | null;
};
