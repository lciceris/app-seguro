import { ArrowDown, ArrowUp, Eye, Pencil, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, Outlet } from "react-router-dom";

import { formatCnpj, formatPhone } from "@/shared/lib/masks";
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

import { useInsurers } from "../../hooks/use-insurers";
import { useReorderInsurer } from "../../hooks/use-reorder-insurer";

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function InsurersListScreen() {
  const { data: insurers, isLoading, isError, refetch } = useInsurers();
  const reorderInsurer = useReorderInsurer();
  const [search, setSearch] = useState("");
  const hasActiveSearch = search.trim() !== "";

  const filteredInsurers = useMemo(() => {
    if (!insurers) return insurers;
    const query = normalize(search.trim());
    if (!query) return insurers;

    return insurers.filter((insurer) => {
      const name = normalize(insurer.name);
      const cnpj = insurer.cnpj ? normalize(insurer.cnpj) : "";
      return name.includes(query) || cnpj.includes(query);
    });
  }, [insurers, search]);

  const totalCount = insurers?.length ?? 0;
  const filteredCount = filteredInsurers?.length ?? totalCount;

  // Só faz sentido trocar posição na lista completa — com busca ativa, os
  // botões ficam desabilitados (Requirement 2.5 da spec insurer-catalog-and-ordering).
  function handleMove(index: number, direction: -1 | 1) {
    if (!filteredInsurers) return;
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= filteredInsurers.length) return;

    const current = filteredInsurers[index];
    const other = filteredInsurers[targetIndex];
    reorderInsurer.mutate({
      first: { id: current.id, display_order: other.display_order ?? targetIndex },
      second: { id: other.id, display_order: current.display_order ?? index },
    });
  }

  return (
    <>
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Seguradoras</h1>
            {!isLoading && insurers && (
              <p className="text-xs text-muted-foreground">
                {filteredCount !== totalCount
                  ? `${filteredCount} de ${totalCount} seguradoras`
                  : totalCount === 1
                    ? "1 seguradora cadastrada"
                    : `${totalCount} seguradoras cadastradas`}
              </p>
            )}
          </div>
          <Button asChild>
            <Link to="/admin/insurers/add">Nova seguradora</Link>
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
              <TableHead className="w-10">Ordem</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>CNPJ</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 3 }).map((_, index) => (
                <TableSkeletonRow key={index} cells={5} />
              ))}

            {isError && !isLoading && (
              <TableErrorState
                colSpan={5}
                message="Não foi possível carregar as seguradoras."
                onRetry={() => refetch()}
              />
            )}

            {!isLoading && !isError && filteredInsurers?.length === 0 && (
              <TableEmptyState
                colSpan={5}
                message={
                  search
                    ? "Nenhuma seguradora encontrada pra essa busca."
                    : "Nenhuma seguradora cadastrada ainda."
                }
              />
            )}

            {!isLoading &&
              !isError &&
              filteredInsurers?.map((insurer, index) => (
                <TableRow key={insurer.id}>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Mover para cima"
                            disabled={hasActiveSearch || reorderInsurer.isPending || index === 0}
                            onClick={() => handleMove(index, -1)}
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Mover para cima</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Mover para baixo"
                            disabled={
                              hasActiveSearch ||
                              reorderInsurer.isPending ||
                              index === filteredInsurers.length - 1
                            }
                            onClick={() => handleMove(index, 1)}
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Mover para baixo</TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground">{insurer.name}</TableCell>
                  <TableCell className="font-mono-data text-muted-foreground">
                    {formatCnpj(insurer.cnpj)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {insurer.contact_name ??
                      (insurer.phone ? formatPhone(insurer.phone) : null) ??
                      insurer.email ??
                      "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button asChild variant="ghost" size="icon-sm">
                            <Link to={`/admin/insurers/${insurer.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Ver</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button asChild variant="ghost" size="icon-sm">
                            <Link to={`/admin/insurers/${insurer.id}/edit`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Editar</TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      <Outlet />
    </>
  );
}
