import { zodResolver } from "@hookform/resolvers/zod";
import { Trophy } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";
import { Textarea } from "@/shared/components/ui/textarea";

import {
  INSURER_RESPONSE_STATUS_BADGE_CLASSES,
  INSURER_RESPONSE_STATUS_LABELS,
} from "../../constants/labels";
import { useSetWinningInsurer } from "../../hooks/use-set-winning-insurer";
import { useUpdateQuotationInsurer } from "../../hooks/use-update-quotation-insurer";
import type { QuotationInsurerWithInsurer } from "../../types/quotation";
import {
  quotationInsurerResponseSchema,
  type QuotationInsurerResponseFormValues,
} from "../../validations/quotation-insurer-response-schema";
import { QuotationInsurerEventsTimeline } from "./quotation-insurer-events-timeline";

function sanitize(value: string | undefined) {
  return value === "" || value === undefined ? null : value;
}

function sanitizeNum(value: string | undefined) {
  return value === "" || value === undefined || Number.isNaN(Number(value)) ? null : Number(value);
}

interface QuotationInsurerDrawerProps {
  quotationId: string;
  quotationInsurer: QuotationInsurerWithInsurer | null;
  canEdit: boolean;
  canMarkWinner: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuotationInsurerDrawer({
  quotationId,
  quotationInsurer,
  canEdit,
  canMarkWinner,
  onOpenChange,
}: QuotationInsurerDrawerProps) {
  const updateQuotationInsurer = useUpdateQuotationInsurer(quotationId);
  const setWinningInsurer = useSetWinningInsurer(quotationId);

  return (
    <Sheet open={quotationInsurer !== null} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {quotationInsurer?.insurers?.name ?? "Seguradora"}
            {quotationInsurer?.is_winner && (
              <Badge variant="outline" className="border-transparent bg-amber-100 text-amber-700">
                Vencedora
              </Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        {quotationInsurer && (
          <ResponseForm
            key={quotationInsurer.id}
            quotationInsurer={quotationInsurer}
            canEdit={canEdit}
            isPending={updateQuotationInsurer.isPending}
            onSubmit={(values) => {
              updateQuotationInsurer.mutate(
                {
                  id: quotationInsurer.id,
                  response_status: values.response_status,
                  premium_amount: sanitizeNum(values.premium_amount),
                  deductible_amount: sanitizeNum(values.deductible_amount),
                  commission_rate: sanitizeNum(values.commission_rate),
                  installments_count: sanitizeNum(values.installments_count),
                  insurer_quotation_number: sanitize(values.insurer_quotation_number),
                  approved_coverages: sanitize(values.approved_coverages),
                  analyst_notes: sanitize(values.analyst_notes),
                },
                {
                  onSuccess: () => toast.success("Retorno salvo com sucesso"),
                  onError: (error) =>
                    toast.error(error.message || "Não foi possível salvar o retorno"),
                },
              );
            }}
          >
            {canMarkWinner &&
              quotationInsurer.response_status === "accepted" &&
              !quotationInsurer.is_winner && (
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={setWinningInsurer.isPending}
                    onClick={() =>
                      setWinningInsurer.mutate(quotationInsurer.id, {
                        onSuccess: () => toast.success("Seguradora marcada como vencedora"),
                        onError: (error) =>
                          toast.error(error.message || "Não foi possível marcar a vencedora"),
                      })
                    }
                  >
                    <Trophy className="h-4 w-4" />
                    Marcar como vencedora
                  </Button>
                </div>
              )}
          </ResponseForm>
        )}

        {quotationInsurer && (
          <div className="flex flex-col gap-4 overflow-y-auto bg-muted p-5 pt-0">
            <QuotationInsurerEventsTimeline
              quotationInsurerId={quotationInsurer.id}
              canComment={canEdit}
            />
          </div>
        )}

        <SheetFooter className="flex-row justify-end border-t border-border bg-card">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          {canEdit && (
            <Button
              type="submit"
              form="quotation-insurer-response-form"
              disabled={updateQuotationInsurer.isPending}
            >
              {updateQuotationInsurer.isPending ? "Salvando..." : "Salvar retorno"}
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function ResponseForm({
  quotationInsurer,
  canEdit,
  onSubmit,
  children,
}: {
  quotationInsurer: QuotationInsurerWithInsurer;
  canEdit: boolean;
  isPending: boolean;
  onSubmit: (values: QuotationInsurerResponseFormValues) => void;
  children?: React.ReactNode;
}) {
  const { register, handleSubmit, control } = useForm<QuotationInsurerResponseFormValues>({
    resolver: zodResolver(quotationInsurerResponseSchema),
    defaultValues: {
      response_status: quotationInsurer.response_status,
      premium_amount: quotationInsurer.premium_amount?.toString() ?? "",
      deductible_amount: quotationInsurer.deductible_amount?.toString() ?? "",
      commission_rate: quotationInsurer.commission_rate?.toString() ?? "",
      installments_count: quotationInsurer.installments_count?.toString() ?? "",
      insurer_quotation_number: quotationInsurer.insurer_quotation_number ?? "",
      approved_coverages: quotationInsurer.approved_coverages ?? "",
      analyst_notes: quotationInsurer.analyst_notes ?? "",
    },
  });

  return (
    <fieldset disabled={!canEdit} className="flex flex-1 flex-col gap-4 overflow-y-auto">
      <form
        id="quotation-insurer-response-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 bg-muted p-5"
      >
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Retorno
          </p>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="response_status">Status da resposta</Label>
            <Controller
              name="response_status"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={!canEdit}>
                  <SelectTrigger id="response_status" className="w-full">
                    <SelectValue>
                      <Badge
                        variant="outline"
                        className={INSURER_RESPONSE_STATUS_BADGE_CLASSES[field.value]}
                      >
                        {INSURER_RESPONSE_STATUS_LABELS[field.value]}
                      </Badge>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(INSURER_RESPONSE_STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="premium_amount">Prêmio proposto (R$)</Label>
            <Input id="premium_amount" type="number" step="0.01" {...register("premium_amount")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="deductible_amount">Franquia (R$)</Label>
            <Input
              id="deductible_amount"
              type="number"
              step="0.01"
              {...register("deductible_amount")}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="commission_rate">Comissão (%)</Label>
            <Input
              id="commission_rate"
              type="number"
              step="0.01"
              {...register("commission_rate")}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="installments_count">Parcelas</Label>
            <Input id="installments_count" type="number" {...register("installments_count")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="insurer_quotation_number">Número da proposta na seguradora</Label>
            <Input id="insurer_quotation_number" {...register("insurer_quotation_number")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="approved_coverages">Coberturas aprovadas</Label>
            <Textarea id="approved_coverages" rows={3} {...register("approved_coverages")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="analyst_notes">Notas do calculista</Label>
            <Textarea id="analyst_notes" rows={3} {...register("analyst_notes")} />
          </div>
        </div>

        {children}
      </form>
    </fieldset>
  );
}
