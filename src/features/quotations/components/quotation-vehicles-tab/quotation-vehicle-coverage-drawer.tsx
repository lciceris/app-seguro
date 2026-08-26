import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

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

import {
  COVERAGE_TYPE_LABELS,
  FRANCHISE_TYPE_LABELS,
  GLASS_COVERAGE_LEVEL_LABELS,
} from "../../constants/labels";
import { useUpdateQuotationVehicle } from "../../hooks/use-update-quotation-vehicle";
import type { QuotationVehicleWithVehicle } from "../../types/quotation";
import {
  NO_COVERAGE_TYPE_VALUE,
  NO_FRANCHISE_TYPE_VALUE,
  NO_GLASS_COVERAGE_VALUE,
  quotationVehicleCoverageSchema,
  type QuotationVehicleCoverageFormValues,
} from "../../validations/quotation-vehicle-coverage-schema";

function sanitize(value: string | undefined) {
  return value === "" || value === undefined ? null : value;
}

function sanitizeNum(value: string | undefined) {
  return value === "" || value === undefined || Number.isNaN(Number(value)) ? null : Number(value);
}

interface QuotationVehicleCoverageDrawerProps {
  quotationVehicle: QuotationVehicleWithVehicle | null;
  onOpenChange: (open: boolean) => void;
}

