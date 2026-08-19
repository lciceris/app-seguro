import { pdf } from "@react-pdf/renderer";
import { Download, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useClient } from "@/features/clients";
import { Button } from "@/shared/components/ui/button";

import { useQuotationInsurers } from "../../hooks/use-quotation-insurers";
import { useQuotationVehicles } from "../../hooks/use-quotation-vehicles";
import type { Quotation } from "../../types/quotation";
import { QuotationProposalDocument } from "./quotation-proposal-document";

interface QuotationProposalActionsProps {
  quotation: Quotation;
}

export function QuotationProposalActions({ quotation }: QuotationProposalActionsProps) {
  const { data: client } = useClient(quotation.client_id);
  const { data: vehicles } = useQuotationVehicles(quotation.id);
  const { data: quotationInsurers } = useQuotationInsurers(quotation.id);
  const [isGenerating, setIsGenerating] = useState<"download" | "share" | null>(null);

  const winningInsurer = quotationInsurers?.find((item) => item.is_winner) ?? null;

  // Requirement 9.1: só disponível quando existe seguradora vencedora — sem
  // isso não há prêmio/franquia/parcelamento pra apresentar.
  if (!winningInsurer || !client || !vehicles) return null;

  async function generateFile() {
    const blob = await pdf(
      <QuotationProposalDocument
        quotation={quotation}
        client={client!}
        vehicles={vehicles!}
        winningInsurer={winningInsurer!}
      />,
    ).toBlob();
    return new File([blob], `proposta-${quotation.number}.pdf`, { type: "application/pdf" });
  }

  async function handleDownload() {
    setIsGenerating("download");
    try {
      const file = await generateFile();
      const url = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Não foi possível gerar o PDF");
    } finally {
      setIsGenerating(null);
    }
  }

  async function handleShare() {
    setIsGenerating("share");
    try {
      const file = await generateFile();
      await navigator.share({
        files: [file],
        title: `Proposta ${quotation.number}`,
        text: "Segue a proposta de seguro da frota.",
      });
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        toast.error("Não foi possível compartilhar o PDF");
      }
    } finally {
      setIsGenerating(null);
    }
  }

  // Testa com um File de mentira do mesmo tipo — alguns navegadores suportam
  // `navigator.share` só pra texto/URL, não pra arquivos (Requirement 9.4).
  const canShare =
    typeof navigator.share === "function" &&
    typeof navigator.canShare === "function" &&
    navigator.canShare({
      files: [new File([""], "test.pdf", { type: "application/pdf" })],
    });

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" disabled={isGenerating !== null} onClick={handleDownload}>
        <Download className="h-4 w-4" />
        {isGenerating === "download" ? "Gerando..." : "Baixar PDF"}
      </Button>
      {canShare && (
        <Button variant="outline" disabled={isGenerating !== null} onClick={handleShare}>
          <Share2 className="h-4 w-4" />
          {isGenerating === "share" ? "Gerando..." : "Compartilhar"}
        </Button>
      )}
    </div>
  );
}
