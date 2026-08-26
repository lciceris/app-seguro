import { zodResolver } from "@hookform/resolvers/zod";
import { Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { fetchCnpjData } from "@/shared/lib/brasil-api";
import { fetchCepData } from "@/shared/lib/via-cep";
import { formatCep, formatCnpj, formatPhone } from "@/shared/lib/masks";
import { supabase } from "@/shared/lib/supabase";
import { Button } from "@/shared/components/ui/button";
import { ColorPicker } from "@/shared/components/ui/color-picker";
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

import { useCreateBrokerage } from "../../hooks/use-create-brokerage";
import { usePlans } from "../../hooks/use-plans";
import { uploadBrokerageLogo } from "../../api/upload-brokerage-logo";
import type { CreateBrokerageInput } from "../../api/create-brokerage";
import {
  createBrokerageSchema,
  NO_PLAN_VALUE,
  type CreateBrokerageFormValues,
} from "../../validations/create-brokerage-schema";

function sanitize(value: string | undefined) {
  return value === "" || value === undefined ? null : value;
}

function digitsOnly(value: string | undefined) {
  const digits = value?.replace(/\D/g, "") ?? "";
  return digits === "" ? null : digits;
}

function paraPayload(values: CreateBrokerageFormValues): CreateBrokerageInput {
  return {
    brokerage_name: values.brokerage_name,
    representative_name: values.representative_name,
    representative_email: values.representative_email.trim().toLowerCase(),
    plan_id: values.plan_id === NO_PLAN_VALUE ? null : values.plan_id,
    plan_expires_at: values.plan_expires_at
      ? values.plan_expires_at.toISOString().slice(0, 10)
      : null,
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
    financial_name: sanitize(values.financial_name),
    financial_email: sanitize(values.financial_email?.trim().toLowerCase()),
  };
}

export function CreateBrokerageDrawer() {
  const navigate = useNavigate();
  const createBrokerage = useCreateBrokerage();
  const { data: plans } = usePlans();

  const [isFetchingCnpj, setIsFetchingCnpj] = useState(false);
  const [isFetchingCep, setIsFetchingCep] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    control,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<CreateBrokerageFormValues>({
    resolver: zodResolver(createBrokerageSchema),
    defaultValues: { plan_id: NO_PLAN_VALUE, plan_expires_at: null },
  });

  function handleClose() {
    if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
    navigate("/brokerages");
  }

  function handleLogoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Imagem muito grande. Máximo 2MB.");
      return;
    }
    if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
    setLogoFile(file);
    setLogoPreviewUrl(URL.createObjectURL(file));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleLogoRemove() {
    if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
    setLogoFile(null);
    setLogoPreviewUrl("");
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

  function onSubmit(values: CreateBrokerageFormValues) {
    createBrokerage.mutate(paraPayload(values), {
      onSuccess: async ({ brokerage }) => {
        // O path do logo no Storage depende do id — só existe depois do
        // insert, por isso o upload acontece à parte, num UPDATE pontual
        // logo em seguida (a trigger permite platform_admin definir
        // logo_url/primary_color uma vez, na finalização do cadastro).
        if (logoFile) {
          try {
            const logoUrl = await uploadBrokerageLogo({
              brokerageId: brokerage.id,
              file: logoFile,
            });
            const { error } = await supabase
              .from("brokerages")
              .update({ logo_url: logoUrl })
              .eq("id", brokerage.id);
            if (error) throw error;
          } catch {
            toast.error("Corretora criada, mas não foi possível salvar o logo.");
          }
        }
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
          className="flex-1 min-h-0 overflow-y-auto bg-background"
        >
          <div className="mx-auto flex w-full max-w-[720px] flex-col gap-4 p-5">
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
                  <Label htmlFor="brokerage_name">Razão social *</Label>
                  <Input
                    id="brokerage_name"
                    placeholder="Razão social da empresa"
                    {...register("brokerage_name")}
                  />
                  {errors.brokerage_name && (
                    <p className="text-sm text-destructive">{errors.brokerage_name.message}</p>
                  )}
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
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
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
                  <Label htmlFor="representative_name">Nome do representante *</Label>
                  <Input
                    id="representative_name"
                    placeholder="Nome completo"
                    {...register("representative_name")}
                  />
                  {errors.representative_name && (
                    <p className="text-sm text-destructive">{errors.representative_name.message}</p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="representative_email">E-mail do representante *</Label>
                  <Input
                    id="representative_email"
                    type="email"
                    placeholder="email@empresa.com.br"
                    {...register("representative_email")}
                  />
                  {errors.representative_email && (
                    <p className="text-sm text-destructive">
                      {errors.representative_email.message}
                    </p>
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

            <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
              <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Plano
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
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="plan_expires_at">Data de expiração do plano</Label>
                <Controller
                  name="plan_expires_at"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      id="plan_expires_at"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
            </div>

            <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
              <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Identidade visual
              </p>

              <div className="flex flex-col gap-1.5">
                <Label>Logo</Label>
                {logoPreviewUrl ? (
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-muted p-2.5">
                    <img
                      src={logoPreviewUrl}
                      alt="Logo"
                      className="size-12 shrink-0 rounded-full border-2 border-border bg-card object-contain p-1"
                    />
                    <span className="flex-1 truncate text-sm text-muted-foreground">
                      {logoFile?.name}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="shrink-0 text-destructive hover:text-destructive"
                      onClick={handleLogoRemove}
                    >
                      <X className="size-3.5" />
                      Remover
                    </Button>
                  </div>
                ) : (
                  <label className="block cursor-pointer">
                    <div className="rounded-lg border-2 border-dashed border-border bg-muted p-5 text-center">
                      <Upload className="mx-auto mb-2 size-5 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Clique para enviar uma imagem</p>
                      <p className="mt-1 text-xs text-muted-foreground">PNG, JPG, SVG até 2MB</p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/svg+xml"
                      className="hidden"
                      onChange={handleLogoFile}
                    />
                  </label>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="primary_color">Cor primária</Label>
                <Controller
                  name="primary_color"
                  control={control}
                  render={({ field }) => (
                    <ColorPicker
                      id="primary_color"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
            </div>
          </div>
        </form>

        <SheetFooter className="flex-row justify-end">
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
