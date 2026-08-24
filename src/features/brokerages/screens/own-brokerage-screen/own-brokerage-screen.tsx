import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { fetchCnpjData } from "@/shared/lib/brasil-api";
import { fetchCepData } from "@/shared/lib/via-cep";
import { formatCep, formatCnpj, formatPhone } from "@/shared/lib/masks";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Skeleton } from "@/shared/components/ui/skeleton";

import { useOwnBrokerage } from "../../hooks/use-own-brokerage";
import { useUpdateOwnBrokerage } from "../../hooks/use-update-own-brokerage";
import type { Brokerage } from "../../types/brokerage";
import type { UpdateOwnBrokerageInput } from "../../api/update-own-brokerage";
import {
  editOwnBrokerageSchema,
  type EditOwnBrokerageFormValues,
} from "../../validations/edit-own-brokerage-schema";

function sanitize(value: string | undefined) {
  return value === "" || value === undefined ? null : value;
}

function digitsOnly(value: string | undefined) {
  const digits = value?.replace(/\D/g, "") ?? "";
  return digits === "" ? null : digits;
}

function paraPayload(id: string, values: EditOwnBrokerageFormValues): UpdateOwnBrokerageInput {
  return {
    id,
    name: values.name,
    logo_url: sanitize(values.logo_url),
    primary_color: sanitize(values.primary_color),
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
// atuais viram `defaultValues` do useForm diretamente (mesmo padrão adotado
// nos drawers de edição, ver edit-brokerage-drawer/edit-user-drawer).
function OwnBrokerageForm({ brokerage }: { brokerage: Brokerage }) {
  const updateOwnBrokerage = useUpdateOwnBrokerage();

  const [isFetchingCnpj, setIsFetchingCnpj] = useState(false);
  const [isFetchingCep, setIsFetchingCep] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<EditOwnBrokerageFormValues>({
    resolver: zodResolver(editOwnBrokerageSchema),
    defaultValues: {
      name: brokerage.name,
      logo_url: brokerage.logo_url ?? "",
      primary_color: brokerage.primary_color ?? "",
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

  function onSubmit(values: EditOwnBrokerageFormValues) {
    updateOwnBrokerage.mutate(paraPayload(brokerage.id, values), {
      onSuccess: () => {
        toast.success("Corretora atualizada com sucesso");
      },
      onError: (error) => {
        toast.error(error.message || "Não foi possível atualizar a corretora");
      },
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-2xl flex-col gap-4">
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
        <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Empresa
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 flex flex-col gap-1.5">
            <Label htmlFor="tax_id">CNPJ</Label>
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
          </div>

          <div className="col-span-2 flex flex-col gap-1.5">
            <Label htmlFor="name">Razão social</Label>
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

      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
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
            <Input id="complement" placeholder="Sala, Andar, etc." {...register("complement")} />
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

      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
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

      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
        <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Identidade visual
        </p>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="logo_url">URL do logo</Label>
          <Input id="logo_url" {...register("logo_url")} />
          {errors.logo_url && <p className="text-sm text-destructive">{errors.logo_url.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="primary_color">Cor primária</Label>
          <Input id="primary_color" placeholder="#3B82F6" {...register("primary_color")} />
          {errors.primary_color && (
            <p className="text-sm text-destructive">{errors.primary_color.message}</p>
          )}
        </div>
      </div>

      <Button type="submit" disabled={updateOwnBrokerage.isPending} className="self-start">
        {updateOwnBrokerage.isPending ? "Salvando..." : "Salvar"}
      </Button>
    </form>
  );
}

export function OwnBrokerageScreen() {
  const { data: brokerage, isLoading, isError, refetch } = useOwnBrokerage();

  return (
    <div className="p-6">
      <h1 className="mb-4 text-lg font-semibold text-foreground">Minha corretora</h1>

      {isLoading && (
        <div className="flex max-w-2xl flex-col gap-4 rounded-xl border border-border bg-card p-5">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      )}

      {isError && !isLoading && (
        <div className="max-w-2xl rounded-xl border border-border bg-card p-5 text-center">
          <p className="mb-2 text-sm text-muted-foreground">
            Não foi possível carregar os dados da corretora.
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </div>
      )}

      {!isLoading && !isError && brokerage && <OwnBrokerageForm brokerage={brokerage} />}
    </div>
  );
}