export function QuotationVehicleCoverageDrawer({
  quotationVehicle,
  onOpenChange,
}: QuotationVehicleCoverageDrawerProps) {
  const updateQuotationVehicle = useUpdateQuotationVehicle();

  return (
    <Sheet open={quotationVehicle !== null} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Cobertura — {quotationVehicle?.vehicles?.plate ?? "Veículo"}</SheetTitle>
        </SheetHeader>

        {quotationVehicle && (
          <CoverageForm
            quotationVehicle={quotationVehicle}
            isPending={updateQuotationVehicle.isPending}
            onSubmit={(values) => {
              updateQuotationVehicle.mutate(
                {
                  quotation_id: quotationVehicle.quotation_id,
                  vehicle_id: quotationVehicle.vehicle_id,
                  coverage_type:
                    values.coverage_type === NO_COVERAGE_TYPE_VALUE
                      ? null
                      : (values.coverage_type as QuotationVehicleWithVehicle["coverage_type"]),
                  casco_percentage: sanitizeNum(values.casco_percentage),
                  casco_value: sanitizeNum(values.casco_value),
                  franchise_type:
                    values.franchise_type === NO_FRANCHISE_TYPE_VALUE
                      ? null
                      : (values.franchise_type as QuotationVehicleWithVehicle["franchise_type"]),
                  bonus: sanitizeNum(values.bonus),
                  claims_count: sanitizeNum(values.claims_count),
                  rcf_dm: sanitizeNum(values.rcf_dm),
                  rcf_dc: sanitizeNum(values.rcf_dc),
                  rcf_dmo: sanitizeNum(values.rcf_dmo),
                  app_death: sanitizeNum(values.app_death),
                  app_disability: sanitizeNum(values.app_disability),
                  assistance: sanitize(values.assistance),
                  glass_coverage:
                    values.glass_coverage === NO_GLASS_COVERAGE_VALUE
                      ? null
                      : (values.glass_coverage as QuotationVehicleWithVehicle["glass_coverage"]),
                  reserve_car: sanitize(values.reserve_car),
                  bodywork_value: sanitizeNum(values.bodywork_value),
                  bodywork_type: sanitize(values.bodywork_type),
                  equipment_value: sanitizeNum(values.equipment_value),
                  equipment_type: sanitize(values.equipment_type),
                  armoring_value: sanitizeNum(values.armoring_value),
                },
                {
                  onSuccess: () => {
                    toast.success("Cobertura atualizada com sucesso");
                    onOpenChange(false);
                  },
                  onError: (error) => {
                    toast.error(error.message || "Não foi possível atualizar a cobertura");
                  },
                },
              );
            }}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

function CoverageForm({
  quotationVehicle,
  isPending,
  onSubmit,
  onCancel,
}: {
  quotationVehicle: QuotationVehicleWithVehicle;
  isPending: boolean;
  onSubmit: (values: QuotationVehicleCoverageFormValues) => void;
  onCancel: () => void;
}) {
  const { register, handleSubmit, control } = useForm<QuotationVehicleCoverageFormValues>({
    resolver: zodResolver(quotationVehicleCoverageSchema),
    defaultValues: {
      coverage_type: quotationVehicle.coverage_type ?? NO_COVERAGE_TYPE_VALUE,
      casco_percentage: quotationVehicle.casco_percentage?.toString() ?? "",
      casco_value: quotationVehicle.casco_value?.toString() ?? "",
      franchise_type: quotationVehicle.franchise_type ?? NO_FRANCHISE_TYPE_VALUE,
      bonus: quotationVehicle.bonus?.toString() ?? "",
      claims_count: quotationVehicle.claims_count?.toString() ?? "",
      rcf_dm: quotationVehicle.rcf_dm?.toString() ?? "",
      rcf_dc: quotationVehicle.rcf_dc?.toString() ?? "",
      rcf_dmo: quotationVehicle.rcf_dmo?.toString() ?? "",
      app_death: quotationVehicle.app_death?.toString() ?? "",
      app_disability: quotationVehicle.app_disability?.toString() ?? "",
      assistance: quotationVehicle.assistance ?? "",
      glass_coverage: quotationVehicle.glass_coverage ?? NO_GLASS_COVERAGE_VALUE,
      reserve_car: quotationVehicle.reserve_car ?? "",
      bodywork_value: quotationVehicle.bodywork_value?.toString() ?? "",
      bodywork_type: quotationVehicle.bodywork_type ?? "",
      equipment_value: quotationVehicle.equipment_value?.toString() ?? "",
      equipment_type: quotationVehicle.equipment_type ?? "",
      armoring_value: quotationVehicle.armoring_value?.toString() ?? "",
    },
  });

  return (
    <>
      <form
        id="quotation-vehicle-coverage-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex-1 min-h-0 overflow-y-auto bg-background"
      >
        <div className="mx-auto flex w-full max-w-[720px] flex-col gap-4 p-5">
          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Cobertura geral
            </p>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="coverage_type">Tipo de cobertura</Label>
              <Controller
                name="coverage_type"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="coverage_type" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_COVERAGE_TYPE_VALUE}>Não informado</SelectItem>
                      {Object.entries(COVERAGE_TYPE_LABELS).map(([value, label]) => (
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
              <Label htmlFor="casco_percentage">Percentual de casco (%)</Label>
              <Input
                id="casco_percentage"
                type="number"
                step="0.01"
                {...register("casco_percentage")}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="casco_value">Valor de casco (R$)</Label>
              <Input id="casco_value" type="number" step="0.01" {...register("casco_value")} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="franchise_type">Tipo de franquia</Label>
              <Controller
                name="franchise_type"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="franchise_type" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_FRANCHISE_TYPE_VALUE}>Não informado</SelectItem>
                      {Object.entries(FRANCHISE_TYPE_LABELS).map(([value, label]) => (
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
              <Label htmlFor="bonus">Bônus (%)</Label>
              <Input id="bonus" type="number" step="0.01" {...register("bonus")} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="claims_count">Quantidade de sinistros</Label>
              <Input id="claims_count" type="number" {...register("claims_count")} />
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              RCF e APP
            </p>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="rcf_dm">RCF — Danos materiais (R$)</Label>
              <Input id="rcf_dm" type="number" step="0.01" {...register("rcf_dm")} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="rcf_dc">RCF — Danos corporais (R$)</Label>
              <Input id="rcf_dc" type="number" step="0.01" {...register("rcf_dc")} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="rcf_dmo">RCF — Danos morais (R$)</Label>
              <Input id="rcf_dmo" type="number" step="0.01" {...register("rcf_dmo")} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="app_death">APP — Morte por passageiro (R$)</Label>
              <Input id="app_death" type="number" step="0.01" {...register("app_death")} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="app_disability">APP — Invalidez por passageiro (R$)</Label>
              <Input
                id="app_disability"
                type="number"
                step="0.01"
                {...register("app_disability")}
              />
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Assistência e acessórios
            </p>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="assistance">Assistência 24h</Label>
              <Input id="assistance" {...register("assistance")} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="glass_coverage">Cobertura de vidros</Label>
              <Controller
                name="glass_coverage"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="glass_coverage" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_GLASS_COVERAGE_VALUE}>Não informado</SelectItem>
                      {Object.entries(GLASS_COVERAGE_LEVEL_LABELS).map(([value, label]) => (
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
              <Label htmlFor="reserve_car">Carro reserva</Label>
              <Input id="reserve_car" {...register("reserve_car")} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bodywork_value">Valor da blindagem (R$)</Label>
              <Input
                id="bodywork_value"
                type="number"
                step="0.01"
                {...register("bodywork_value")}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bodywork_type">Tipo de blindagem</Label>
              <Input id="bodywork_type" {...register("bodywork_type")} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="equipment_value">Valor de equipamentos (R$)</Label>
              <Input
                id="equipment_value"
                type="number"
                step="0.01"
                {...register("equipment_value")}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="equipment_type">Tipo de equipamentos</Label>
              <Input id="equipment_type" {...register("equipment_type")} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="armoring_value">Valor de armamento (R$)</Label>
              <Input
                id="armoring_value"
                type="number"
                step="0.01"
                {...register("armoring_value")}
              />
            </div>
          </div>
        </div>
      </form>

      <SheetFooter className="flex-row justify-end">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" form="quotation-vehicle-coverage-form" disabled={isPending}>
          {isPending ? "Salvando..." : "Salvar"}
        </Button>
      </SheetFooter>
    </>
  );
}
