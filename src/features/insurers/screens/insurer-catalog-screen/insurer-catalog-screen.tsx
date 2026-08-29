import { ArrowDown, ArrowUp, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { useAuthStore } from "@/features/auth";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Switch } from "@/shared/components/ui/switch";
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

import { useDisableInsurer } from "../../hooks/use-disable-insurer";
import { useEnableInsurer } from "../../hooks/use-enable-insurer";
import { useInsurerCatalog } from "../../hooks/use-insurer-catalog";
import { useReorderBrokerageInsurer } from "../../hooks/use-reorder-brokerage-insurer";
import type { InsurerCatalogEntry } from "../../types/insurer";

function isEnabled(insurer: InsurerCatalogEntry) {
  return insurer.brokerage_disabled_insurers.length === 0;
}

// Ordem própria da corretora (brokerage_insurer_order) prevalece; sem
// preferência definida, cai pro display_order do catálogo global; sem
// nenhum dos dois, vai pro fim (Infinity), desempate por nome.
function effectiveOrder(insurer: InsurerCatalogEntry) {
  return insurer.brokerage_insurer_order[0]?.display_order ?? insurer.display_order ?? Infinity;
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function InsurerCatalogScreen() {
  const { data: insurers, isLoading, isError, refetch } = useInsurerCatalog();
  const disableInsurer = useDisableInsurer();
  const enableInsurer = useEnableInsurer();
  const reorderInsurer = useReorderBrokerageInsurer();
  const [search, setSearch] = useState("");
  const hasActiveSearch = search.trim() !== "";
  // Só brokerage_admin habilita/desabilita e reordena (RLS restringe a mesma
  // coisa) — platform_admin acessa a mesma tela pra conferir o catálogo, mas
  // só em modo leitura.
  const canToggle = useAuthStore((state) => state.usuario?.role === "brokerage_admin");

  const sortedInsurers = useMemo(() => {
    if (!insurers) return insurers;
    return [...insurers].sort((a, b) => {
      const diff = effectiveOrder(a) - effectiveOrder(b);
      return diff !== 0 ? diff : a.name.localeCompare(b.name);
    });
  }, [insurers]);

  const filteredInsurers = useMemo(() => {
    if (!sortedInsurers) return sortedInsurers;
    const query = normalize(search.trim());
    if (!query) return sortedInsurers;

    return sortedInsurers.filter((insurer) => {
      const name = normalize(insurer.name);
      const cnpj = normalize(insurer.cnpj);
      return name.includes(query) || cnpj.includes(query);
    });
  }, [sortedInsurers, search]);

  const totalCount = insurers?.length ?? 0;
  const filteredCount = filteredInsurers?.length ?? totalCount;

  function handleToggle(insurer: InsurerCatalogEntry, checked: boolean) {
    const mutation = checked ? enableInsurer : disableInsurer;
    mutation.mutate(insurer.id, {
      onError: (error) => {
        toast.error(
          error.message || `Não foi possível ${checked ? "habilitar" : "desabilitar"} a seguradora`,
        );
      },
    });
  }

  // Sempre opera sobre a lista completa (sortedInsurers) — com busca ativa os
  // botões ficam desabilitados, então `index` aqui sempre bate com a posição
  // real na lista sem filtro.
  function handleMove(index: number, direction: -1 | 1) {
    if (!sortedInsurers) return;
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= sortedInsurers.length) return;

    const current = sortedInsurers[index];
    const other = sortedInsurers[targetIndex];
    const currentOrder = current.brokerage_insurer_order[0]?.display_order ?? index;
    const otherOrder = other.brokerage_insurer_order[0]?.display_order ?? targetIndex;

    reorderInsurer.mutate({
      first: { insurerId: current.id, display_order: otherOrder },
      second: { insurerId: other.id, display_order: currentOrder },
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4">
        <h1 className="text-lg font-semibold text-foreground">Minhas seguradoras</h1>
        <p className="text-xs text-muted-foreground">
          Habilite, desabilite e reordene as seguradoras disponíveis para sua corretora.
          {!isLoading &&
            insurers &&
            ` ${
              filteredCount !== totalCount
                ? `${filteredCount} de ${totalCount} seguradoras`
                : totalCount === 1
                  ? "1 seguradora cadastrada"
                  : `${totalCount} seguradoras cadastradas`
            }`}
        </p>
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
            {canToggle && <TableHead className="w-10">Ordem</TableHead>}
            <TableHead>Nome</TableHead>
            <TableHead>CNPJ</TableHead>
            <TableHead className="text-right">Habilitada</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading &&
            Array.from({ length: 3 }).map((_, index) => (
              <TableSkeletonRow key={index} cells={canToggle ? 4 : 3} />
            ))}

          {isError && !isLoading && (
            <TableErrorState
              colSpan={canToggle ? 4 : 3}
              message="Não foi possível carregar as seguradoras."
              onRetry={() => refetch()}
            />
          )}

          {!isLoading && !isError && filteredInsurers?.length === 0 && (
            <TableEmptyState
              colSpan={canToggle ? 4 : 3}
              message={
                search
                  ? "Nenhuma seguradora encontrada pra essa busca."
                  : "Nenhuma seguradora disponível ainda."
              }
            />
          )}

          {!isLoading &&
            !isError &&
            filteredInsurers?.map((insurer) => {
              const index = sortedInsurers?.findIndex((i) => i.id === insurer.id) ?? -1;
              return (
                <TableRow key={insurer.id}>
                  {canToggle && (
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Mover para cima"
                          disabled={hasActiveSearch || reorderInsurer.isPending || index === 0}
                          onClick={() => handleMove(index, -1)}
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Mover para baixo"
                          disabled={
                            hasActiveSearch ||
                            reorderInsurer.isPending ||
                            index === (sortedInsurers?.length ?? 1) - 1
                          }
                          onClick={() => handleMove(index, 1)}
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                  <TableCell className="text-foreground">{insurer.name}</TableCell>
                  <TableCell className="font-mono-data text-muted-foreground">
                    {insurer.cnpj}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end">
                      {canToggle ? (
                        <Switch
                          checked={isEnabled(insurer)}
                          onCheckedChange={(checked) => handleToggle(insurer, checked)}
                          disabled={disableInsurer.isPending || enableInsurer.isPending}
                        />
                      ) : (
                        <Badge variant={isEnabled(insurer) ? "default" : "secondary"}>
                          {isEnabled(insurer) ? "Habilitada" : "Desabilitada"}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </div>
  );
}
