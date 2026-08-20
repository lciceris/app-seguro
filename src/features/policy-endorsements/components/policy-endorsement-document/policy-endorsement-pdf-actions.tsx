import { pdf } from "@react-pdf/renderer";
import { Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { usePolicy } from "@/features/policies";
import { Button } from "@/shared/components/ui/button";

import { usePolicyVehicles } from "../../hooks/use-policy-vehicles";
import type { PolicyEndorsementWithVehicle } from "../../types/policy-endorsement";
import { PolicyEndorsementDocument } from "./policy-endorsement-document";

const VEHICLE_COVERAGE_TYPES = new Set(["vehicle_exclusion", "coverage_change"]);

interface PolicyEndorsementPdfActionsProps {
  endorsement: PolicyEndorsementWithVehicle;
}

// Requirement 11.2: PDF gerado inteiramente no navegador, mesma abordagem já
// usada em quotations — sem Edge Function. Só disponível quando o endosso já
// foi efetivado (Requirement 11.1).
export function PolicyEndorsementPdfActions({ endorsement }: PolicyEndorsementPdfActionsProps) {
  const { data: previousPolicy } = usePolicy(endorsement.policy_id);
  const { data: previousVehicles } = usePolicyVehicles(endorsement.policy_id);
  const [isGenerating, setIsGenerating] = useState(false);

  if (endorsement.status !== "effected" || !previousPolicy) return null;

  const previousVehicleCoverage =
    VEHICLE_COVERAGE_TYPES.has(endorsement.endorsement_type) && endorsement.vehicle_id
      ? ((previousVehicles ?? []).find((item) => item.vehicle_id === endorsement.vehicle_id) ??
        null)
      : null;

  async function handleDownload() {
    setIsGenerating(true);
    try {
      const blob = await pdf(
        <PolicyEndorsementDocument
          endorsement={endorsement}
          previousPolicy={previousPolicy!}
          previousVehicleCoverage={previousVehicleCoverage}
        />,
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `endosso-${previousPolicy!.policy_number ?? "apolice"}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Não foi possível gerar o PDF");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <Button variant="outline" disabled={isGenerating} onClick={handleDownload}>
      <Download className="h-4 w-4" />
      {isGenerating ? "Gerando..." : "Baixar PDF"}
    </Button>
  );
}
