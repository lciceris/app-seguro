import type { Database } from "@/shared/lib/supabase";

export const VEHICLE_TYPE_LABELS: Record<Database["public"]["Enums"]["vehicle_type"], string> = {
  tow_truck: "Rebocador",
  semi_trailer: "Semi-reboque",
  heavy_truck: "Caminhão pesado",
  light_truck: "Caminhão leve",
  bus: "Ônibus",
  heavy_pickup: "Pick-up pesada",
  light_pickup: "Pick-up leve",
  passenger_car: "Passeio",
  motorcycle: "Moto",
};

export const VEHICLE_USAGE_LABELS: Record<Database["public"]["Enums"]["vehicle_usage"], string> = {
  cargo_transport: "Transporte de carga",
  commercial: "Comercial",
  private: "Particular",
  tow_service: "Guincho",
  test_drive: "Teste drive",
  driving_school: "Auto escola",
  garbage_collector: "Coletor de lixo",
  funeral_service: "Funerária",
  walk_in_rental: "Locadora de balcão",
  contract_rental: "Locadora de contrato",
  taxi: "Taxi",
  passenger_transport: "Transporte de pessoas",
  school_transport: "Escolar",
};
