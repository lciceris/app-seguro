import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { useAuthStore } from "@/features/auth";
import {
  COVERAGE_TYPE_LABELS,
  FRANCHISE_TYPE_LABELS,
  GLASS_COVERAGE_LEVEL_LABELS,
  NO_COVERAGE_TYPE_VALUE,
  NO_FRANCHISE_TYPE_VALUE,
  NO_GLASS_COVERAGE_VALUE,
} from "@/features/quotations";
import { usePolicy } from "@/features/policies";
import { useVehicles } from "@/features/vehicles";
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
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";
import { Textarea } from "@/shared/components/ui/textarea";

import { POLICY_ENDORSEMENT_TYPE_LABELS } from "../../constants/labels";
import { useCreatePolicyEndorsement } from "../../hooks/use-create-policy-endorsement";
import { usePolicyVehicles } from "../../hooks/use-policy-vehicles";
import type { CreatePolicyEndorsementInput } from "../../api/create-policy-endorsement";
import {
  createPolicyEndorsementSchema,
  NO_VEHICLE_VALUE,
  type CreatePolicyEndorsementFormValues,
} from "../../validations/create-policy-endorsement-schema";

const VEHICLE_TYPES = new Set(["vehicle_inclusion", "vehicle_exclusion", "coverage_change"]);
const COVERAGE_TYPES = new Set(["vehicle_inclusion", "coverage_change"]);

function sanitize(value: string | undefined) {
  return value === "" || value === undefined ? null : value;
}

function sanitizeNum(value: string | undefined) {
  return value === "" || value === undefined || Number.isNaN(Number(value)) ? null : Number(value);
}

function toDateOnly(date: Date | null) {
  return date ? date.toISOString().slice(0, 10) : null;
}

function toPayload(
  values: CreatePolicyEndorsementFormValues,
  policyId: string,
  brokerageId: string,
  sellerId: string,
): CreatePolicyEndorsementInput {
  const hasVehicle = VEHICLE_TYPES.has(values.endorsement_type);
  const hasCoverage = COVERAGE_TYPES.has(values.endorsement_type);

  return {
    brokerage_id: brokerageId,
    policy_id: policyId,
    endorsement_type: values.endorsement_type,
    seller_id: sellerId,
    description: sanitize(values.description),
    vehicle_id: hasVehicle && values.vehicle_id !== NO_VEHICLE_VALUE ? values.vehicle_id : null,
    coverage_type:
      hasCoverage && values.coverage_type !== NO_COVERAGE_TYPE_VALUE
        ? (values.coverage_type as CreatePolicyEndorsementInput["coverage_type"])
        : null,
    casco_percentage: hasCoverage ? sanitizeNum(values.casco_percentage) : null,
    casco_value: hasCoverage ? sanitizeNum(values.casco_value) : null,
    franchise_type:
      hasCoverage && values.franchise_type !== NO_FRANCHISE_TYPE_VALUE
        ? (values.franchise_type as CreatePolicyEndorsementInput["franchise_type"])
        : null,
    bonus: hasCoverage ? sanitizeNum(values.bonus) : null,
    claims_count: hasCoverage ? sanitizeNum(values.claims_count) : null,
    rcf_dm: hasCoverage ? sanitizeNum(values.rcf_dm) : null,
    rcf_dc: hasCoverage ? sanitizeNum(values.rcf_dc) : null,
    rcf_dmo: hasCoverage ? sanitizeNum(values.rcf_dmo) : null,
    app_death: hasCoverage ? sanitizeNum(values.app_death) : null,
    app_disability: hasCoverage ? sanitizeNum(values.app_disability) : null,
    assistance: hasCoverage ? sanitize(values.assistance) : null,
    glass_coverage:
      hasCoverage && values.glass_coverage !== NO_GLASS_COVERAGE_VALUE
        ? (values.glass_coverage as CreatePolicyEndorsementInput["glass_coverage"])
        : null,
    reserve_car: hasCoverage ? sanitize(values.reserve_car) : null,
    bodywork_value: hasCoverage ? sanitizeNum(values.bodywork_value) : null,
    bodywork_type: hasCoverage ? sanitize(values.bodywork_type) : null,
    equipment_value: hasCoverage ? sanitizeNum(values.equipment_value) : null,
    equipment_type: hasCoverage ? sanitize(values.equipment_type) : null,
    armoring_value: hasCoverage ? sanitizeNum(values.armoring_value) : null,
    new_coverage_start:
      values.endorsement_type === "administrative_correction"
        ? toDateOnly(values.new_coverage_start)
        : null,
    new_coverage_end:
      values.endorsement_type === "extension" ||
      values.endorsement_type === "administrative_correction"
        ? toDateOnly(values.new_coverage_end)
        : null,
    new_policy_number:
      values.endorsement_type === "administrative_correction"
        ? sanitize(values.new_policy_number)
        : null,
    new_premium_amount:
      values.endorsement_type === "administrative_correction"
        ? sanitizeNum(values.new_premium_amount)
        : null,
    new_total_fleet_value:
      values.endorsement_type === "administrative_correction"
        ? sanitizeNum(values.new_total_fleet_value)
        : null,
  };
}

