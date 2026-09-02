import { Eye, Pencil, Plus, Search, UserCheck, UserX } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { toast } from "sonner";

import { formatCnpj } from "@/shared/lib/masks";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
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
import { usePlans } from "../../hooks/use-plans";
import { useReactivateBrokerage } from "../../hooks/use-reactivate-brokerage";

const ALL_STATUS_VALUE = "all";
const ALL_PLAN_VALUE = "all";
const NO_PLAN_VALUE = "none";

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function BrokeragesListScreen() {
  const { data: brokerages, isLoading, isError, refetch } = useBrokerages();
  const { data: plans } = usePlans();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(ALL_STATUS_VALUE);
  const [planFilter, setPlanFilter] = useState(ALL_PLAN_VALUE);
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

    return brokerages.filter((brokerage) => {
      const matchesStatus = statusFilter === ALL_STATUS_VALUE || brokerage.status === statusFilter;
      if (!matchesStatus) return false;

      const matchesPlan =
        planFilter === ALL_PLAN_VALUE ||
        (planFilter === NO_PLAN_VALUE ? !brokerage.plan_id : brokerage.plan_id === planFilter);
      if (!matchesPlan) return false;

      if (!query) return true;
      const name = normalize(brokerage.name);
      const taxId = brokerage.tax_id ? normalize(brokerage.tax_id) : "";
      return name.includes(query) || taxId.includes(query);
    });
  }, [brokerages, search, statusFilter, planFilter]);

  const hasActiveFilter =
    search !== "" || statusFilter !== ALL_STATUS_VALUE || planFilter !== ALL_PLAN_VALUE;

  const totalCount = brokerages?.length ?? 0;
  const filteredCount = filteredBrokerages?.length ?? totalCount;

  return (
    <>
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
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
            <Link to="/brokerages/add">
              <Plus className="h-4 w-4" />
              Nova corretora
            </Link>
          </Button>
        </div>

        <div className="mb-4 flex items-center gap-3">
          <div className="relative max-w-sm flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome ou CNPJ"
              className="pl-9"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_STATUS_VALUE}>Todos os status</SelectItem>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="inactive">Inativo</SelectItem>
            </SelectContent>
          </Select>

          <Select value={planFilter} onValueChange={setPlanFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Plano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_PLAN_VALUE}>Todos os planos</SelectItem>
              <SelectItem value={NO_PLAN_VALUE}>Sem plano</SelectItem>
              {plans?.map((plan) => (
                <SelectItem key={plan.id} value={plan.id}>
                  {plan.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>CNPJ</TableHead>
              <TableHead>Criada em</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 3 }).map((_, index) => (
                <TableSkeletonRow key={index} cells={6} />
              ))}

            {isError && !isLoading && (
              <TableErrorState
                colSpan={6}
                message="Não foi possível carregar as corretoras."
                onRetry={() => refetch()}
              />
            )}

            {!isLoading && !isError && filteredBrokerages?.length === 0 && (
              <TableEmptyState
                colSpan={6}
                message={
                  hasActiveFilter
                    ? "Nenhuma corretora encontrada pra esse filtro."
                    : "Nenhuma corretora cadastrada ainda."
                }
              />
            )}

            {!isLoading &&
              !isError &&
              filteredBrokerages?.map((brokerage) => (
                <TableRow key={brokerage.id}>
                  <TableCell className="text-foreground">{brokerage.name}</TableCell>
                  <TableCell className="font-mono-data text-muted-foreground">
                    {brokerage.tax_id ? formatCnpj(brokerage.tax_id) : "—"}
                  </TableCell>
                  <TableCell className="font-mono-data text-muted-foreground">
                    {new Date(brokerage.created_at).toLocaleDateString("pt-BR")}
                  </TableCell>
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
      </div>

      <Outlet />

      <DeactivateBrokerageConfirmDialog
        brokerageId={deactivateBrokerage?.id ?? null}
        brokerageName={deactivateBrokerage?.name}
        onOpenChange={(open) => !open && setDeactivateBrokerage(null)}
      />
    </>
  );
}
