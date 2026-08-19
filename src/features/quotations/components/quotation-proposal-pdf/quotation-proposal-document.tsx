import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

import type { Client } from "@/features/clients";

import { COVERAGE_TYPE_LABELS } from "../../constants/labels";
import type {
  Quotation,
  QuotationInsurerWithInsurer,
  QuotationVehicleWithVehicle,
} from "../../types/quotation";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, color: "#1e293b" },
  header: { marginBottom: 20 },
  title: { fontSize: 18, fontWeight: 700, marginBottom: 2 },
  subtitle: { fontSize: 10, color: "#64748b" },
  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 8,
    textTransform: "uppercase",
    color: "#334155",
  },
  row: { flexDirection: "row", marginBottom: 4 },
  label: { width: 130, color: "#64748b" },
  value: { flex: 1, fontWeight: 500 },
  table: { borderTop: "1px solid #e2e8f0" },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid #e2e8f0",
    paddingVertical: 6,
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    paddingVertical: 6,
    fontWeight: 700,
  },
  cellPlate: { width: "20%" },
  cellVehicle: { width: "35%" },
  cellCoverage: { width: "25%" },
  cellValue: { width: "20%", textAlign: "right" },
  winnerBox: {
    marginTop: 8,
    padding: 12,
    backgroundColor: "#f0fdf4",
    border: "1px solid #bbf7d0",
  },
  footer: { marginTop: 24, fontSize: 8, color: "#94a3b8" },
});

function formatCurrency(value: number | null) {
  if (value === null) return "Não informado";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(value: string | null) {
  if (!value) return "Não informado";
  return new Date(`${value}T00:00:00`).toLocaleDateString("pt-BR");
}

interface QuotationProposalDocumentProps {
  quotation: Quotation;
  client: Client;
  vehicles: QuotationVehicleWithVehicle[];
  winningInsurer: QuotationInsurerWithInsurer;
}

export function QuotationProposalDocument({
  quotation,
  client,
  vehicles,
  winningInsurer,
}: QuotationProposalDocumentProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Proposta de Seguro de Frota</Text>
          <Text style={styles.subtitle}>Cotação {quotation.number}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados do cliente</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Cliente</Text>
            <Text style={styles.value}>{client.trade_name ?? client.legal_name}</Text>
          </View>
          {client.tax_id && (
            <View style={styles.row}>
              <Text style={styles.label}>CNPJ/CPF</Text>
              <Text style={styles.value}>{client.tax_id}</Text>
            </View>
          )}
          {(client.street || client.city) && (
            <View style={styles.row}>
              <Text style={styles.label}>Endereço</Text>
              <Text style={styles.value}>
                {[
                  client.street && `${client.street}, ${client.street_number ?? "s/n"}`,
                  client.neighborhood,
                  client.city && client.state ? `${client.city}/${client.state}` : client.city,
                ]
                  .filter(Boolean)
                  .join(" — ")}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vigência pretendida</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Início</Text>
            <Text style={styles.value}>{formatDate(quotation.coverage_start)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Fim</Text>
            <Text style={styles.value}>{formatDate(quotation.coverage_end)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Veículos ({vehicles.length})</Text>
          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <Text style={styles.cellPlate}>Placa</Text>
              <Text style={styles.cellVehicle}>Veículo</Text>
              <Text style={styles.cellCoverage}>Cobertura</Text>
              <Text style={styles.cellValue}>Valor de casco</Text>
            </View>
            {vehicles.map((vehicle) => (
              <View key={vehicle.vehicle_id} style={styles.tableRow}>
                <Text style={styles.cellPlate}>{vehicle.vehicles?.plate ?? "—"}</Text>
                <Text style={styles.cellVehicle}>
                  {[vehicle.vehicles?.brand, vehicle.vehicles?.model].filter(Boolean).join(" ") ||
                    "—"}
                </Text>
                <Text style={styles.cellCoverage}>
                  {vehicle.coverage_type ? COVERAGE_TYPE_LABELS[vehicle.coverage_type] : "—"}
                </Text>
                <Text style={styles.cellValue}>{formatCurrency(vehicle.casco_value)}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Proposta vencedora</Text>
          <View style={styles.winnerBox}>
            <View style={styles.row}>
              <Text style={styles.label}>Seguradora</Text>
              <Text style={styles.value}>{winningInsurer.insurers?.name ?? "—"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Prêmio</Text>
              <Text style={styles.value}>{formatCurrency(winningInsurer.premium_amount)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Franquia</Text>
              <Text style={styles.value}>{formatCurrency(winningInsurer.deductible_amount)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Parcelamento</Text>
              <Text style={styles.value}>
                {winningInsurer.installments_count
                  ? `${winningInsurer.installments_count}x`
                  : "Não informado"}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.footer}>
          Proposta gerada em {new Date().toLocaleDateString("pt-BR")} — sujeita a análise e
          confirmação final da seguradora.
        </Text>
      </Page>
    </Document>
  );
}
