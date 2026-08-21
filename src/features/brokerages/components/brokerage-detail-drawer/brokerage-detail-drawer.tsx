import { useNavigate, useParams } from "react-router-dom";

import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";

import { useBrokerage } from "../../hooks/use-brokerage";

export function BrokerageDetailDrawer() {
  const navigate = useNavigate();
  const { brokerageId } = useParams<{ brokerageId: string }>();
  const { data: brokerage, isLoading, isError, refetch } = useBrokerage(brokerageId!);

  function handleClose() {
    navigate("/brokerages");
  }

  return (
    <Sheet open onOpenChange={(open) => !open && handleClose()}>
      <SheetContent size="lg">
        <SheetHeader>
          <SheetTitle>Detalhe da corretora</SheetTitle>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto bg-muted p-5">
          {isLoading && (
            <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-24" />
            </div>
          )}

          {isError && !isLoading && (
            <div className="rounded-xl border border-border bg-card p-5 text-center">
              <p className="mb-2 text-sm text-muted-foreground">
                Não foi possível carregar os dados da corretora.
              </p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Tentar novamente
              </Button>
            </div>
          )}

          {!isLoading && !isError && brokerage && (
            <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Nome
                </span>
                <span className="text-sm text-foreground">{brokerage.name}</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Plano
                </span>
                <span className="text-sm text-foreground">
                  {brokerage.plans?.name ?? "Sem plano"}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Status
                </span>
                <span
                  className={
                    brokerage.status === "active"
                      ? "text-sm font-medium text-emerald-700"
                      : "text-sm font-medium text-slate-500"
                  }
                >
                  {brokerage.status === "active" ? "Ativo" : "Inativo"}
                </span>
              </div>
            </div>
          )}
        </div>

        <SheetFooter className="flex-row justify-end border-t border-border bg-card">
          <Button variant="outline" onClick={handleClose}>
            Fechar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
