import { Eye, Pencil, UserCheck, UserX } from "lucide-react";
import { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { toast } from "sonner";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip";

import { DeactivateBrokerageConfirmDialog } from "../../components/deactivate-brokerage-confirm-dialog";
import { useBrokerages } from "../../hooks/use-brokerages";
import { useReactivateBrokerage } from "../../hooks/use-reactivate-brokerage";

export function BrokeragesListScreen() {
  const { data: brokerages, isLoading, isError, refetch } = useBrokerages();
  const [deactivateBrokerage, setDeactivateBrokerage] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const reactivateBrokerage = useReactivateBrokerage();

  function handleReactivate(id: string) {
    reactivateBrokerage.mutate(id, {
      onSuccess: () => toast.success("Corretora reativada com sucesso"),
      onError: (error) => toast.error(error.message || "Não foi possível reativar a corretora"),
    });
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">Corretoras</h1>
        <Button asChild>
          <Link to="/brokerages/add">Nova corretora</Link>
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Nome
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Plano
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: 3 }).map((_, index) => (
                <tr key={index} className="border-b border-border">
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-32" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-16" />
                  </td>
                  <td className="px-4 py-3" />
                </tr>
              ))}

            {isError && !isLoading && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center">
                  <p className="mb-2 text-sm text-muted-foreground">
                    Não foi possível carregar as corretoras.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => refetch()}>
                    Tentar novamente
                  </Button>
                </td>
              </tr>
            )}

            {!isLoading && !isError && brokerages?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Nenhuma corretora cadastrada ainda.
                </td>
              </tr>
            )}

            {!isLoading &&
              !isError &&
              brokerages?.map((brokerage) => (
                <tr
                  key={brokerage.id}
                  className="border-b border-border last:border-0 hover:bg-muted/50"
                >
                  <td className="px-4 py-3 text-foreground">{brokerage.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {brokerage.plans?.name ?? "Sem plano"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={
                        brokerage.status === "active"
                          ? "border-transparent bg-emerald-100 text-emerald-700"
                          : "border-transparent bg-slate-100 text-slate-500"
                      }
                    >
                      {brokerage.status === "active" ? "Ativo" : "Inativo"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button asChild variant="ghost" size="icon-sm">
                            <Link to={`/brokerages/${brokerage.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Ver</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button asChild variant="ghost" size="icon-sm">
                            <Link to={`/brokerages/${brokerage.id}/edit`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Editar</TooltipContent>
                      </Tooltip>
                      {brokerage.status === "active" ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() =>
                                setDeactivateBrokerage({ id: brokerage.id, name: brokerage.name })
                              }
                            >
                              <UserX className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Desativar</TooltipContent>
                        </Tooltip>
                      ) : (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleReactivate(brokerage.id)}
                            >
                              <UserCheck className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Reativar</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <Outlet />

      <DeactivateBrokerageConfirmDialog
        brokerageId={deactivateBrokerage?.id ?? null}
        brokerageName={deactivateBrokerage?.name}
        onOpenChange={(open) => !open && setDeactivateBrokerage(null)}
      />
    </div>
  );
}
