import type { Database } from "@/shared/lib/supabase";

export type Quotation = Database["public"]["Tables"]["quotations"]["Row"];
export type QuotationVehicle = Database["public"]["Tables"]["quotation_vehicles"]["Row"];
export type QuotationInsurer = Database["public"]["Tables"]["quotation_insurers"]["Row"];
export type QuotationQar = Database["public"]["Tables"]["quotation_qar"]["Row"];
export type QuotationQarAttachment =
  Database["public"]["Tables"]["quotation_qar_attachments"]["Row"];
export type QuotationInsurerEvent = Database["public"]["Tables"]["quotation_insurer_events"]["Row"];

// Usado na listagem — embed com o nome do cliente e do vendedor, pra exibir
// nas colunas sem uma segunda query por linha.
export type QuotationWithRelations = Quotation & {
  clients: { id: string; legal_name: string } | null;
  seller: { id: string; full_name: string } | null;
};

// Usado na aba Veículos — embed com os dados do veículo (placa, marca/modelo).
export type QuotationVehicleWithVehicle = QuotationVehicle & {
  vehicles: {
    id: string;
    plate: string;
    brand: string | null;
    model: string | null;
  } | null;
};

// Usado na aba Seguradoras — embed com o nome da seguradora.
export type QuotationInsurerWithInsurer = QuotationInsurer & {
  insurers: { id: string; name: string } | null;
};

// Usado na linha do tempo de eventos — embed com o nome do autor.
export type QuotationInsurerEventWithAuthor = QuotationInsurerEvent & {
  users: { id: string; full_name: string } | null;
};
