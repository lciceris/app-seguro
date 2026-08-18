import { z } from "zod";

// "none" é o valor sentinela dos SelectItem de tipo/uso (Select não aceita
// value="" diretamente) — convertido pra null no payload da mutation.
export const NO_VEHICLE_TYPE_VALUE = "none";
export const NO_VEHICLE_USAGE_VALUE = "none";

export const createVehicleSchema = z.object({
  client_id: z.string().min(1, "Selecione um cliente"),
  plate: z.string().min(1, "Informe a placa"),
  chassis: z.string().optional(),
  identification_code: z.string().optional(),
  renavam: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  manufacture_year: z.string().optional(),
  model_year: z.string().optional(),
  vehicle_type: z.string(),
  vehicle_usage: z.string(),
  fuel_type: z.string().optional(),
  fipe_code: z.string().optional(),
  fipe_value: z.string().optional(),
  declared_value: z.string().optional(),
  overnight_zip_code: z.string().optional(),
  main_state: z.string().optional(),
  has_tracker: z.boolean(),
  tracker_model: z.string().optional(),
  accessories: z.string().optional(),
  main_driver: z.string().optional(),
  has_claim_history: z.boolean(),
  notes: z.string().optional(),
});

export type CreateVehicleFormValues = z.infer<typeof createVehicleSchema>;
