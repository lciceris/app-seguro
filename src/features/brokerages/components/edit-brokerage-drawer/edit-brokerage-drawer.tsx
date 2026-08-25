import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { fetchCnpjData } from "@/shared/lib/brasil-api";
import { fetchCepData } from "@/shared/lib/via-cep";
import { formatCep, formatCnpj, formatPhone } from "@/shared/lib/masks";
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
import { Skeleton } from "@/shared/components/ui/skeleton";

import { useBrokerage } from "../../hooks/use-brokerage";
import { usePlans } from "../../hooks/use-plans";
import { useUpdateBrokerage } from "../../hooks/use-update-brokerage";
import type { UpdateBrokerageInput } from "../../api/update-brokerage";
import type { BrokerageWithPlan } from "../../types/brokerage";
import {
  editBrokerageSchema,
  NO_PLAN_VALUE,
  type EditBrokerageFormValues,
} from "../../validations/edit-brokerage-schema";

function sanitize(value: string | undefined) {
  return value === "" || value === undefined ? null : value;
}

function digitsOnly(value: string | undefined) {
  const digits = value?.replace(/\D/g, "") ?? "";
  return digits === "" ? null : digits;
}

function paraPayload(id: string, values: EditBrokerageFormValues): UpdateBrokerageInput {
  return {
    id,
    name: values.name,
    plan_id: values.plan_id === NO_PLAN_VALUE ? null : values.plan_id,
    plan_expires_at: values.plan_expires_at
      ? values.plan_expires_at.toISOString().slice(0, 10)
      : null,
    trade_name: sanitize(values.trade_name),
    tax_id: digitsOnly(values.tax_id),
    business_code: sanitize(values.business_code),
    state_registration: sanitize(values.state_registration),
    email: sanitize(values.email?.trim().toLowerCase()),
    phone: digitsOnly(values.phone),
    zip_code: digitsOnly(values.zip_code),
    street: sanitize(values.street),
    street_number: sanitize(values.street_number),
    complement: sanitize(values.complement),
    neighborhood: sanitize(values.neighborhood),
    city: sanitize(values.city),
    state: sanitize(values.state),
    representative_name: sanitize(values.representative_name),
    representative_email: sanitize(values.representative_email?.trim().toLowerCase()),
    financial_name: sanitize(values.financial_name),
    financial_email: sanitize(values.financial_email?.trim().toLowerCase()),
  };
}

