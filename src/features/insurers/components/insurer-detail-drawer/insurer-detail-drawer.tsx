import { useNavigate, useParams } from "react-router-dom";

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
          <SheetTitle>Detalhe da seguradora</SheetTitle>
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
                  {insurer.logo_url && (
                    <img
                      src={insurer.logo_url}
                      alt="Logo"
                      className="size-16 rounded-lg border border-border bg-card object-contain p-1.5"
                    />
                  )}
                  <DetailField label="Nome" value={insurer.name} />
                  <DetailField label="CNPJ" value={insurer.cnpj} />
                  <DetailField label="E-mail" value={insurer.email} />
                  <DetailField label="Telefone comercial" value={insurer.phone} />
                  <DetailField label="Website" value={insurer.website} />
                </div>

                <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
                  <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Contato comercial
                  </p>
                  <DetailField label="Nome do contato" value={insurer.contact_name} />
                </div>

                <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
                  <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Configurações
                  </p>
                  <DetailField
                    label="Prazo de resposta (dias)"
                    value={insurer.response_time_days}
                  />
                  <DetailField label="Ordem de exibição" value={insurer.display_order} />
                </div>

                <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
                  <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Observações
                  </p>
                  <DetailField label="Observações" value={insurer.notes} />
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
