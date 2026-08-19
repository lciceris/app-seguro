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
import { Skeleton } from "@/shared/components/ui/skeleton";
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

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Número
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Cliente
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Vendedor
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Prazo
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
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-32" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-28" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  <td className="px-4 py-3" />
                </tr>
              ))}

            {isError && !isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center">
                  <p className="mb-2 text-sm text-muted-foreground">
                    Não foi possível carregar as cotações.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => refetch()}>
                    Tentar novamente
                  </Button>
                </td>
              </tr>
            )}

            {!isLoading && !isError && filteredQuotations?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  {search || statusFilter !== ALL_STATUS_VALUE
                    ? "Nenhuma cotação encontrada pra esse filtro."
                    : "Nenhuma cotação cadastrada ainda."}
                </td>
              </tr>
            )}

            {!isLoading &&
              !isError &&
              filteredQuotations?.map((quotation) => (
                <tr
                  key={quotation.id}
                  className="border-b border-border last:border-0 hover:bg-muted/50"
                >
                  <td className="px-4 py-3 text-foreground">{quotation.number}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {quotation.clients?.legal_name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {quotation.seller?.full_name ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={QUOTATION_STATUS_BADGE_CLASSES[quotation.status]}
                    >
                      {QUOTATION_STATUS_LABELS[quotation.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {quotation.due_date
                      ? new Date(`${quotation.due_date}T00:00:00`).toLocaleDateString("pt-BR")
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
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
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <Outlet />
    </div>
  );
}
