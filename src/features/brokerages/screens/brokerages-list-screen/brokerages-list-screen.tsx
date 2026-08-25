import { Eye, Pencil, Search, UserCheck, UserX } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { toast } from "sonner";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableEmptyState,
  TableErrorState,
  TableHead,
  TableHeader,
  TableRow,
  TableSkeletonRow,
} from "@/shared/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip";

import { DeactivateBrokerageConfirmDialog } from "../../components/deactivate-brokerage-confirm-dialog";
import { useBrokerages } from "../../hooks/use-brokerages";
import { useReactivateBrokerage } from "../../hooks/use-reactivate-brokerage";

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function BrokeragesListScreen() {
  const { data: brokerages, isLoading, isError, refetch } = useBrokerages();
  const [search, setSearch] = useState("");
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

  const filteredBrokerages = useMemo(() => {
    if (!brokerages) return brokerages;
    const query = normalize(search.trim());
    if (!query) return brokerages;

    return brokerages.filter((brokerage) => {
      const name = normalize(brokerage.name);
      const taxId = brokerage.tax_id ? normalize(brokerage.tax_id) : "";
      return name.includes(query) || taxId.includes(query);
    });
  }, [brokerages, search]);

  const totalCount = brokerages?.length ?? 0;
  const filteredCount = filteredBrokerages?.length ?? totalCount;

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Corretoras</h1>
          {!isLoading && brokerages && (
            <p className="text-xs text-muted-foreground">
              {filteredCount !== totalCount
                ? `${filteredCount} de ${totalCount} corretoras`
                : totalCount === 1
                  ? "1 corretora cadastrada"
                  : `${totalCount} corretoras cadastradas`}
            </p>
          )}
        </div>
        <Button asChild>
          <Link to="/brokerages/add">Nova corretora</Link>
        </Button>
      </div>

      <div className="mb-4 relative max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por nome ou CNPJ"
          className="pl-9"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Plano</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading &&
            Array.from({ length: 3 }).map((_, index) => <TableSkeletonRow key={index} cells={4} />)}

          {isError && !isLoading && (
            <TableErrorState
              colSpan={4}
              message="Não foi possível carregar as corretoras."
              onRetry={() => refetch()}
            />
          )}

          {!isLoading && !isError && filteredBrokerages?.length === 0 && (
            <TableEmptyState
              colSpan={4}
              message={
                search
                  ? "Nenhuma corretora encontrada pra essa busca."
                  : "Nenhuma corretora cadastrada ainda."
              }
            />
          )}

          {!isLoading &&
            !isError &&
            filteredBrokerages?.map((brokerage) => (
              <TableRow key={brokerage.id}>
                <TableCell className="text-foreground">{brokerage.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {brokerage.plans?.name ?? "Sem plano"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      brokerage.status === "active"
                        ? "border-transparent bg-success-bg text-success-text"
                        : "border-transparent bg-neutral-bg text-neutral-text"
                    }
                  >
                    {brokerage.status === "active" ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell>
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
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

      <Outlet />

      <DeactivateBrokerageConfirmDialog
        brokerageId={deactivateBrokerage?.id ?? null}
        brokerageName={deactivateBrokerage?.name}
        onOpenChange={(open) => !open && setDeactivateBrokerage(null)}
      />
    </div>
  );
}
