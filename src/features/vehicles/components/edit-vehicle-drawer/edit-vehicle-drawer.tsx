import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { useClients } from "@/features/clients";
import {
  formatCep,
  formatCurrencyInput,
  formatUf,
  formatYear,
  numberToCurrencyInput,
  parseCurrencyInput,
} from "@/shared/lib/masks";
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
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Switch } from "@/shared/components/ui/switch";
import { Textarea } from "@/shared/components/ui/textarea";

import { VEHICLE_TYPE_LABELS, VEHICLE_USAGE_LABELS } from "../../constants/labels";
import { useUpdateVehicle } from "../../hooks/use-update-vehicle";
import { useVehicle } from "../../hooks/use-vehicle";
import type { Vehicle } from "../../types/vehicle";
import {
  editVehicleSchema,
  NO_VEHICLE_TYPE_VALUE,
  NO_VEHICLE_USAGE_VALUE,
  type EditVehicleFormValues,
} from "../../validations/edit-vehicle-schema";

function sanitize(value: string | undefined) {
  return value === "" || value === undefined ? null : value;
}

function sanitizeNum(value: string | undefined) {
  return value === "" || value === undefined || Number.isNaN(Number(value)) ? null : Number(value);
}

function digitsOnly(value: string | undefined) {
  const digits = value?.replace(/\D/g, "") ?? "";
  return digits === "" ? null : digits;
}

// Formulário próprio, montado só quando `vehicle` já existe — os valores
// atuais viram `defaultValues` do useForm diretamente, mesmo padrão de
// edit-client-drawer/edit-insurer-drawer.
function EditVehicleForm({ vehicle, onSuccess }: { vehicle: Vehicle; onSuccess: () => void }) {
  const updateVehicle = useUpdateVehicle();
  const { data: clients } = useClients();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditVehicleFormValues>({
    resolver: zodResolver(editVehicleSchema),
    defaultValues: {
      client_id: vehicle.client_id,
      plate: vehicle.plate,
      chassis: vehicle.chassis ?? "",
      identification_code: vehicle.identification_code ?? "",
      renavam: vehicle.renavam ?? "",
      brand: vehicle.brand ?? "",
      model: vehicle.model ?? "",
      manufacture_year: vehicle.manufacture_year?.toString() ?? "",
      model_year: vehicle.model_year?.toString() ?? "",
      vehicle_type: vehicle.vehicle_type ?? NO_VEHICLE_TYPE_VALUE,
      vehicle_usage: vehicle.vehicle_usage ?? NO_VEHICLE_USAGE_VALUE,
      fuel_type: vehicle.fuel_type ?? "",
      fipe_code: vehicle.fipe_code ?? "",
      fipe_value: numberToCurrencyInput(vehicle.fipe_value),
      declared_value: numberToCurrencyInput(vehicle.declared_value),
      overnight_zip_code: vehicle.overnight_zip_code ? formatCep(vehicle.overnight_zip_code) : "",
      main_state: vehicle.main_state ?? "",
      has_tracker: vehicle.has_tracker,
      tracker_model: vehicle.tracker_model ?? "",
      accessories: vehicle.accessories ?? "",
      main_driver: vehicle.main_driver ?? "",
      has_claim_history: vehicle.has_claim_history,
      notes: vehicle.notes ?? "",
    },
  });

  const hasTracker = watch("has_tracker");

  function onSubmit(values: EditVehicleFormValues) {
    updateVehicle.mutate(
      {
        id: vehicle.id,
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
            : (values.vehicle_type as Vehicle["vehicle_type"]),
        vehicle_usage:
          values.vehicle_usage === NO_VEHICLE_USAGE_VALUE
            ? null
            : (values.vehicle_usage as Vehicle["vehicle_usage"]),
        fuel_type: sanitize(values.fuel_type),
        fipe_code: sanitize(values.fipe_code),
        fipe_value: parseCurrencyInput(values.fipe_value ?? ""),
        declared_value: parseCurrencyInput(values.declared_value ?? ""),
        overnight_zip_code: digitsOnly(values.overnight_zip_code),
        main_state: sanitize(values.main_state),
        has_tracker: values.has_tracker,
        tracker_model: sanitize(values.tracker_model),
        accessories: sanitize(values.accessories),
        main_driver: sanitize(values.main_driver),
        has_claim_history: values.has_claim_history,
        notes: sanitize(values.notes),
      },
      {
        onSuccess: () => {
          toast.success("Veículo atualizado com sucesso");
          onSuccess();
        },
        onError: (error) => {
          toast.error(error.message || "Não foi possível atualizar o veículo");
        },
      },
    );
  }

  return (
    <>
      <form
        id="edit-vehicle-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex-1 min-h-0 overflow-y-auto bg-background"
      >
        <div className="mx-auto flex w-full max-w-[720px] flex-col gap-4 p-5">
          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Identificação
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 flex flex-col gap-1.5">
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

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="plate">Placa *</Label>
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
                <Input
                  id="manufacture_year"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="AAAA"
                  {...register("manufacture_year")}
                  onChange={(e) => setValue("manufacture_year", formatYear(e.target.value))}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="model_year">Ano do modelo</Label>
                <Input
                  id="model_year"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="AAAA"
                  {...register("model_year")}
                  onChange={(e) => setValue("model_year", formatYear(e.target.value))}
                />
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

          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Valores
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="fipe_code">Código FIPE</Label>
                <Input id="fipe_code" {...register("fipe_code")} />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="fipe_value">Valor FIPE</Label>
                <Input
                  id="fipe_value"
                  inputMode="decimal"
                  placeholder="R$ 0,00"
                  {...register("fipe_value")}
                  onChange={(e) => setValue("fipe_value", formatCurrencyInput(e.target.value))}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="declared_value">Valor declarado</Label>
                <Input
                  id="declared_value"
                  inputMode="decimal"
                  placeholder="R$ 0,00"
                  {...register("declared_value")}
                  onChange={(e) => setValue("declared_value", formatCurrencyInput(e.target.value))}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Circulação
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="overnight_zip_code">CEP de pernoite</Label>
                <Input
                  id="overnight_zip_code"
                  inputMode="numeric"
                  maxLength={9}
                  {...register("overnight_zip_code")}
                  onChange={(e) => setValue("overnight_zip_code", formatCep(e.target.value))}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="main_state">UF principal</Label>
                <Input
                  id="main_state"
                  maxLength={2}
                  {...register("main_state")}
                  onChange={(e) => setValue("main_state", formatUf(e.target.value))}
                />
              </div>

              <div className="col-span-2 flex items-center gap-2">
                <Controller
                  name="has_tracker"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id="has_tracker"
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        if (!checked) setValue("tracker_model", "");
                      }}
                    />
                  )}
                />
                <Label htmlFor="has_tracker" className="font-normal">
                  Possui rastreador
                </Label>
              </div>

              {hasTracker && (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="tracker_model">Modelo do rastreador</Label>
                  <Input id="tracker_model" {...register("tracker_model")} />
                </div>
              )}

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

          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Observações
            </p>

            <Textarea id="notes" rows={4} {...register("notes")} />
          </div>
        </div>
      </form>

      <SheetFooter className="flex-row justify-end">
        <Button variant="outline" onClick={onSuccess}>
          Cancelar
        </Button>
        <Button type="submit" form="edit-vehicle-form" disabled={updateVehicle.isPending}>
          {updateVehicle.isPending ? "Salvando..." : "Salvar"}
        </Button>
      </SheetFooter>
    </>
  );
}

