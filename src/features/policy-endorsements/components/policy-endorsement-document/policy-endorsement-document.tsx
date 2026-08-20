import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

import type { Policy } from "@/features/policies";

import { COVERAGE_TYPE_LABELS } from "@/features/quotations/constants/labels";

import { POLICY_ENDORSEMENT_TYPE_LABELS } from "../../constants/labels";
import type { PolicyEndorsementWithVehicle, PolicyVehicle } from "../../types/policy-endorsement";

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
  label: { width: 150, color: "#64748b" },
  value: { flex: 1, fontWeight: 500 },
  changeBox: {
    marginTop: 4,
    padding: 12,
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
  },
  changeColumns: { flexDirection: "row", gap: 16 },
  changeColumn: { flex: 1 },
  changeColumnTitle: { fontSize: 9, fontWeight: 700, color: "#64748b", marginBottom: 4 },
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

function formatDateTime(value: string | null) {
  if (!value) return "Não informado";
  return new Date(value).toLocaleString("pt-BR");
}

function vehicleLabel(
  vehicle: { plate: string; brand: string | null; model: string | null } | null,
) {
  if (!vehicle) return "—";
  return `${vehicle.plate} — ${[vehicle.brand, vehicle.model].filter(Boolean).join(" ")}`;
}

interface PolicyEndorsementDocumentProps {
  endorsement: PolicyEndorsementWithVehicle;
  previousPolicy: Policy;
  previousVehicleCoverage?: PolicyVehicle | null;
}

export function PolicyEndorsementDocument({
  endorsement,
  previousPolicy,
  previousVehicleCoverage,
}: PolicyEndorsementDocumentProps) {
  const type = endorsement.endorsement_type;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Endosso de Apólice</Text>
          <Text style={styles.subtitle}>Apólice {previousPolicy.policy_number ?? "—"}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados gerais</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Tipo de endosso</Text>
            <Text style={styles.value}>{POLICY_ENDORSEMENT_TYPE_LABELS[type]}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Efetivado em</Text>
            <Text style={styles.value}>{formatDateTime(endorsement.effected_at)}</Text>
          </View>
          {endorsement.description && (
            <View style={styles.row}>
              <Text style={styles.label}>Motivo/descrição</Text>
              <Text style={styles.value}>{endorsement.description}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Ajuste de prêmio negociado</Text>
            <Text style={styles.value}>{formatCurrency(endorsement.premium_adjustment)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>O que mudou</Text>

          {type === "vehicle_inclusion" && (
            <View style={styles.changeBox}>
              <Text style={{ marginBottom: 6 }}>
                Veículo incluído: {vehicleLabel(endorsement.vehicles)}
              </Text>
              <View style={styles.row}>
                <Text style={styles.label}>Cobertura</Text>
                <Text style={styles.value}>
                  {endorsement.coverage_type
                    ? COVERAGE_TYPE_LABELS[endorsement.coverage_type]
                    : "—"}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Valor de casco</Text>
                <Text style={styles.value}>{formatCurrency(endorsement.casco_value)}</Text>
              </View>
            </View>
          )}

          {type === "vehicle_exclusion" && (
            <View style={styles.changeBox}>
              <Text>Veículo excluído: {vehicleLabel(endorsement.vehicles)}</Text>
            </View>
          )}

          {type === "coverage_change" && (
            <View style={styles.changeBox}>
              <Text style={{ marginBottom: 6 }}>Veículo: {vehicleLabel(endorsement.vehicles)}</Text>
              <View style={styles.changeColumns}>
                <View style={styles.changeColumn}>
                  <Text style={styles.changeColumnTitle}>ANTES</Text>
                  <Text>
                    Cobertura:{" "}
                    {previousVehicleCoverage?.coverage_type
                      ? COVERAGE_TYPE_LABELS[previousVehicleCoverage.coverage_type]
                      : "—"}
                  </Text>
                  <Text>Casco: {formatCurrency(previousVehicleCoverage?.casco_value ?? null)}</Text>
                </View>
                <View style={styles.changeColumn}>
                  <Text style={styles.changeColumnTitle}>DEPOIS</Text>
                  <Text>
                    Cobertura:{" "}
                    {endorsement.coverage_type
                      ? COVERAGE_TYPE_LABELS[endorsement.coverage_type]
                      : "—"}
                  </Text>
                  <Text>Casco: {formatCurrency(endorsement.casco_value)}</Text>
                </View>
              </View>
            </View>
          )}

          {type === "extension" && (
            <View style={styles.changeBox}>
              <View style={styles.changeColumns}>
                <View style={styles.changeColumn}>
                  <Text style={styles.changeColumnTitle}>ANTES</Text>
                  <Text>Fim de vigência: {formatDate(previousPolicy.coverage_end)}</Text>
                </View>
                <View style={styles.changeColumn}>
                  <Text style={styles.changeColumnTitle}>DEPOIS</Text>
                  <Text>Fim de vigência: {formatDate(endorsement.new_coverage_end)}</Text>
                </View>
              </View>
            </View>
          )}

          {type === "administrative_correction" && (
            <View style={styles.changeBox}>
              <View style={styles.changeColumns}>
                <View style={styles.changeColumn}>
                  <Text style={styles.changeColumnTitle}>ANTES</Text>
                  <Text>Número: {previousPolicy.policy_number ?? "—"}</Text>
                  <Text>Prêmio: {formatCurrency(previousPolicy.premium_amount)}</Text>
                  <Text>Valor da frota: {formatCurrency(previousPolicy.total_fleet_value)}</Text>
                  <Text>Início de vigência: {formatDate(previousPolicy.coverage_start)}</Text>
                  <Text>Fim de vigência: {formatDate(previousPolicy.coverage_end)}</Text>
                </View>
                <View style={styles.changeColumn}>
                  <Text style={styles.changeColumnTitle}>DEPOIS</Text>
                  <Text>
                    Número: {endorsement.new_policy_number ?? previousPolicy.policy_number ?? "—"}
                  </Text>
                  <Text>
                    Prêmio:{" "}
                    {formatCurrency(
                      endorsement.new_premium_amount ?? previousPolicy.premium_amount,
                    )}
                  </Text>
                  <Text>
                    Valor da frota:{" "}
                    {formatCurrency(
                      endorsement.new_total_fleet_value ?? previousPolicy.total_fleet_value,
                    )}
                  </Text>
                  <Text>
                    Início de vigência:{" "}
                    {formatDate(endorsement.new_coverage_start ?? previousPolicy.coverage_start)}
                  </Text>
                  <Text>
                    Fim de vigência:{" "}
                    {formatDate(endorsement.new_coverage_end ?? previousPolicy.coverage_end)}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {type === "cancellation" && (
            <View style={styles.changeBox}>
              <Text>Apólice cancelada — cobertura encerrada a partir da efetivação.</Text>
            </View>
          )}
        </View>

        <Text style={styles.footer}>
          Documento gerado em {new Date().toLocaleDateString("pt-BR")}.
        </Text>
      </Page>
    </Document>
  );
}