// Formulário próprio, montado só quando `brokerage` já existe — os valores
// atuais viram `defaultValues` do useForm diretamente (em vez de popular via
// reset() num useEffect), porque o Select controlado só reflete o valor
// selecionado corretamente quando ele já nasce com esse valor.
function EditBrokerageForm({
  brokerage,
  onSuccess,
}: {
  brokerage: BrokerageWithPlan;
  onSuccess: () => void;
}) {
  const { data: plans } = usePlans();
  const updateBrokerage = useUpdateBrokerage();

  const [isFetchingCnpj, setIsFetchingCnpj] = useState(false);
  const [isFetchingCep, setIsFetchingCep] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<EditBrokerageFormValues>({
    resolver: zodResolver(editBrokerageSchema),
    defaultValues: {
      name: brokerage.name,
      plan_id: brokerage.plan_id ?? NO_PLAN_VALUE,
      plan_expires_at: brokerage.plan_expires_at ? new Date(brokerage.plan_expires_at) : null,
      trade_name: brokerage.trade_name ?? "",
      tax_id: brokerage.tax_id ? formatCnpj(brokerage.tax_id) : "",
      business_code: brokerage.business_code ?? "",
      state_registration: brokerage.state_registration ?? "",
      email: brokerage.email ?? "",
      phone: brokerage.phone ? formatPhone(brokerage.phone) : "",
      zip_code: brokerage.zip_code ? formatCep(brokerage.zip_code) : "",
      street: brokerage.street ?? "",
      street_number: brokerage.street_number ?? "",
      complement: brokerage.complement ?? "",
      neighborhood: brokerage.neighborhood ?? "",
      city: brokerage.city ?? "",
      state: brokerage.state ?? "",
      representative_name: brokerage.representative_name ?? "",
      representative_email: brokerage.representative_email ?? "",
      financial_name: brokerage.financial_name ?? "",
      financial_email: brokerage.financial_email ?? "",
    },
  });

  async function handleFetchCnpj() {
    const cnpj = getValues("tax_id");
    if (!cnpj) return;
    setIsFetchingCnpj(true);
    try {
      const data = await fetchCnpjData(cnpj);
      setValue("name", data.name);
      setValue("trade_name", data.trade_name ?? "");
      setValue("business_code", data.business_code ?? "");
      setValue("email", data.email ?? "");
      setValue("phone", data.phone ? formatPhone(data.phone) : "");
      setValue("zip_code", data.zip_code ? formatCep(data.zip_code) : "");
      setValue("street", data.street ?? "");
      setValue("street_number", data.street_number ?? "");
      setValue("complement", data.complement ?? "");
      setValue("neighborhood", data.neighborhood ?? "");
      setValue("city", data.city ?? "");
      setValue("state", data.state ?? "");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível buscar o CNPJ");
    } finally {
      setIsFetchingCnpj(false);
    }
  }

  async function handleFetchCep() {
    const cep = getValues("zip_code");
    if (!cep) return;
    setIsFetchingCep(true);
    try {
      const data = await fetchCepData(cep);
      setValue("street", data.street ?? "");
      setValue("neighborhood", data.neighborhood ?? "");
      setValue("city", data.city ?? "");
      setValue("state", data.state ?? "");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível buscar o CEP");
    } finally {
      setIsFetchingCep(false);
    }
  }

  function onSubmit(values: EditBrokerageFormValues) {
    updateBrokerage.mutate(paraPayload(brokerage.id, values), {
      onSuccess: () => {
        toast.success("Corretora atualizada com sucesso");
        onSuccess();
      },
      onError: (error) => {
        toast.error(error.message || "Não foi possível atualizar a corretora");
      },
    });
  }

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
        <form
          id="edit-brokerage-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Plano e status
            </p>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="plan_id">Plano</Label>
              <Controller
                name="plan_id"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="plan_id" className="w-full">
                      <SelectValue placeholder="Selecione um plano" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_PLAN_VALUE}>Sem plano</SelectItem>
                      {plans?.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.plan_id && (
                <p className="text-sm text-destructive">{errors.plan_id.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="plan_expires_at">Data de expiração do plano</Label>
              <Controller
                name="plan_expires_at"
                control={control}
                render={({ field }) => (
                  <DatePicker id="plan_expires_at" value={field.value} onChange={field.onChange} />
                )}
              />
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Empresa
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 flex flex-col gap-1.5">
                <Label htmlFor="tax_id">CNPJ *</Label>
                <div className="flex gap-2">
                  <Input
                    id="tax_id"
                    placeholder="00.000.000/0000-00"
                    maxLength={18}
                    {...register("tax_id")}
                    onChange={(e) => setValue("tax_id", formatCnpj(e.target.value))}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleFetchCnpj}
                    disabled={isFetchingCnpj}
                  >
                    {isFetchingCnpj ? "Buscando..." : "Buscar"}
                  </Button>
                </div>
                {errors.tax_id && (
                  <p className="text-sm text-destructive">{errors.tax_id.message}</p>
                )}
              </div>

              <div className="col-span-2 flex flex-col gap-1.5">
                <Label htmlFor="name">Razão social *</Label>
                <Input id="name" placeholder="Razão social da empresa" {...register("name")} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="trade_name">Nome fantasia</Label>
                <Input id="trade_name" placeholder="Nome fantasia" {...register("trade_name")} />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="business_code">CNAE</Label>
                <Input
                  id="business_code"
                  placeholder="Ex: 6499-3/99 - Descrição"
                  {...register("business_code")}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="state_registration">Inscrição estadual</Label>
                <Input
                  id="state_registration"
                  placeholder="000.000.000.000"
                  {...register("state_registration")}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">E-mail comercial</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contato@empresa.com.br"
                  {...register("email")}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  placeholder="(00) 00000-0000"
                  maxLength={16}
                  {...register("phone")}
                  onChange={(e) => setValue("phone", formatPhone(e.target.value))}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Endereço
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 flex flex-col gap-1.5">
                <Label htmlFor="zip_code">CEP</Label>
                <div className="flex max-w-[280px] gap-2">
                  <Input
                    id="zip_code"
                    placeholder="00000-000"
                    maxLength={9}
                    {...register("zip_code")}
                    onChange={(e) => setValue("zip_code", formatCep(e.target.value))}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleFetchCep}
                    disabled={isFetchingCep}
                  >
                    {isFetchingCep ? "Buscando..." : "Buscar"}
                  </Button>
                </div>
              </div>

              <div className="col-span-2 flex flex-col gap-1.5">
                <Label htmlFor="street">Logradouro</Label>
                <Input id="street" placeholder="Rua, Avenida, etc." {...register("street")} />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="street_number">Número</Label>
                <Input id="street_number" placeholder="123" {...register("street_number")} />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="complement">Complemento</Label>
                <Input
                  id="complement"
                  placeholder="Sala, Andar, etc."
                  {...register("complement")}
                />
              </div>

              <div className="col-span-2 grid grid-cols-[1fr_1fr_80px] gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input id="neighborhood" placeholder="Bairro" {...register("neighborhood")} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="city">Cidade</Label>
                  <Input id="city" placeholder="Cidade" {...register("city")} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="state">UF</Label>
                  <Input
                    id="state"
                    placeholder="SP"
                    maxLength={2}
                    {...register("state")}
                    onChange={(e) => setValue("state", e.target.value.toUpperCase())}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Representante e contato
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="representative_name">Nome do representante</Label>
                <Input
                  id="representative_name"
                  placeholder="Nome completo"
                  {...register("representative_name")}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="representative_email">E-mail do representante</Label>
                <Input
                  id="representative_email"
                  type="email"
                  placeholder="email@empresa.com.br"
                  {...register("representative_email")}
                />
                {errors.representative_email && (
                  <p className="text-sm text-destructive">{errors.representative_email.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="financial_name">Nome financeiro</Label>
                <Input
                  id="financial_name"
                  placeholder="Nome completo"
                  {...register("financial_name")}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="financial_email">E-mail financeiro</Label>
                <Input
                  id="financial_email"
                  type="email"
                  placeholder="financeiro@empresa.com.br"
                  {...register("financial_email")}
                />
                {errors.financial_email && (
                  <p className="text-sm text-destructive">{errors.financial_email.message}</p>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>

      <SheetFooter className="flex-row justify-end border-t border-border bg-card">
        <Button variant="outline" onClick={onSuccess}>
          Cancelar
        </Button>
        <Button type="submit" form="edit-brokerage-form" disabled={updateBrokerage.isPending}>
          {updateBrokerage.isPending ? "Salvando..." : "Salvar"}
        </Button>
      </SheetFooter>
    </>
  );
}

export function EditBrokerageDrawer() {
  const navigate = useNavigate();
  const { brokerageId } = useParams<{ brokerageId: string }>();
  const { data: brokerage, isLoading, isError, refetch } = useBrokerage(brokerageId!);

  function handleClose() {
    navigate("/brokerages");
  }

  return (
    <Sheet open onOpenChange={(open) => !open && handleClose()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Editar corretora</SheetTitle>
        </SheetHeader>

        {(isLoading || isError) && (
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
            {isLoading && (
              <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            )}

            {isError && !isLoading && (
              <div className="rounded-xl border border-border bg-card shadow-sm p-5 text-center">
                <p className="mb-2 text-sm text-muted-foreground">
                  Não foi possível carregar os dados da corretora.
                </p>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  Tentar novamente
                </Button>
              </div>
            )}
          </div>
        )}

        {!isLoading && !isError && brokerage && (
          <EditBrokerageForm brokerage={brokerage} onSuccess={handleClose} />
        )}
      </SheetContent>
    </Sheet>
  );
}
