import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { useAuthStore } from "@/features/auth";
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
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Textarea } from "@/shared/components/ui/textarea";

import { useQuotation } from "../../hooks/use-quotation";
import { useUpdateQuotation } from "../../hooks/use-update-quotation";
import type { QuotationWithRelations } from "../../types/quotation";
import {
  editQuotationSchema,
  NO_QUOTATION_TYPE_VALUE,
  type EditQuotationFormValues,
} from "../../validations/edit-quotation-schema";

function sanitize(value: string | undefined) {
  return value === "" || value === undefined ? null : value;
}

function toDateOnly(date: Date | null) {
  return date ? date.toISOString().slice(0, 10) : null;
}

function fromDateOnly(value: string | null) {
  return value ? new Date(`${value}T00:00:00`) : null;
}

// Formulário próprio, montado só quando `quotation` E a lista de vendedores
// já existem — o Select de vendedor responsável depende de useUsers(), uma
// segunda query além de useQuotation(); gatear o mount só na primeira
// deixaria o Select nascer em branco (mesma pegadinha encontrada e corrigida
// em edit-vehicle-drawer, ver .agents/specs/vehicles/design.md).
function EditQuotationForm({
  quotation,
  onSuccess,
}: {
  quotation: QuotationWithRelations;
  onSuccess: () => void;
}) {
  const usuario = useAuthStore((state) => state.usuario);
  const isSeller = usuario?.role === "seller";
  const updateQuotation = useUpdateQuotation();
  const { data: users } = useUsers();
  const sellers = users?.filter((user) => user.role === "seller") ?? [];

  const { register, handleSubmit, control } = useForm<EditQuotationFormValues>({
    resolver: zodResolver(editQuotationSchema),
    defaultValues: {
      seller_id: quotation.seller_id ?? "",
      quotation_type: quotation.quotation_type ?? NO_QUOTATION_TYPE_VALUE,
      coverage_start: fromDateOnly(quotation.coverage_start),
      coverage_end: fromDateOnly(quotation.coverage_end),
      coverages: quotation.coverages?.join(", ") ?? "",
      deductible_pref: quotation.deductible_pref ?? "",
      due_date: fromDateOnly(quotation.due_date),
      seller_notes: quotation.seller_notes ?? "",
    },
  });

  function onSubmit(values: EditQuotationFormValues) {
    updateQuotation.mutate(
      {
        id: quotation.id,
        seller_id: sanitize(values.seller_id),
        quotation_type:
          values.quotation_type === NO_QUOTATION_TYPE_VALUE
            ? null
            : (values.quotation_type as QuotationWithRelations["quotation_type"]),
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
      },
      {
        onSuccess: () => {
          toast.success("Cotação atualizada com sucesso");
          onSuccess();
        },
        onError: (error) => {
          toast.error(error.message || "Não foi possível atualizar a cotação");
        },
      },
    );
  }

  return (
    <>
      <form
        id="edit-quotation-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-1 flex-col gap-4 overflow-y-auto p-5"
      >
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
          <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Identificação
          </p>

          <div className="grid grid-cols-2 gap-3">
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
                  <DatePicker id="coverage_start" value={field.value} onChange={field.onChange} />
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
      </form>

      <SheetFooter className="flex-row justify-end border-t border-border bg-card">
        <Button variant="outline" onClick={onSuccess}>
          Cancelar
        </Button>
        <Button type="submit" form="edit-quotation-form" disabled={updateQuotation.isPending}>
          {updateQuotation.isPending ? "Salvando..." : "Salvar"}
        </Button>
      </SheetFooter>
    </>
  );
}

export function EditQuotationDrawer() {
  const navigate = useNavigate();
  const { quotationId } = useParams<{ quotationId: string }>();
  const {
    data: quotation,
    isLoading: isQuotationLoading,
    isError,
    refetch,
  } = useQuotation(quotationId!);
  const { isLoading: isUsersLoading } = useUsers();
  const isLoading = isQuotationLoading || isUsersLoading;

  function handleClose() {
    navigate(`/quotations/${quotationId}`);
  }

  return (
    <Sheet open onOpenChange={(open) => !open && handleClose()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Editar cotação</SheetTitle>
        </SheetHeader>

        {(isLoading || isError) && (
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
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
                  Não foi possível carregar os dados da cotação.
                </p>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  Tentar novamente
                </Button>
              </div>
            )}
          </div>
        )}

        {!isLoading && !isError && quotation && (
          <EditQuotationForm quotation={quotation} onSuccess={handleClose} />
        )}
      </SheetContent>
    </Sheet>
  );
}
