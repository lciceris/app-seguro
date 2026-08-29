import { useNavigate, useParams } from "react-router-dom";

import { formatCnpj, formatPhone } from "@/shared/lib/masks";
import { Button } from "@/shared/components/ui/button";
import { DetailField } from "@/shared/components/ui/detail-field";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";

import { useInsurer } from "../../hooks/use-insurer";

export function InsurerDetailDrawer() {
  const navigate = useNavigate();
  const { insurerId } = useParams<{ insurerId: string }>();
  const { data: insurer, isLoading, isError, refetch } = useInsurer(insurerId!);

  function handleClose() {
    navigate("/admin/insurers");
  }

  return (
    <Sheet open onOpenChange={(open) => !open && handleClose()}>
      <SheetContent>
        <SheetHeader>
          <div className="flex items-center gap-3">
            {!isLoading && insurer && (
              <>
                {insurer.logo_url ? (
                  <img
                    src={insurer.logo_url}
                    alt={insurer.name}
                    className="h-10 w-10 shrink-0 rounded-full border-[3px] border-primary object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-[3px] border-primary bg-muted text-sm font-semibold text-muted-foreground">
                    {insurer.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </>
            )}
            <div className="flex flex-col gap-0.5">
              <SheetTitle>
                {isLoading ? (
                  <Skeleton className="h-6 w-40" />
                ) : (
                  (insurer?.name ?? "Detalhe da seguradora")
                )}
              </SheetTitle>
              {!isLoading && insurer && (
                <p className="text-xs text-muted-foreground">Detalhe da seguradora</p>
              )}
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 min-h-0 overflow-y-auto bg-background">
          <div className="mx-auto flex w-full max-w-[720px] flex-col gap-4 p-5">
            {isLoading && (
              <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            )}

            {isError && !isLoading && (
              <div className="rounded-xl border border-border bg-card shadow-sm p-5 text-center">
                <p className="mb-2 text-sm text-muted-foreground">
                  Não foi possível carregar os dados da seguradora.
                </p>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  Tentar novamente
                </Button>
              </div>
            )}

            {!isLoading && !isError && insurer && (
              <>
                <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
                  <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Identificação
                  </p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <div className="col-span-2">
                      <DetailField label="Nome" value={insurer.name} />
                    </div>
                    <DetailField label="CNPJ" value={formatCnpj(insurer.cnpj)} />
                    <DetailField label="E-mail" value={insurer.email} />
                    <DetailField
                      label="Telefone comercial"
                      value={insurer.phone ? formatPhone(insurer.phone) : insurer.phone}
                    />
                    <div className="col-span-2">
                      <DetailField label="Website" value={insurer.website} />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
                  <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Contato comercial
                  </p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <DetailField label="Nome do contato" value={insurer.contact_name} />
                  </div>
                </div>

                <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
                  <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Configurações
                  </p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <DetailField
                      label="Prazo de resposta (dias)"
                      value={insurer.response_time_days}
                    />
                    <DetailField label="Ordem de exibição" value={insurer.display_order} />
                  </div>
                </div>

                <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
                  <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Observações
                  </p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <div className="col-span-2">
                      <DetailField label="Observações" value={insurer.notes} />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <SheetFooter className="flex-row justify-end">
          <Button variant="outline" onClick={handleClose}>
            Fechar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
