import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useClients } from "@/features/clients";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
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

import { VEHICLE_TYPE_LABELS, VEHICLE_USAGE_LABELS } from "../../constants/labels";
import { useCreateVehicle } from "../../hooks/use-create-vehicle";
import type { CreateVehicleInput } from "../../api/create-vehicle";
import {
  createVehicleSchema,
  NO_VEHICLE_TYPE_VALUE,
  NO_VEHICLE_USAGE_VALUE,
  type CreateVehicleFormValues,
} from "../../validations/create-vehicle-schema";

function sanitize(value: string | undefined) {
  return value === "" || value === undefined ? null : value;
}

function sanitizeNum(value: string | undefined) {
  return value === "" || value === undefined || Number.isNaN(Number(value)) ? null : Number(value);
}

function paraPayload(values: CreateVehicleFormValues): Omit<CreateVehicleInput, "brokerage_id"> {
  return {
    client_id: values.client_id,
    plate: values.plate,
    chassis: sanitize(values.chassis),
    identification_code: sanitize(values.identification_code),
    renavam: sanitize(values.renavam),
    brand: sanitize(values.brand),
    model: sanitize(values.model),
    manufacture_year: sanitizeNum(values.manufacture_year),
    model_year: sanitizeNum(values.model_year),
    vehicle_type:
      values.vehicle_type === NO_VEHICLE_TYPE_VALUE
        ? null
        : (values.vehicle_type as CreateVehicleInput["vehicle_type"]),
    vehicle_usage:
      values.vehicle_usage === NO_VEHICLE_USAGE_VALUE
        ? null
        : (values.vehicle_usage as CreateVehicleInput["vehicle_usage"]),
    fuel_type: sanitize(values.fuel_type),
    fipe_code: sanitize(values.fipe_code),
    fipe_value: sanitizeNum(values.fipe_value),
    declared_value: sanitizeNum(values.declared_value),
    overnight_zip_code: sanitize(values.overnight_zip_code),
    main_state: sanitize(values.main_state),
    has_tracker: values.has_tracker,
    tracker_model: sanitize(values.tracker_model),
    accessories: sanitize(values.accessories),
    main_driver: sanitize(values.main_driver),
    has_claim_history: values.has_claim_history,
    notes: sanitize(values.notes),
  };
}

export function CreateVehicleDrawer() {
  const navigate = useNavigate();
  const createVehicle = useCreateVehicle();
  const { data: clients } = useClients();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateVehicleFormValues>({
    resolver: zodResolver(createVehicleSchema),
    defaultValues: {
      client_id: "",
      vehicle_type: NO_VEHICLE_TYPE_VALUE,
      vehicle_usage: NO_VEHICLE_USAGE_VALUE,
      has_tracker: false,
      has_claim_history: false,
    },
  });

  function handleClose() {
    navigate("/vehicles");
  }

  function onSubmit(values: CreateVehicleFormValues) {
    createVehicle.mutate(paraPayload(values), {
      onSuccess: () => {
        toast.success("Veículo criado com sucesso");
        handleClose();
      },
      onError: (error) => {
        toast.error(error.message || "Não foi possível criar o veículo");
      },
    });
  }

  return (
    <Sheet open onOpenChange={(open) => !open && handleClose()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Novo veículo</SheetTitle>
        </SheetHeader>

        <form
          id="create-vehicle-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-1 flex-col gap-4 overflow-y-auto bg-muted p-5"
        >
          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Identificação
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 flex flex-col gap-1.5">
                <Label htmlFor="client_id">Cliente</Label>
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

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="plate">Placa</Label>
                <Input id="plate" {...register("plate")} />
                {errors.plate && <p className="text-sm text-destructive">{errors.plate.message}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="chassis">Chassi</Label>
                <Input id="chassis" {...register("chassis")} />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="identification_code">Código de identificação</Label>
                <Input id="identification_code" {...register("identification_code")} />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="renavam">RENAVAM</Label>
                <Input id="renavam" {...register("renavam")} />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="brand">Marca</Label>
                <Input id="brand" {...register("brand")} />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="model">Modelo</Label>
                <Input id="model" {...register("model")} />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="manufacture_year">Ano de fabricação</Label>
                <Input id="manufacture_year" type="number" {...register("manufacture_year")} />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="model_year">Ano do modelo</Label>
                <Input id="model_year" type="number" {...register("model_year")} />
              </div>

              <div className="col-span-2 flex flex-col gap-1.5">
                <Label htmlFor="vehicle_type">Tipo</Label>
                <Controller
                  name="vehicle_type"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="vehicle_type" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NO_VEHICLE_TYPE_VALUE}>Não informado</SelectItem>
                        {Object.entries(VEHICLE_TYPE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="col-span-2 flex flex-col gap-1.5">
                <Label htmlFor="vehicle_usage">Uso</Label>
                <Controller
                  name="vehicle_usage"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="vehicle_usage" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NO_VEHICLE_USAGE_VALUE}>Não informado</SelectItem>
                        {Object.entries(VEHICLE_USAGE_LABELS).map(([value, label]) => (
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
                <Label htmlFor="fuel_type">Combustível</Label>
                <Input id="fuel_type" {...register("fuel_type")} />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Valores
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="fipe_code">Código FIPE</Label>
                <Input id="fipe_code" {...register("fipe_code")} />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="fipe_value">Valor FIPE (R$)</Label>
                <Input id="fipe_value" type="number" step="0.01" {...register("fipe_value")} />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="declared_value">Valor declarado (R$)</Label>
                <Input
                  id="declared_value"
                  type="number"
                  step="0.01"
                  {...register("declared_value")}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Circulação
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="overnight_zip_code">CEP de pernoite</Label>
                <Input id="overnight_zip_code" {...register("overnight_zip_code")} />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="main_state">UF principal</Label>
                <Input id="main_state" maxLength={2} {...register("main_state")} />
              </div>

              <div className="col-span-2 flex items-center gap-2">
                <Controller
                  name="has_tracker"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="has_tracker"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label htmlFor="has_tracker" className="font-normal">
                  Possui rastreador
                </Label>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="tracker_model">Modelo do rastreador</Label>
                <Input id="tracker_model" {...register("tracker_model")} />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="accessories">Acessórios</Label>
                <Input id="accessories" {...register("accessories")} />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="main_driver">Condutor principal</Label>
                <Input id="main_driver" {...register("main_driver")} />
              </div>

              <div className="col-span-2 flex items-center gap-2">
                <Controller
                  name="has_claim_history"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="has_claim_history"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label htmlFor="has_claim_history" className="font-normal">
                  Possui histórico de sinistro
                </Label>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Observações
            </p>

            <Textarea id="notes" rows={4} {...register("notes")} />
          </div>
        </form>

        <SheetFooter className="flex-row justify-end border-t border-border bg-card">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" form="create-vehicle-form" disabled={createVehicle.isPending}>
            {createVehicle.isPending ? "Criando..." : "Criar"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
