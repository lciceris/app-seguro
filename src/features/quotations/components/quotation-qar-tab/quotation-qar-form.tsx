import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { useInsurers } from "@/features/insurers";
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
import { Switch } from "@/shared/components/ui/switch";

import { QUOTATION_TYPE_LABELS } from "../../constants/labels";
import { useUpsertQuotationQar } from "../../hooks/use-upsert-quotation-qar";
import type { QuotationQar } from "../../types/quotation";
import {
  NO_INSURANCE_TYPE_VALUE,
  NO_RENEWAL_INSURER_VALUE,
  quotationQarSchema,
  type QuotationQarFormValues,
} from "../../validations/quotation-qar-schema";

function sanitize(value: string | undefined) {
  return value === "" || value === undefined ? null : value;
}

function sanitizeNum(value: string | undefined) {
  return value === "" || value === undefined || Number.isNaN(Number(value)) ? null : Number(value);
}

function toDateOnly(date: Date | null) {
  return date ? date.toISOString().slice(0, 10) : null;
}

function fromDateOnly(value: string | null | undefined) {
  return value ? new Date(`${value}T00:00:00`) : null;
}

interface QuotationQarFormProps {
  quotationId: string;
  qar: QuotationQar | null | undefined;
  canManage: boolean;
}

export function QuotationQarForm({ quotationId, qar, canManage }: QuotationQarFormProps) {
  const { data: insurers } = useInsurers();
  const upsertQuotationQar = useUpsertQuotationQar();

  const { register, handleSubmit, control } = useForm<QuotationQarFormValues>({
    resolver: zodResolver(quotationQarSchema),
    defaultValues: {
      insurance_type: qar?.insurance_type ?? NO_INSURANCE_TYPE_VALUE,
      current_policy_expiry: fromDateOnly(qar?.current_policy_expiry),
      renewal_insurer_id: qar?.renewal_insurer_id ?? NO_RENEWAL_INSURER_VALUE,
      renewal_insurer_name: qar?.renewal_insurer_name ?? "",
      sinistralidade: qar?.sinistralidade ?? "",
      previous_premium: qar?.previous_premium?.toString() ?? "",
      desired_premium: qar?.desired_premium?.toString() ?? "",
      has_risk_management: qar?.has_risk_management ?? false,
      has_preventive_maintenance: qar?.has_preventive_maintenance ?? false,
      has_logo_or_special_paint: qar?.has_logo_or_special_paint ?? false,
      has_defensive_driving: qar?.has_defensive_driving ?? false,
      has_tracker: qar?.has_tracker ?? false,
      has_cargo: qar?.has_cargo ?? false,
      cargo_category: qar?.cargo_category ?? "",
      cargo_type: qar?.cargo_type ?? "",
      circulation_regions: qar?.circulation_regions?.join(", ") ?? "",
    },
  });

  function onSubmit(values: QuotationQarFormValues) {
    upsertQuotationQar.mutate(
      {
        quotation_id: quotationId,
        insurance_type:
          values.insurance_type === NO_INSURANCE_TYPE_VALUE
            ? null
            : (values.insurance_type as QuotationQar["insurance_type"]),
        current_policy_expiry: toDateOnly(values.current_policy_expiry),
        renewal_insurer_id:
          values.renewal_insurer_id === NO_RENEWAL_INSURER_VALUE ? null : values.renewal_insurer_id,
        renewal_insurer_name: sanitize(values.renewal_insurer_name),
        sinistralidade: sanitize(values.sinistralidade),
        previous_premium: sanitizeNum(values.previous_premium),
        desired_premium: sanitizeNum(values.desired_premium),
        has_risk_management: values.has_risk_management,
        has_preventive_maintenance: values.has_preventive_maintenance,
        has_logo_or_special_paint: values.has_logo_or_special_paint,
        has_defensive_driving: values.has_defensive_driving,
        has_tracker: values.has_tracker,
        has_cargo: values.has_cargo,
        cargo_category: sanitize(values.cargo_category),
        cargo_type: sanitize(values.cargo_type),
        circulation_regions: values.circulation_regions
          ? values.circulation_regions
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : null,
      },
      {
        onSuccess: () => toast.success("QAR salvo com sucesso"),
        onError: (error) => toast.error(error.message || "Não foi possível salvar o QAR"),
      },
    );
  }

  return (
    <fieldset disabled={!canManage} className="flex flex-col gap-4">
      <form
        id="quotation-qar-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Tipo e renovação
          </p>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="insurance_type">Tipo</Label>
            <Controller
              name="insurance_type"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={!canManage}>
                  <SelectTrigger id="insurance_type" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_INSURANCE_TYPE_VALUE}>Não informado</SelectItem>
                    {Object.entries(QUOTATION_TYPE_LABELS).map(([value, label]) => (
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
            <Label htmlFor="current_policy_expiry">Vencimento da apólice atual</Label>
            <Controller
              name="current_policy_expiry"
              control={control}
              render={({ field }) => (
                <DatePicker
                  id="current_policy_expiry"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="renewal_insurer_id">Seguradora atual (cadastrada)</Label>
            <Controller
              name="renewal_insurer_id"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={!canManage}>
                  <SelectTrigger id="renewal_insurer_id" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_RENEWAL_INSURER_VALUE}>Não informado</SelectItem>
                    {insurers?.map((insurer) => (
                      <SelectItem key={insurer.id} value={insurer.id}>
                        {insurer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="renewal_insurer_name">Seguradora atual (nome livre)</Label>
            <Input
              id="renewal_insurer_name"
              placeholder="Preencha se a seguradora não está cadastrada"
              {...register("renewal_insurer_name")}
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Sinistralidade e prêmios
          </p>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sinistralidade">Sinistralidade</Label>
            <Input id="sinistralidade" {...register("sinistralidade")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="previous_premium">Prêmio anterior (R$)</Label>
            <Input
              id="previous_premium"
              type="number"
              step="0.01"
              {...register("previous_premium")}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="desired_premium">Prêmio desejado (R$)</Label>
            <Input
              id="desired_premium"
              type="number"
              step="0.01"
              {...register("desired_premium")}
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Flags de risco
          </p>

          <div className="flex items-center justify-between">
            <Label htmlFor="has_risk_management">Gestão de risco</Label>
            <Controller
              name="has_risk_management"
              control={control}
              render={({ field }) => (
                <Switch
                  id="has_risk_management"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={!canManage}
                />
              )}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="has_preventive_maintenance">Manutenção preventiva</Label>
            <Controller
              name="has_preventive_maintenance"
              control={control}
              render={({ field }) => (
                <Switch
                  id="has_preventive_maintenance"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={!canManage}
                />
              )}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="has_logo_or_special_paint">Logo ou pintura especial</Label>
            <Controller
              name="has_logo_or_special_paint"
              control={control}
              render={({ field }) => (
                <Switch
                  id="has_logo_or_special_paint"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={!canManage}
                />
              )}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="has_defensive_driving">Direção defensiva</Label>
            <Controller
              name="has_defensive_driving"
              control={control}
              render={({ field }) => (
                <Switch
                  id="has_defensive_driving"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={!canManage}
                />
              )}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="has_tracker">Rastreador</Label>
            <Controller
              name="has_tracker"
              control={control}
              render={({ field }) => (
                <Switch
                  id="has_tracker"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={!canManage}
                />
              )}
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Transporte de carga
          </p>

          <div className="flex items-center justify-between">
            <Label htmlFor="has_cargo">Transporta carga</Label>
            <Controller
              name="has_cargo"
              control={control}
              render={({ field }) => (
                <Switch
                  id="has_cargo"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={!canManage}
                />
              )}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cargo_category">Categoria da carga</Label>
            <Input id="cargo_category" {...register("cargo_category")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cargo_type">Tipo da carga</Label>
            <Input id="cargo_type" {...register("cargo_type")} />
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Regiões de circulação
          </p>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="circulation_regions">Regiões</Label>
            <Input
              id="circulation_regions"
              placeholder="Separadas por vírgula"
              {...register("circulation_regions")}
            />
          </div>
        </div>
      </form>

      {canManage && (
        <div className="flex justify-end">
          <Button type="submit" form="quotation-qar-form" disabled={upsertQuotationQar.isPending}>
            {upsertQuotationQar.isPending ? "Salvando..." : "Salvar QAR"}
          </Button>
        </div>
      )}
    </fieldset>
  );
}
