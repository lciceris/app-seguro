import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { fetchCnpjData } from "@/shared/lib/brasil-api";
import { fetchCepData } from "@/shared/lib/via-cep";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";

import { useCreateBrokerage } from "../../hooks/use-create-brokerage";
import type { CreateBrokerageInput } from "../../api/create-brokerage";
import {
  createBrokerageSchema,
  type CreateBrokerageFormValues,
} from "../../validations/create-brokerage-schema";

function sanitize(value: string | undefined) {
  return value === "" || value === undefined ? null : value;
}

function paraPayload(values: CreateBrokerageFormValues): CreateBrokerageInput {
  return {
    brokerage_name: values.brokerage_name,
    admin_full_name: values.admin_full_name,
    admin_email: values.admin_email,
    trade_name: sanitize(values.trade_name),
    tax_id: sanitize(values.tax_id),
    business_code: sanitize(values.business_code),
    state_registration: sanitize(values.state_registration),
    email: sanitize(values.email),
    phone: sanitize(values.phone),
    zip_code: sanitize(values.zip_code),
    street: sanitize(values.street),
    street_number: sanitize(values.street_number),
    complement: sanitize(values.complement),
    neighborhood: sanitize(values.neighborhood),
    city: sanitize(values.city),
    state: sanitize(values.state),
    representative_name: sanitize(values.representative_name),
    representative_email: sanitize(values.representative_email),
    financial_name: sanitize(values.financial_name),
    financial_email: sanitize(values.financial_email),
  };
}

export function CreateBrokerageDrawer() {
  const navigate = useNavigate();
  const createBrokerage = useCreateBrokerage();

  const [isFetchingCnpj, setIsFetchingCnpj] = useState(false);
  const [isFetchingCep, setIsFetchingCep] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<CreateBrokerageFormValues>({
    resolver: zodResolver(createBrokerageSchema),
  });

  function handleClose() {
    navigate("/brokerages");
  }

  async function handleFetchCnpj() {
    const cnpj = getValues("tax_id");
    if (!cnpj) return;
    setIsFetchingCnpj(true);
    try {
      const data = await fetchCnpjData(cnpj);
      setValue("brokerage_name", data.name);
      setValue("trade_name", data.trade_name ?? "");
      setValue("business_code", data.business_code ?? "");
      setValue("email", data.email ?? "");
      setValue("phone", data.phone ?? "");
      setValue("zip_code", data.zip_code ?? "");
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

  function onSubmit(values: CreateBrokerageFormValues) {
    createBrokerage.mutate(paraPayload(values), {
      onSuccess: () => {
        toast.success("Corretora criada com sucesso");
        handleClose();
      },
      onError: (error) => {
        toast.error(error.message || "Não foi possível criar a corretora");
      },
    });
  }

  return (
    <Sheet open onOpenChange={(open) => !open && handleClose()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Nova corretora</SheetTitle>
        </SheetHeader>

        <form
          id="create-brokerage-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-1 flex-col gap-4 overflow-y-auto bg-muted p-5"
        >
          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Empresa
            </p>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tax_id">CNPJ</Label>
              <div className="flex gap-2">
                <Input id="tax_id" {...register("tax_id")} />
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

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="brokerage_name">Razão social</Label>
              <Input id="brokerage_name" {...register("brokerage_name")} />
              {errors.brokerage_name && (
                <p className="text-sm text-destructive">{errors.brokerage_name.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="trade_name">Nome fantasia</Label>
              <Input id="trade_name" {...register("trade_name")} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="business_code">CNAE</Label>
              <Input id="business_code" {...register("business_code")} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="state_registration">Inscrição estadual</Label>
              <Input id="state_registration" {...register("state_registration")} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">E-mail comercial</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" {...register("phone")} />
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Endereço
            </p>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="zip_code">CEP</Label>
              <div className="flex gap-2">
                <Input id="zip_code" {...register("zip_code")} />
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

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="street">Logradouro</Label>
              <Input id="street" {...register("street")} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="street_number">Número</Label>
              <Input id="street_number" {...register("street_number")} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="complement">Complemento</Label>
              <Input id="complement" {...register("complement")} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="neighborhood">Bairro</Label>
              <Input id="neighborhood" {...register("neighborhood")} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="city">Cidade</Label>
              <Input id="city" {...register("city")} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="state">UF</Label>
              <Input id="state" maxLength={2} {...register("state")} />
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Representante
            </p>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="representative_name">Nome</Label>
              <Input id="representative_name" {...register("representative_name")} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="representative_email">E-mail</Label>
              <Input id="representative_email" type="email" {...register("representative_email")} />
              {errors.representative_email && (
                <p className="text-sm text-destructive">{errors.representative_email.message}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Financeiro
            </p>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="financial_name">Nome</Label>
              <Input id="financial_name" {...register("financial_name")} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="financial_email">E-mail</Label>
              <Input id="financial_email" type="email" {...register("financial_email")} />
              {errors.financial_email && (
                <p className="text-sm text-destructive">{errors.financial_email.message}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Primeiro administrador
            </p>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="admin_full_name">Nome</Label>
              <Input id="admin_full_name" {...register("admin_full_name")} />
              {errors.admin_full_name && (
                <p className="text-sm text-destructive">{errors.admin_full_name.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="admin_email">E-mail</Label>
              <Input id="admin_email" type="email" {...register("admin_email")} />
              {errors.admin_email && (
                <p className="text-sm text-destructive">{errors.admin_email.message}</p>
              )}
            </div>
          </div>
        </form>

        <SheetFooter className="flex-row justify-end border-t border-border bg-card">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" form="create-brokerage-form" disabled={createBrokerage.isPending}>
            {createBrokerage.isPending ? "Criando..." : "Criar"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
