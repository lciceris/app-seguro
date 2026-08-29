import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { useAuthStore } from "@/features/auth";
import { useClients } from "@/features/clients";
import { useUsers } from "@/features/users";
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

import { useCreateQuotation } from "../../hooks/use-create-quotation";
import type { CreateQuotationInput } from "../../api/create-quotation";
import {
  createQuotationSchema,
  NO_QUOTATION_TYPE_VALUE,
  type CreateQuotationFormValues,
} from "../../validations/create-quotation-schema";

function sanitize(value: string | undefined) {
  return value === "" || value === undefined ? null : value;
}

function toDateOnly(date: Date | null) {
  return date ? date.toISOString().slice(0, 10) : null;
}

function paraPayload(
  values: CreateQuotationFormValues,
  isSeller: boolean,
  selfId: string | undefined,
): Omit<CreateQuotationInput, "brokerage_id"> {
  return {
    client_id: values.client_id,
    seller_id: isSeller ? (selfId ?? null) : sanitize(values.seller_id),
    quotation_type:
      values.quotation_type === NO_QUOTATION_TYPE_VALUE
        ? null
        : (values.quotation_type as CreateQuotationInput["quotation_type"]),
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
  };
}

export function CreateQuotationDrawer() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const usuario = useAuthStore((state) => state.usuario);
  const isSeller = usuario?.role === "seller";

  const createQuotation = useCreateQuotation();
  const { data: clients } = useClients();
  const { data: users } = useUsers();
  const sellers = users?.filter((user) => user.role === "seller") ?? [];

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateQuotationFormValues>({
    resolver: zodResolver(createQuotationSchema),
    defaultValues: {
      client_id: searchParams.get("client_id") ?? "",
      seller_id: "",
      quotation_type: NO_QUOTATION_TYPE_VALUE,
      coverage_start: null,
      coverage_end: null,
      due_date: null,
    },
  });

  function handleClose() {
    navigate(searchParams.get("return_to") || "/quotations");
  }

  function onSubmit(values: CreateQuotationFormValues) {
    createQuotation.mutate(paraPayload(values, isSeller, usuario?.id), {
      onSuccess: () => {
        toast.success("Cotação criada com sucesso");
        handleClose();
      },
      onError: (error) => {
        toast.error(error.message || "Não foi possível criar a cotação");
      },
    });
  }

  return (
    <Sheet open onOpenChange={(open) => !open && handleClose()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Nova cotação</SheetTitle>
        </SheetHeader>

        <form
          id="create-quotation-form"
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

                {!isSeller && (
                  <div className="col-span-2 flex flex-col gap-1.5">
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

                <div className="col-span-2 flex flex-col gap-1.5">
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
            </div>

            <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
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
                      <DatePicker
                        id="coverage_start"
                        value={field.value}
                        onChange={field.onChange}
                      />
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
                  <Input
                    id="coverages"
                    placeholder="Separadas por vírgula"
                    {...register("coverages")}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="deductible_pref">Preferência de franquia</Label>
                  <Input id="deductible_pref" {...register("deductible_pref")} />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
              <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Prazo e observações
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 flex flex-col gap-1.5">
                  <Label htmlFor="due_date">Prazo pra fechar</Label>
                  <Controller
                    name="due_date"
                    control={control}
                    render={({ field }) => (
                      <DatePicker id="due_date" value={field.value} onChange={field.onChange} />
                    )}
                  />
                </div>

                <div className="col-span-2 flex flex-col gap-1.5">
                  <Label htmlFor="seller_notes">Observações do vendedor</Label>
                  <Textarea id="seller_notes" rows={4} {...register("seller_notes")} />
                </div>
              </div>
            </div>
          </div>
        </form>

        <SheetFooter className="flex-row justify-end">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" form="create-quotation-form" disabled={createQuotation.isPending}>
            {createQuotation.isPending ? "Criando..." : "Criar"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
