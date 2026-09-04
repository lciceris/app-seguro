import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { useAuthStore } from "@/features/auth";
import { useClients } from "@/features/clients";
import { useUsers } from "@/features/users";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { DatePicker } from "@/shared/components/ui/date-picker";
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
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";
import { Textarea } from "@/shared/components/ui/textarea";

import { QuotationQarTab } from "../quotation-qar-tab";
import { QuotationVehiclesTab } from "../quotation-vehicles-tab";
import { useCreateQuotation } from "../../hooks/use-create-quotation";
import { useUpdateQuotation } from "../../hooks/use-update-quotation";
import type { Quotation } from "../../types/quotation";
import {
  NO_QUOTATION_TYPE_VALUE,
  quotationStep1Schema,
  quotationStep4Schema,
  type QuotationStep1FormValues,
  type QuotationStep4FormValues,
} from "../../validations/create-quotation-wizard-schema";

const STEPS = [
  { number: 1, label: "Cliente" },
  { number: 2, label: "QAR" },
  { number: 3, label: "Veículos" },
  { number: 4, label: "Fechamento" },
] as const;

function sanitize(value: string | undefined) {
  return value === "" || value === undefined ? null : value;
}

function toDateOnly(date: Date | null) {
  return date ? date.toISOString().slice(0, 10) : null;
}

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center">
      {STEPS.map((step, index) => (
        <div key={step.number} className="flex flex-1 items-center last:flex-none">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                step.number <= currentStep
                  ? "bg-primary text-primary-foreground"
                  : "border border-border-strong bg-card text-muted-foreground",
              )}
            >
              {step.number < currentStep ? <Check className="h-3.5 w-3.5" /> : step.number}
            </div>
            <span
              className={cn(
                "text-sm whitespace-nowrap",
                step.number === currentStep
                  ? "font-semibold text-foreground"
                  : "text-muted-foreground",
              )}
            >
              {step.label}
            </span>
          </div>
          {index < STEPS.length - 1 && <div className="mx-3 h-px flex-1 bg-border" />}
        </div>
      ))}
    </div>
  );
}

