import { toast } from "sonner";

import { useAuthStore } from "@/features/auth";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Switch } from "@/shared/components/ui/switch";

import { useDisableInsurer } from "../../hooks/use-disable-insurer";
import { useEnableInsurer } from "../../hooks/use-enable-insurer";
import { useInsurerCatalog } from "../../hooks/use-insurer-catalog";
import type { InsurerCatalogEntry } from "../../types/insurer";

function isEnabled(insurer: InsurerCatalogEntry) {
  return insurer.brokerage_disabled_insurers.length === 0;
}

export function InsurerCatalogScreen() {
  const { data: insurers, isLoading, isError, refetch } = useInsurerCatalog();
  const disableInsurer = useDisableInsurer();
  const enableInsurer = useEnableInsurer();
  // Só brokerage_admin habilita/desabilita (RLS restringe a mesma coisa) — platform_admin
  // acessa a mesma tela pra conferir o catálogo, mas só em modo leitura.
  const canToggle = useAuthStore((state) => state.usuario?.role === "brokerage_admin");

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
    <div className="p-6">
      <div className="mb-4">
        <h1 className="text-lg font-semibold text-foreground">Minhas seguradoras</h1>
        <p className="text-sm text-muted-foreground">
          Habilite ou desabilite as seguradoras disponíveis para sua corretora.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Nome
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                CNPJ
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Habilitada
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
                  <td className="px-4 py-3" />
                </tr>
              ))}

            {isError && !isLoading && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center">
                  <p className="mb-2 text-sm text-muted-foreground">
                    Não foi possível carregar as seguradoras.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => refetch()}>
                    Tentar novamente
                  </Button>
                </td>
              </tr>
            )}

            {!isLoading && !isError && insurers?.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Nenhuma seguradora disponível ainda.
                </td>
              </tr>
            )}

            {!isLoading &&
              !isError &&
              insurers?.map((insurer) => (
                <tr
                  key={insurer.id}
                  className="border-b border-border last:border-0 hover:bg-muted/50"
                >
                  <td className="px-4 py-3 text-foreground">{insurer.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{insurer.cnpj ?? "—"}</td>
                  <td className="px-4 py-3">
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
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
