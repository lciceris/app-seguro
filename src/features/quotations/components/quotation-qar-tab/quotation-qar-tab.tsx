import { useAuthStore } from "@/features/auth";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Button } from "@/shared/components/ui/button";

import { useQuotationQar } from "../../hooks/use-quotation-qar";
import { QuotationQarAttachments } from "./quotation-qar-attachments";
import { QuotationQarForm } from "./quotation-qar-form";

interface QuotationQarTabProps {
  quotationId: string;
}

export function QuotationQarTab({ quotationId }: QuotationQarTabProps) {
  const usuario = useAuthStore((state) => state.usuario);
  const canManage = usuario?.role !== "viewer";

  const { data: qar, isLoading, isError, refetch } = useQuotationQar(quotationId);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-border bg-card p-5 text-center">
        <p className="mb-2 text-sm text-muted-foreground">Não foi possível carregar o QAR.</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <QuotationQarForm quotationId={quotationId} qar={qar} canManage={canManage} />
      <QuotationQarAttachments quotationId={quotationId} canManage={canManage} />
    </div>
  );
}