function StepClient({ onCreated }: { onCreated: (quotation: Quotation) => void }) {
  const [searchParams] = useSearchParams();
  const usuario = useAuthStore((state) => state.usuario);
  const isSeller = usuario?.role === "seller";

  const createQuotation = useCreateQuotation();
  const { data: clients } = useClients();
  const { data: users } = useUsers();
  const sellers = users?.filter((user) => user.role === "seller") ?? [];

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<QuotationStep1FormValues>({
    resolver: zodResolver(quotationStep1Schema),
    defaultValues: {
      client_id: searchParams.get("client_id") ?? "",
      seller_id: "",
      quotation_type: NO_QUOTATION_TYPE_VALUE,
    },
  });

  function onSubmit(values: QuotationStep1FormValues) {
    createQuotation.mutate(
      {
        client_id: values.client_id,
        seller_id: isSeller ? (usuario?.id ?? null) : sanitize(values.seller_id),
        quotation_type:
          values.quotation_type === NO_QUOTATION_TYPE_VALUE
            ? null
            : (values.quotation_type as Quotation["quotation_type"]),
        coverage_start: null,
        coverage_end: null,
        coverages: null,
        deductible_pref: null,
        due_date: null,
        seller_notes: null,
      },
      {
        onSuccess: (quotation) => {
          onCreated(quotation);
        },
        onError: (error) => {
          toast.error(error.message || "Não foi possível criar a cotação");
        },
      },
    );
  }

  return (
    <form id="quotation-wizard-step-1" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
        <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Seleção de cliente
        </p>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="client_id">Cliente *</Label>
          <Controller
            name="client_id"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="client_id" className="w-full">
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients?.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.legal_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.client_id && (
            <p className="text-sm text-destructive">{errors.client_id.message}</p>
          )}
        </div>

        {!isSeller && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="seller_id">Vendedor responsável</Label>
            <Controller
              name="seller_id"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="seller_id" className="w-full">
                    <SelectValue placeholder="Selecione um vendedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {sellers.map((seller) => (
                      <SelectItem key={seller.id} value={seller.id}>
                        {seller.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="quotation_type">Tipo</Label>
          <Controller
            name="quotation_type"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="quotation_type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_QUOTATION_TYPE_VALUE}>Não informado</SelectItem>
                  <SelectItem value="new">Novo</SelectItem>
                  <SelectItem value="renewal">Renovação</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>
    </form>
  );
}

function StepClosing({ quotation, onSaved }: { quotation: Quotation; onSaved: () => void }) {
  const updateQuotation = useUpdateQuotation();

  const { register, handleSubmit, control } = useForm<QuotationStep4FormValues>({
    resolver: zodResolver(quotationStep4Schema),
    defaultValues: {
      coverage_start: quotation.coverage_start
        ? new Date(`${quotation.coverage_start}T00:00:00`)
        : null,
      coverage_end: quotation.coverage_end ? new Date(`${quotation.coverage_end}T00:00:00`) : null,
      coverages: quotation.coverages?.join(", ") ?? "",
      deductible_pref: quotation.deductible_pref ?? "",
      due_date: quotation.due_date ? new Date(`${quotation.due_date}T00:00:00`) : null,
      seller_notes: quotation.seller_notes ?? "",
    },
  });

  function onSubmit(values: QuotationStep4FormValues) {
    updateQuotation.mutate(
      {
        id: quotation.id,
        seller_id: quotation.seller_id,
        quotation_type: quotation.quotation_type,
        coverage_start: toDateOnly(values.coverage_start),
        coverage_end: toDateOnly(values.coverage_end),
        coverages: values.coverages
          ? values.coverages
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : null,
        deductible_pref: sanitize(values.deductible_pref),
        due_date: toDateOnly(values.due_date),
        seller_notes: sanitize(values.seller_notes),
      },
      {
        onSuccess: () => {
          onSaved();
        },
        onError: (error) => {
          toast.error(error.message || "Não foi possível salvar os dados de fechamento");
        },
      },
    );
  }

  return (
    <form
      id="quotation-wizard-step-4"
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
        <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Cobertura pretendida
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="coverage_start">Início da cobertura</Label>
            <Controller
              name="coverage_start"
              control={control}
              render={({ field }) => (
                <DatePicker id="coverage_start" value={field.value} onChange={field.onChange} />
              )}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="coverage_end">Fim da cobertura</Label>
            <Controller
              name="coverage_end"
              control={control}
              render={({ field }) => (
                <DatePicker id="coverage_end" value={field.value} onChange={field.onChange} />
              )}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="coverages">Coberturas desejadas</Label>
            <Input id="coverages" placeholder="Separadas por vírgula" {...register("coverages")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="deductible_pref">Preferência de franquia</Label>
            <Input id="deductible_pref" {...register("deductible_pref")} />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
        <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Prazo e observações
        </p>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="due_date">Prazo pra fechar</Label>
          <Controller
            name="due_date"
            control={control}
            render={({ field }) => (
              <DatePicker id="due_date" value={field.value} onChange={field.onChange} />
            )}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="seller_notes">Observações do vendedor</Label>
          <Textarea id="seller_notes" rows={4} {...register("seller_notes")} />
        </div>
      </div>
    </form>
  );
}

export function CreateQuotationWizard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const createQuotation = useCreateQuotation();
  const updateQuotation = useUpdateQuotation();

  function goToDestination() {
    navigate(searchParams.get("return_to") || "/quotations");
  }

  function handleOpenChange(open: boolean) {
    if (open) return;
    if (quotation) {
      toast.success("Cotação salva — você pode continuar de onde parou quando quiser");
    }
    goToDestination();
  }

  function handleCreated(created: Quotation) {
    setQuotation(created);
    setStep(2);
  }

  function handleFinished() {
    toast.success("Cotação criada com sucesso");
    navigate(searchParams.get("return_to") || `/quotations/${quotation!.id}`);
  }

  const stepLabel = STEPS[step - 1].label;

  return (
    <Sheet open onOpenChange={handleOpenChange}>
      <SheetContent>
        <SheetHeader className="gap-3">
          <div>
            <SheetTitle>Nova cotação</SheetTitle>
            <SheetDescription>{`Passo ${step} de ${STEPS.length} — ${stepLabel}`}</SheetDescription>
          </div>
          <StepIndicator currentStep={step} />
        </SheetHeader>

        <div className="flex-1 min-h-0 overflow-y-auto bg-background">
          <div className="mx-auto w-full max-w-[720px] p-5">
            {step === 1 && <StepClient onCreated={handleCreated} />}
            {step === 2 && quotation && (
              <QuotationQarTab quotationId={quotation.id} clientId={quotation.client_id} />
            )}
            {step === 3 && quotation && <QuotationVehiclesTab quotation={quotation} />}
            {step === 4 && quotation && (
              <StepClosing quotation={quotation} onSaved={handleFinished} />
            )}
          </div>
        </div>

        <SheetFooter className="flex-row items-center justify-between">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>

          <div className="flex items-center gap-2">
            {/* Passo 1 não é revisitável: cliente é imutável depois de criada a
                cotação (mesma regra de update-quotation.ts), então "Voltar"
                só existe a partir do passo 3 pra não reabrir o formulário
                que criaria uma segunda cotação. */}
            {step > 2 && (
              <Button variant="outline" onClick={() => setStep((current) => current - 1)}>
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            )}

            {step === 1 && (
              <Button
                type="submit"
                form="quotation-wizard-step-1"
                disabled={createQuotation.isPending}
              >
                {createQuotation.isPending ? "Criando..." : "Próximo"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}

            {(step === 2 || step === 3) && (
              <Button onClick={() => setStep((current) => current + 1)}>
                Próximo
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}

            {step === 4 && (
              <Button
                type="submit"
                form="quotation-wizard-step-4"
                disabled={updateQuotation.isPending}
              >
                {updateQuotation.isPending ? "Salvando..." : "Concluir"}
              </Button>
            )}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