export function CreatePolicyEndorsementDrawer() {
  const navigate = useNavigate();
  const { policyId } = useParams<{ policyId: string }>();
  const usuario = useAuthStore((state) => state.usuario);
  const { data: policy } = usePolicy(policyId!);
  const { data: allVehicles } = useVehicles();
  const { data: policyVehicles } = usePolicyVehicles(policyId!);
  const createPolicyEndorsement = useCreatePolicyEndorsement();

  const coveredVehicleIds = useMemo(
    () => new Set((policyVehicles ?? []).map((item) => item.vehicle_id)),
    [policyVehicles],
  );

  const inclusionCandidates = useMemo(
    () =>
      (allVehicles ?? []).filter(
        (vehicle) => vehicle.client_id === policy?.client_id && !coveredVehicleIds.has(vehicle.id),
      ),
    [allVehicles, policy?.client_id, coveredVehicleIds],
  );

  function handleClose() {
    navigate(`/policies/${policyId}`);
  }

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<CreatePolicyEndorsementFormValues>({
    resolver: zodResolver(createPolicyEndorsementSchema),
    defaultValues: {
      endorsement_type: "vehicle_inclusion",
      description: "",
      vehicle_id: NO_VEHICLE_VALUE,
      coverage_type: NO_COVERAGE_TYPE_VALUE,
      franchise_type: NO_FRANCHISE_TYPE_VALUE,
      glass_coverage: NO_GLASS_COVERAGE_VALUE,
      new_coverage_start: null,
      new_coverage_end: null,
    },
  });

  const endorsementType = watch("endorsement_type");

  function onSubmit(values: CreatePolicyEndorsementFormValues) {
    if (!policyId || !usuario) return;

    createPolicyEndorsement.mutate(toPayload(values, policyId, usuario.brokerage_id, usuario.id), {
      onSuccess: () => {
        toast.success("Endosso aberto com sucesso");
        handleClose();
      },
      onError: (error) => {
        toast.error(error.message || "Não foi possível abrir o endosso");
      },
    });
  }

  return (
    <Sheet open onOpenChange={(open) => !open && handleClose()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Abrir endosso — {policy?.policy_number ?? "Apólice"}</SheetTitle>
        </SheetHeader>

        <form
          id="create-policy-endorsement-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-1 flex-col gap-4 overflow-y-auto p-5"
        >
          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Tipo de endosso
            </p>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="endorsement_type">Tipo</Label>
              <Controller
                name="endorsement_type"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="endorsement_type" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(POLICY_ENDORSEMENT_TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {endorsementType === "vehicle_inclusion" && (
            <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
              <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Veículo
              </p>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="vehicle_id">Veículo do cliente</Label>
                <Controller
                  name="vehicle_id"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="vehicle_id" className="w-full">
                        <SelectValue placeholder="Selecione um veículo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NO_VEHICLE_VALUE} disabled>
                          Selecione um veículo
                        </SelectItem>
                        {inclusionCandidates.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.plate} —{" "}
                            {[vehicle.brand, vehicle.model].filter(Boolean).join(" ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.vehicle_id && (
                  <p className="text-sm text-destructive">{errors.vehicle_id.message}</p>
                )}
              </div>
            </div>
          )}

          {(endorsementType === "vehicle_exclusion" || endorsementType === "coverage_change") && (
            <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
              <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Veículo
              </p>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="vehicle_id">Veículo coberto</Label>
                <Controller
                  name="vehicle_id"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="vehicle_id" className="w-full">
                        <SelectValue placeholder="Selecione um veículo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NO_VEHICLE_VALUE} disabled>
                          Selecione um veículo
                        </SelectItem>
                        {(policyVehicles ?? []).map((policyVehicle) => (
                          <SelectItem
                            key={policyVehicle.vehicle_id}
                            value={policyVehicle.vehicle_id}
                          >
                            {policyVehicle.vehicles?.plate ?? "—"} —{" "}
                            {[policyVehicle.vehicles?.brand, policyVehicle.vehicles?.model]
                              .filter(Boolean)
                              .join(" ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.vehicle_id && (
                  <p className="text-sm text-destructive">{errors.vehicle_id.message}</p>
                )}
              </div>
            </div>
          )}

          {(endorsementType === "vehicle_inclusion" || endorsementType === "coverage_change") && (
            <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
              <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Cobertura
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 flex flex-col gap-1.5">
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
                  <Label htmlFor="casco_value">Valor de casco (R$)</Label>
                  <Input id="casco_value" type="number" step="0.01" {...register("casco_value")} />
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

                <div className="col-span-2 flex flex-col gap-1.5">
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

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="assistance">Assistência 24h</Label>
                  <Input id="assistance" {...register("assistance")} />
                </div>

                <div className="col-span-2 flex flex-col gap-1.5">
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
          )}

          {endorsementType === "extension" && (
            <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
              <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Prorrogação
              </p>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="new_coverage_end">Nova data de fim de vigência</Label>
                <Controller
                  name="new_coverage_end"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      id="new_coverage_end"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                {errors.new_coverage_end && (
                  <p className="text-sm text-destructive">{errors.new_coverage_end.message}</p>
                )}
              </div>
            </div>
          )}

          {endorsementType === "administrative_correction" && (
            <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
              <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Correção administrativa
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 flex flex-col gap-1.5">
                  <Label htmlFor="new_policy_number">Novo número da apólice</Label>
                  <Input id="new_policy_number" {...register("new_policy_number")} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="new_premium_amount">Novo prêmio (R$)</Label>
                  <Input
                    id="new_premium_amount"
                    type="number"
                    step="0.01"
                    {...register("new_premium_amount")}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="new_total_fleet_value">Novo valor total da frota (R$)</Label>
                  <Input
                    id="new_total_fleet_value"
                    type="number"
                    step="0.01"
                    {...register("new_total_fleet_value")}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="new_coverage_start">Novo início de vigência</Label>
                  <Controller
                    name="new_coverage_start"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        id="new_coverage_start"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="new_coverage_end">Novo fim de vigência</Label>
                  <Controller
                    name="new_coverage_end"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        id="new_coverage_end"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          )}

          {(endorsementType === "administrative_correction" ||
            endorsementType === "cancellation") && (
            <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
              <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Motivo
              </p>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="description">Descrição</Label>
                <Textarea id="description" rows={4} {...register("description")} />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description.message}</p>
                )}
              </div>
            </div>
          )}
        </form>

        <SheetFooter className="flex-row justify-end border-t border-border bg-card">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="create-policy-endorsement-form"
            disabled={createPolicyEndorsement.isPending}
          >
            {createPolicyEndorsement.isPending ? "Abrindo..." : "Abrir endosso"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