export function EditVehicleDrawer() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const { data: vehicle, isLoading: isVehicleLoading, isError, refetch } = useVehicle(vehicleId!);
  // O Select de cliente depende de useClients() também ter carregado — se
  // EditVehicleForm montasse só com `vehicle` pronto, o Select podia nascer
  // sem a SelectItem correspondente ainda no ar e ficar em branco até
  // useClients() resolver (mesma classe de bug do defaultValues-no-useForm,
  // mas com uma segunda fonte de dados assíncrona).
  const { isLoading: isClientsLoading } = useClients();
  const isLoading = isVehicleLoading || isClientsLoading;

  function handleClose() {
    navigate(searchParams.get("return_to") ?? "/vehicles");
  }

  return (
    <Sheet open onOpenChange={(open) => !open && handleClose()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Editar veículo</SheetTitle>
        </SheetHeader>

        {(isLoading || isError) && (
          <div className="flex-1 min-h-0 overflow-y-auto bg-background">
            <div className="mx-auto flex w-full max-w-[720px] flex-col gap-4 p-5">
              {isLoading && (
                <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              )}

              {isError && !isLoading && (
                <div className="rounded-xl border border-border bg-card shadow-sm p-5 text-center">
                  <p className="mb-2 text-sm text-muted-foreground">
                    Não foi possível carregar os dados do veículo.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => refetch()}>
                    Tentar novamente
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {!isLoading && !isError && vehicle && (
          <EditVehicleForm vehicle={vehicle} onSuccess={handleClose} />
        )}
      </SheetContent>
    </Sheet>
  );
}
