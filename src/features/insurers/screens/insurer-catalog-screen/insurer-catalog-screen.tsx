import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { useAuthStore } from "@/features/auth";
import { Badge } from "@/shared/components/ui/badge";
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
import type { InsurerCatalogEntry } from "../../types/insurer";

function isEnabled(insurer: InsurerCatalogEntry) {
  return insurer.brokerage_disabled_insurers.length === 0;
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
  const [search, setSearch] = useState("");
  // Só brokerage_admin habilita/desabilita (RLS restringe a mesma coisa) — platform_admin
  // acessa a mesma tela pra conferir o catálogo, mas só em modo leitura.
  const canToggle = useAuthStore((state) => state.usuario?.role === "brokerage_admin");

  const filteredInsurers = useMemo(() => {
    if (!insurers) return insurers;
    const query = normalize(search.trim());
    if (!query) return insurers;

    return insurers.filter((insurer) => {
      const name = normalize(insurer.name);
      const cnpj = normalize(insurer.cnpj);
      return name.includes(query) || cnpj.includes(query);
    });
  }, [insurers, search]);

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

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4">
        <h1 className="text-lg font-semibold text-foreground">Minhas seguradoras</h1>
        <p className="text-xs text-muted-foreground">
          Habilite ou desabilite as seguradoras disponíveis para sua corretora.
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
            <TableHead>Nome</TableHead>
            <TableHead>CNPJ</TableHead>
            <TableHead className="text-right">Habilitada</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading &&
            Array.from({ length: 3 }).map((_, index) => <TableSkeletonRow key={index} cells={3} />)}

          {isError && !isLoading && (
            <TableErrorState
              colSpan={3}
              message="Não foi possível carregar as seguradoras."
              onRetry={() => refetch()}
            />
          )}

          {!isLoading && !isError && filteredInsurers?.length === 0 && (
            <TableEmptyState
              colSpan={3}
              message={
                search
                  ? "Nenhuma seguradora encontrada pra essa busca."
                  : "Nenhuma seguradora disponível ainda."
              }
            />
          )}

          {!isLoading &&
            !isError &&
            filteredInsurers?.map((insurer) => (
              <TableRow key={insurer.id}>
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
            ))}
        </TableBody>
      </Table>
    </div>
  );
}
