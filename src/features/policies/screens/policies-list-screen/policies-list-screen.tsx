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

import {
  DERIVED_POLICY_STATUS_BADGE_CLASSES,
  DERIVED_POLICY_STATUS_LABELS,
} from "../../constants/labels";
import { usePolicies } from "../../hooks/use-policies";
import {
  getDerivedPolicyStatus,
  type DerivedPolicyStatus,
} from "../../lib/get-derived-policy-status";

const ALL_STATUS_VALUE = "all";

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function formatCurrency(value: number | null) {
  if (value === null) return "—";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(`${value}T00:00:00`).toLocaleDateString("pt-BR");
}

const MANAGE_ROLES = new Set(["supervisor", "brokerage_admin", "platform_admin"]);

export function PoliciesListScreen() {
  const { data: policies, isLoading, isError, refetch } = usePolicies();
  const usuario = useAuthStore((state) => state.usuario);
  const canManage = !!usuario && MANAGE_ROLES.has(usuario.role);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<DerivedPolicyStatus | typeof ALL_STATUS_VALUE>(
    ALL_STATUS_VALUE,
  );

  const filteredPolicies = useMemo(() => {
    if (!policies) return policies;
    const query = normalize(search.trim());

    return policies.filter((policy) => {
      const derivedStatus = getDerivedPolicyStatus(policy);
      const matchesStatus = statusFilter === ALL_STATUS_VALUE || derivedStatus === statusFilter;
      if (!matchesStatus) return false;
      if (!query) return true;

      const number = normalize(policy.policy_number ?? "");
      const clientName = policy.clients ? normalize(policy.clients.legal_name) : "";
      return number.includes(query) || clientName.includes(query);
    });
  }, [policies, search, statusFilter]);

  const totalCount = policies?.length ?? 0;
  const filteredCount = filteredPolicies?.length ?? totalCount;

  return (
    <div className="p-6">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Apólices</h1>
            {!isLoading && policies && (
              <p className="text-xs text-muted-foreground">
                {filteredCount !== totalCount
                  ? `${filteredCount} de ${totalCount} apólices`
                  : totalCount === 1
                    ? "1 apólice emitida"
                    : `${totalCount} apólices emitidas`}
              </p>
            )}
          </div>
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
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}
          >
            <SelectTrigger className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_STATUS_VALUE}>Todos os status</SelectItem>
              {Object.entries(DERIVED_POLICY_STATUS_LABELS).map(([value, label]) => (
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
              <TableHead>Seguradora</TableHead>
              <TableHead>Prêmio</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Vigência</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 3 }).map((_, index) => (
                <TableSkeletonRow key={index} cells={7} />
              ))}

            {isError && !isLoading && (
              <TableErrorState
                colSpan={7}
                message="Não foi possível carregar as apólices."
                onRetry={() => refetch()}
              />
            )}

            {!isLoading && !isError && filteredPolicies?.length === 0 && (
              <TableEmptyState
                colSpan={7}
                message={
                  search || statusFilter !== ALL_STATUS_VALUE
                    ? "Nenhuma apólice encontrada pra esse filtro."
                    : "Nenhuma apólice emitida ainda."
                }
              />
            )}

            {!isLoading &&
              !isError &&
              filteredPolicies?.map((policy) => {
                const derivedStatus = getDerivedPolicyStatus(policy);
                return (
                  <TableRow key={policy.id}>
                    <TableCell className="font-mono-data text-foreground">
                      {policy.policy_number ?? "Pendente de emissão"}
                      {policy.quotations?.number && (
                        <span className="block font-mono-data text-xs text-muted-foreground">
                          Cotação {policy.quotations.number}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {policy.clients?.legal_name ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {policy.insurers?.name ?? "—"}
                    </TableCell>
                    <TableCell className="font-mono-data text-muted-foreground">
                      {formatCurrency(policy.premium_amount)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={DERIVED_POLICY_STATUS_BADGE_CLASSES[derivedStatus]}
                      >
                        {DERIVED_POLICY_STATUS_LABELS[derivedStatus]}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono-data text-muted-foreground">
                      {formatDate(policy.coverage_start)} — {formatDate(policy.coverage_end)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button asChild variant="ghost" size="icon-sm">
                              <Link to={`/policies/${policy.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Ver</TooltipContent>
                        </Tooltip>
                        {canManage && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button asChild variant="ghost" size="icon-sm">
                                <Link to={`/policies/${policy.id}/edit`}>
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
                );
              })}
          </TableBody>
        </Table>
      </div>

      <Outlet />
    </div>
  );
}
