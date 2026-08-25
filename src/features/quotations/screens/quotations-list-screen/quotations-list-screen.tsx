import { Eye, Pencil, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, Outlet } from "react-router-dom";

import { useAuthStore } from "@/features/auth";
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

import { QUOTATION_STATUS_BADGE_CLASSES, QUOTATION_STATUS_LABELS } from "../../constants/labels";
import { useQuotations } from "../../hooks/use-quotations";

const ALL_STATUS_VALUE = "all";

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function QuotationsListScreen() {
  const { data: quotations, isLoading, isError, refetch } = useQuotations();
  const usuario = useAuthStore((state) => state.usuario);
  const canCreate =
    usuario?.role === "seller" ||
    usuario?.role === "supervisor" ||
    usuario?.role === "brokerage_admin" ||
    usuario?.role === "platform_admin";
  const canEdit = usuario?.role !== "viewer";
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(ALL_STATUS_VALUE);

  const filteredQuotations = useMemo(() => {
    if (!quotations) return quotations;
    const query = normalize(search.trim());

    return quotations.filter((quotation) => {
      const matchesStatus = statusFilter === ALL_STATUS_VALUE || quotation.status === statusFilter;
      if (!matchesStatus) return false;
      if (!query) return true;

      const number = normalize(quotation.number);
      const clientName = quotation.clients ? normalize(quotation.clients.legal_name) : "";
      return number.includes(query) || clientName.includes(query);
    });
  }, [quotations, search, statusFilter]);

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">Cotações</h1>
        {canCreate && (
          <Button asChild>
            <Link to="/quotations/add">Nova cotação</Link>
          </Button>
        )}
      </div>

      <div className="mb-4 flex items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por número ou cliente"
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_STATUS_VALUE}>Todos os status</SelectItem>
            {Object.entries(QUOTATION_STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Número</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Vendedor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Prazo</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading &&
            Array.from({ length: 3 }).map((_, index) => <TableSkeletonRow key={index} cells={6} />)}

          {isError && !isLoading && (
            <TableErrorState
              colSpan={6}
              message="Não foi possível carregar as cotações."
              onRetry={() => refetch()}
            />
          )}

          {!isLoading && !isError && filteredQuotations?.length === 0 && (
            <TableEmptyState
              colSpan={6}
              message={
                search || statusFilter !== ALL_STATUS_VALUE
                  ? "Nenhuma cotação encontrada pra esse filtro."
                  : "Nenhuma cotação cadastrada ainda."
              }
            />
          )}

          {!isLoading &&
            !isError &&
            filteredQuotations?.map((quotation) => (
              <TableRow key={quotation.id}>
                <TableCell className="font-mono-data text-foreground">{quotation.number}</TableCell>
                <TableCell className="text-muted-foreground">
                  {quotation.clients?.legal_name ?? "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {quotation.seller?.full_name ?? "—"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={QUOTATION_STATUS_BADGE_CLASSES[quotation.status]}
                  >
                    {QUOTATION_STATUS_LABELS[quotation.status]}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono-data text-muted-foreground">
                  {quotation.due_date
                    ? new Date(`${quotation.due_date}T00:00:00`).toLocaleDateString("pt-BR")
                    : "—"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button asChild variant="ghost" size="icon-sm">
                          <Link to={`/quotations/${quotation.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Ver</TooltipContent>
                    </Tooltip>
                    {canEdit && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button asChild variant="ghost" size="icon-sm">
                            <Link to={`/quotations/${quotation.id}/edit`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Editar</TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

      <Outlet />
    </div>
  );
}
