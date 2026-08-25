import { Eye, Pencil, Search, UserCheck, UserX } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { toast } from "sonner";

import { useAuthStore } from "@/features/auth";
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

import { CLIENT_TYPE_LABELS, SEGMENT_BADGE_CLASSES, SEGMENT_LABELS } from "../../constants/labels";
import { DeactivateClientConfirmDialog } from "../../components/deactivate-client-confirm-dialog";
import { useClients } from "../../hooks/use-clients";
import { useReactivateClient } from "../../hooks/use-reactivate-client";

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
  const canDeactivate =
    usuario?.role === "platform_admin" ||
    usuario?.role === "brokerage_admin" ||
    usuario?.role === "supervisor";
  const [search, setSearch] = useState("");
  const [deactivateClient, setDeactivateClient] = useState<{ id: string; name: string } | null>(
    null,
  );
  const reactivateClient = useReactivateClient();

  function handleReactivate(id: string) {
    reactivateClient.mutate(id, {
      onSuccess: () => toast.success("Cliente reativado com sucesso"),
      onError: (error) => toast.error(error.message || "Não foi possível reativar o cliente"),
    });
  }

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

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>CPF/CNPJ</TableHead>
            <TableHead>Cidade/UF</TableHead>
            <TableHead>Segmento</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading &&
            Array.from({ length: 3 }).map((_, index) => <TableSkeletonRow key={index} cells={6} />)}

          {isError && !isLoading && (
            <TableErrorState
              colSpan={6}
              message="Não foi possível carregar os clientes."
              onRetry={() => refetch()}
            />
          )}

          {!isLoading && !isError && filteredClients?.length === 0 && (
            <TableEmptyState
              colSpan={6}
              message={
                search
                  ? "Nenhum cliente encontrado pra essa busca."
                  : "Nenhum cliente cadastrado ainda."
              }
            />
          )}

          {!isLoading &&
            !isError &&
            filteredClients?.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="text-foreground">
                  {client.legal_name}
                  {client.trade_name && (
                    <span className="block text-xs text-muted-foreground">{client.trade_name}</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {CLIENT_TYPE_LABELS[client.client_type]}
                </TableCell>
                <TableCell className="font-mono-data text-muted-foreground">
                  {client.tax_id ?? "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {client.city ? `${client.city}${client.state ? `/${client.state}` : ""}` : "—"}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={SEGMENT_BADGE_CLASSES[client.segment]}>
                    {SEGMENT_LABELS[client.segment]}
                  </Badge>
                </TableCell>
                <TableCell>
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
                    {canDeactivate &&
                      (client.segment === "inactive" ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleReactivate(client.id)}
                            >
                              <UserCheck className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Reativar</TooltipContent>
                        </Tooltip>
                      ) : (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() =>
                                setDeactivateClient({ id: client.id, name: client.legal_name })
                              }
                            >
                              <UserX className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Inativar</TooltipContent>
                        </Tooltip>
                      ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

      <Outlet />

      <DeactivateClientConfirmDialog
        clientId={deactivateClient?.id ?? null}
        clientName={deactivateClient?.name}
        onOpenChange={(open) => !open && setDeactivateClient(null)}
      />
    </div>
  );
}
