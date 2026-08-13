import { Eye, Pencil, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, Outlet } from "react-router-dom";

import { useAuthStore } from "@/features/auth";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip";

import { CLIENT_TYPE_LABELS, SEGMENT_BADGE_CLASSES, SEGMENT_LABELS } from "../../constants/labels";
import { useClients } from "../../hooks/use-clients";

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function ClientsListScreen() {
  const { data: clients, isLoading, isError, refetch } = useClients();
  const usuario = useAuthStore((state) => state.usuario);
  const canEdit = usuario?.role !== "viewer";
  const [search, setSearch] = useState("");

  const filteredClients = useMemo(() => {
    if (!clients) return clients;
    const query = normalize(search.trim());
    if (!query) return clients;

    return clients.filter((client) => {
      const legalName = normalize(client.legal_name);
      const tradeName = client.trade_name ? normalize(client.trade_name) : "";
      const taxId = client.tax_id ? normalize(client.tax_id) : "";
      return legalName.includes(query) || tradeName.includes(query) || taxId.includes(query);
    });
  }, [clients, search]);

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">Clientes</h1>
        {canEdit && (
          <Button asChild>
            <Link to="/clients/add">Novo cliente</Link>
          </Button>
        )}
      </div>

      <div className="mb-4 relative max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por nome ou CPF/CNPJ"
          className="pl-9"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Nome
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Tipo
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                CPF/CNPJ
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Cidade/UF
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Segmento
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
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-16" />
                  </td>
                  <td className="px-4 py-3" />
                </tr>
              ))}

            {isError && !isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center">
                  <p className="mb-2 text-sm text-muted-foreground">
                    Não foi possível carregar os clientes.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => refetch()}>
                    Tentar novamente
                  </Button>
                </td>
              </tr>
            )}

            {!isLoading && !isError && filteredClients?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  {search
                    ? "Nenhum cliente encontrado pra essa busca."
                    : "Nenhum cliente cadastrado ainda."}
                </td>
              </tr>
            )}

            {!isLoading &&
              !isError &&
              filteredClients?.map((client) => (
                <tr
                  key={client.id}
                  className="border-b border-border last:border-0 hover:bg-muted/50"
                >
                  <td className="px-4 py-3 text-foreground">
                    {client.legal_name}
                    {client.trade_name && (
                      <span className="block text-xs text-muted-foreground">
                        {client.trade_name}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {CLIENT_TYPE_LABELS[client.client_type]}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{client.tax_id ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {client.city ? `${client.city}${client.state ? `/${client.state}` : ""}` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={SEGMENT_BADGE_CLASSES[client.segment]}>
                      {SEGMENT_LABELS[client.segment]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button asChild variant="ghost" size="icon-sm">
                            <Link to={`/clients/${client.id}`}>
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
                              <Link to={`/clients/${client.id}/edit`}>
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
