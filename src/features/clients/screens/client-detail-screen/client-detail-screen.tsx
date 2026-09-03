import { ArrowLeft, Eye, Pencil, Star, Users, X } from "lucide-react";
import { useState } from "react";
import { Link, Outlet, useParams } from "react-router-dom";
import { toast } from "sonner";

import { useAuthStore } from "@/features/auth";
import {
  QUOTATION_STATUS_BADGE_CLASSES,
  QUOTATION_STATUS_LABELS,
  useQuotationsByClient,
} from "@/features/quotations";
import { useUsers } from "@/features/users";
import {
  DERIVED_POLICY_STATUS_BADGE_CLASSES,
  DERIVED_POLICY_STATUS_LABELS,
  getDerivedPolicyStatus,
  usePoliciesByClientDetailed,
} from "@/features/policies";
import {
  VEHICLE_TYPE_LABELS,
  VEHICLE_USAGE_LABELS,
  useVehiclesByClient,
} from "@/features/vehicles";
import { formatCnpj, formatCpf } from "@/shared/lib/masks";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { DetailField } from "@/shared/components/ui/detail-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableEmptyState,
  TableErrorState,
  TableHead,
  TableHeader as TableHeaderRow,
  TableRow,
  TableSkeletonRow,
} from "@/shared/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip";

import { CLIENT_TYPE_LABELS } from "../../constants/labels";
import { useAddClientSeller } from "../../hooks/use-add-client-seller";
import { useClient } from "../../hooks/use-client";
import { useClientSellers } from "../../hooks/use-client-sellers";
import { useRemoveClientSeller } from "../../hooks/use-remove-client-seller";
import { useSetPrimaryClientSeller } from "../../hooks/use-set-primary-client-seller";
import type { ClientSellerWithUser } from "../../types/client";

function formatCurrency(value: number | null) {
  if (value === null) return "—";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(`${value}T00:00:00`).toLocaleDateString("pt-BR");
}

function ClientDataTab({ client }: { client: NonNullable<ReturnType<typeof useClient>["data"]> }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
        <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Identificação
        </p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <div className="col-span-2">
            <DetailField
              label={client.client_type === "company" ? "Razão social" : "Nome completo"}
              value={client.legal_name}
            />
          </div>
          <DetailField label="Tipo" value={CLIENT_TYPE_LABELS[client.client_type]} />
          <DetailField
            label={client.client_type === "company" ? "CNPJ" : "CPF"}
            value={
              client.tax_id
                ? client.client_type === "company"
                  ? formatCnpj(client.tax_id)
                  : formatCpf(client.tax_id)
                : null
            }
          />
          {client.client_type === "company" && (
            <>
              <DetailField label="Nome fantasia" value={client.trade_name} />
              <DetailField label="CNAE" value={client.business_code} />
              <DetailField label="Setor" value={client.industry} />
              <DetailField label="Inscrição estadual" value={client.state_registration} />
            </>
          )}
          {client.client_type === "individual" && (
            <DetailField
              label="Data de nascimento"
              value={
                client.birth_date
                  ? new Date(client.birth_date + "T00:00:00").toLocaleDateString("pt-BR")
                  : null
              }
            />
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
        <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Endereço
        </p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <DetailField label="CEP" value={client.zip_code} />
          <div className="col-span-2">
            <DetailField label="Logradouro" value={client.street} />
          </div>
          <DetailField label="Número" value={client.street_number} />
          <DetailField label="Complemento" value={client.complement} />
          <DetailField label="Bairro" value={client.neighborhood} />
          <DetailField label="Cidade" value={client.city} />
          <DetailField label="UF" value={client.state} />
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
        <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Contato comercial
        </p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <DetailField label="Nome do contato" value={client.contact_name} />
          <DetailField label="Cargo" value={client.contact_role} />
          <DetailField label="E-mail" value={client.contact_email} />
          <DetailField label="Telefone" value={client.contact_phone} />
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
        <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Contato financeiro
        </p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <DetailField label="Nome do contato" value={client.financial_name} />
          <DetailField label="E-mail" value={client.financial_email} />
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
        <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Observações
        </p>
        <DetailField label="Observações" value={client.notes} />
      </div>
    </div>
  );
}

function ClientVehiclesTab({ clientId, canCreate }: { clientId: string; canCreate: boolean }) {
  const { data: vehicles, isLoading, isError, refetch } = useVehiclesByClient(clientId);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Veículos da frota
        </p>
        {canCreate && (
          <Button asChild>
            <Link to={`/vehicles/add?client_id=${clientId}&return_to=/clients/${clientId}`}>
              Adicionar veículo
            </Link>
          </Button>
        )}
      </div>
      <Table>
        <TableHeaderRow>
          <TableRow>
            <TableHead>Placa</TableHead>
            <TableHead>Classificação</TableHead>
            <TableHead>Marca/Modelo</TableHead>
            <TableHead>Ano</TableHead>
            <TableHead>Uso</TableHead>
            <TableHead>Valor declarado</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeaderRow>
        <TableBody>
          {isLoading &&
            Array.from({ length: 2 }).map((_, index) => <TableSkeletonRow key={index} cells={7} />)}

          {isError && !isLoading && (
            <TableErrorState
              colSpan={7}
              message="Não foi possível carregar os veículos."
              onRetry={() => refetch()}
            />
          )}

          {!isLoading && !isError && vehicles?.length === 0 && (
            <TableEmptyState colSpan={7} message="Nenhum veículo cadastrado ainda." />
          )}

          {!isLoading &&
            !isError &&
            vehicles?.map((vehicle) => (
              <TableRow key={vehicle.id}>
                <TableCell className="font-mono-data text-foreground">{vehicle.plate}</TableCell>
                <TableCell className="text-muted-foreground">
                  {vehicle.vehicle_type ? VEHICLE_TYPE_LABELS[vehicle.vehicle_type] : "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {[vehicle.brand, vehicle.model].filter(Boolean).join(" ") || "—"}
                </TableCell>
                <TableCell className="font-mono-data text-muted-foreground">
                  {vehicle.model_year ?? "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {vehicle.vehicle_usage ? VEHICLE_USAGE_LABELS[vehicle.vehicle_usage] : "—"}
                </TableCell>
                <TableCell className="font-mono-data text-muted-foreground">
                  {formatCurrency(vehicle.declared_value)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button asChild variant="ghost" size="icon-sm">
                          <Link to={`/vehicles/${vehicle.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Ver</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button asChild variant="ghost" size="icon-sm">
                          <Link to={`/vehicles/${vehicle.id}/edit`}>
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
  );
}

function ClientHistoryTab({ clientId, canCreate }: { clientId: string; canCreate: boolean }) {
  const {
    data: quotations,
    isLoading: isLoadingQuotations,
    isError: isErrorQuotations,
    refetch: refetchQuotations,
  } = useQuotationsByClient(clientId);
  const {
    data: policies,
    isLoading: isLoadingPolicies,
    isError: isErrorPolicies,
    refetch: refetchPolicies,
  } = usePoliciesByClientDetailed(clientId);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Cotações
          </p>
          {canCreate && (
            <Button asChild>
              <Link to={`/quotations/add?client_id=${clientId}&return_to=/clients/${clientId}`}>
                Nova cotação
              </Link>
            </Button>
          )}
        </div>
        <Table>
          <TableHeaderRow>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Vendedor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Prazo</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeaderRow>
          <TableBody>
            {isLoadingQuotations &&
              Array.from({ length: 2 }).map((_, index) => (
                <TableSkeletonRow key={index} cells={5} />
              ))}

            {isErrorQuotations && !isLoadingQuotations && (
              <TableErrorState
                colSpan={5}
                message="Não foi possível carregar as cotações."
                onRetry={() => refetchQuotations()}
              />
            )}

            {!isLoadingQuotations && !isErrorQuotations && quotations?.length === 0 && (
              <TableEmptyState colSpan={5} message="Nenhuma cotação registrada." />
            )}

            {!isLoadingQuotations &&
              !isErrorQuotations &&
              quotations?.map((quotation) => (
                <TableRow key={quotation.id}>
                  <TableCell className="font-mono-data text-foreground">
                    {quotation.number}
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
                    {formatDate(quotation.due_date)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">
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
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <p className="mb-4 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Apólices
        </p>
        <Table>
          <TableHeaderRow>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Seguradora</TableHead>
              <TableHead>Prêmio</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Vigência</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeaderRow>
          <TableBody>
            {isLoadingPolicies &&
              Array.from({ length: 2 }).map((_, index) => (
                <TableSkeletonRow key={index} cells={6} />
              ))}

            {isErrorPolicies && !isLoadingPolicies && (
              <TableErrorState
                colSpan={6}
                message="Não foi possível carregar as apólices."
                onRetry={() => refetchPolicies()}
              />
            )}

            {!isLoadingPolicies && !isErrorPolicies && policies?.length === 0 && (
              <TableEmptyState colSpan={6} message="Nenhuma apólice registrada." />
            )}

            {!isLoadingPolicies &&
              !isErrorPolicies &&
              policies?.map((policy) => {
                const derivedStatus = getDerivedPolicyStatus(policy);
                return (
                  <TableRow key={policy.id}>
                    <TableCell className="font-mono-data text-foreground">
                      {policy.policy_number ?? "Pendente de emissão"}
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
                      <div className="flex justify-end">
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
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function ClientDocumentsTab() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card p-12 text-center shadow-sm">
      <p className="text-sm font-medium text-foreground">Em breve</p>
      <p className="text-sm text-muted-foreground">Upload e gestão de documentos do cliente.</p>
    </div>
  );
}

function ClientSellersSection({ clientId, canManage }: { clientId: string; canManage: boolean }) {
  const { data: clientSellers, isLoading } = useClientSellers(clientId);
  const { data: users } = useUsers();
  const addClientSeller = useAddClientSeller();
  const removeClientSeller = useRemoveClientSeller();
  const setPrimaryClientSeller = useSetPrimaryClientSeller();

  const [sellerToAdd, setSellerToAdd] = useState("");
  const [pendingRemoval, setPendingRemoval] = useState<ClientSellerWithUser | null>(null);
  const [replacementPrimaryId, setReplacementPrimaryId] = useState("");

  const linkedSellerIds = new Set((clientSellers ?? []).map((cs) => cs.seller_id));
  const availableSellers = (users ?? []).filter(
    (u) => u.role === "seller" && !linkedSellerIds.has(u.id),
  );

  function handleSetPrimary(id: string) {
    setPrimaryClientSeller.mutate(
      { id, clientId },
      {
        onError: (error) => toast.error(error.message || "Não foi possível marcar como principal"),
      },
    );
  }

  function handleRemoveClick(clientSeller: ClientSellerWithUser) {
    const others = (clientSellers ?? []).filter((cs) => cs.id !== clientSeller.id);
    if (clientSeller.is_primary && others.length > 0) {
      setPendingRemoval(clientSeller);
      setReplacementPrimaryId("");
      return;
    }
    removeClientSeller.mutate(
      { clientSellerId: clientSeller.id, clientId },
      { onError: (error) => toast.error(error.message || "Não foi possível remover o vendedor") },
    );
  }

  function confirmRemovalWithReplacement() {
    if (!pendingRemoval || !replacementPrimaryId) return;
    removeClientSeller.mutate(
      { clientSellerId: pendingRemoval.id, clientId, newPrimaryId: replacementPrimaryId },
      {
        onSuccess: () => setPendingRemoval(null),
        onError: (error) => toast.error(error.message || "Não foi possível remover o vendedor"),
      },
    );
  }

  function handleAddSeller() {
    if (!sellerToAdd) return;
    addClientSeller.mutate(
      { clientId, sellerId: sellerToAdd, isPrimary: (clientSellers ?? []).length === 0 },
      {
        onSuccess: () => setSellerToAdd(""),
        onError: (error) => toast.error(error.message || "Não foi possível adicionar o vendedor"),
      },
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card shadow-sm p-5">
      <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        Vendedores vinculados
      </p>

      {isLoading && <Skeleton className="h-4 w-40" />}

      {!isLoading && clientSellers?.length === 0 && (
        <p className="text-sm text-muted-foreground">Nenhum vendedor vinculado ainda.</p>
      )}

      {!isLoading &&
        clientSellers?.map((clientSeller) => (
          <div key={clientSeller.id}>
            <div className="flex items-center gap-2">
              {canManage ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleSetPrimary(clientSeller.id)}
                  title={clientSeller.is_primary ? "Vendedor principal" : "Tornar principal"}
                >
                  <Star
                    className={
                      clientSeller.is_primary
                        ? "h-4 w-4 fill-warning text-warning"
                        : "h-4 w-4 text-muted-foreground"
                    }
                  />
                </Button>
              ) : (
                clientSeller.is_primary && <Star className="h-4 w-4 fill-warning text-warning" />
              )}
              <span className="flex-1 text-sm text-foreground">
                {clientSeller.users?.full_name}
              </span>
              {clientSeller.is_primary && <Badge variant="outline">Principal</Badge>}
              {canManage && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleRemoveClick(clientSeller)}
                  title="Remover"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {pendingRemoval?.id === clientSeller.id && (
              <div className="mt-2 flex flex-col gap-2 rounded-lg border border-border bg-muted p-3">
                <p className="text-sm text-foreground">
                  Escolha o novo vendedor principal antes de remover {clientSeller.users?.full_name}
                  .
                </p>
                <Select value={replacementPrimaryId} onValueChange={setReplacementPrimaryId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o novo principal" />
                  </SelectTrigger>
                  <SelectContent>
                    {(clientSellers ?? [])
                      .filter((cs) => cs.id !== clientSeller.id)
                      .map((cs) => (
                        <SelectItem key={cs.id} value={cs.id}>
                          {cs.users?.full_name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPendingRemoval(null)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    disabled={!replacementPrimaryId || removeClientSeller.isPending}
                    onClick={confirmRemovalWithReplacement}
                  >
                    Confirmar remoção
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}

      {canManage && availableSellers.length > 0 && (
        <div className="mt-2 flex items-center gap-2">
          <Select value={sellerToAdd} onValueChange={setSellerToAdd}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Adicionar vendedor" />
            </SelectTrigger>
            <SelectContent>
              {availableSellers.map((seller) => (
                <SelectItem key={seller.id} value={seller.id}>
                  {seller.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            disabled={!sellerToAdd || addClientSeller.isPending}
            onClick={handleAddSeller}
          >
            Adicionar
          </Button>
        </div>
      )}
    </div>
  );
}

function ClientSidebarCards({
  clientId,
  primarySellerName,
  onSeeSellers,
}: {
  clientId: string;
  primarySellerName: string | null;
  onSeeSellers: () => void;
}) {
  const { data: policies, isLoading } = usePoliciesByClientDetailed(clientId);

  const currentPolicy = policies
    ?.filter((policy) => {
      const status = getDerivedPolicyStatus(policy);
      return status !== "cancelled" && status !== "superseded";
    })
    .sort((a, b) => (b.coverage_end ?? "").localeCompare(a.coverage_end ?? ""))[0];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card shadow-sm p-5">
        <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Vendedor principal
        </p>
        {primarySellerName ? (
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 fill-warning text-warning" />
            <span className="text-sm text-foreground">{primarySellerName}</span>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Nenhum vendedor vinculado.</p>
        )}
        <Button variant="outline" size="sm" className="w-fit" onClick={onSeeSellers}>
          Ver todos
        </Button>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card shadow-sm p-5">
        <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Apólice vigente
        </p>
        {isLoading && <Skeleton className="h-4 w-32" />}
        {!isLoading && !currentPolicy && (
          <p className="text-sm text-muted-foreground">Nenhuma apólice vigente.</p>
        )}
        {!isLoading && currentPolicy && (
          <>
            <DetailField
              label="Número"
              value={currentPolicy.policy_number ?? "Pendente de emissão"}
            />
            <DetailField label="Seguradora" value={currentPolicy.insurers?.name ?? null} />
            <DetailField
              label="Vigência"
              value={`${formatDate(currentPolicy.coverage_start)} — ${formatDate(currentPolicy.coverage_end)}`}
            />
            <Button asChild variant="outline" size="sm" className="w-fit">
              <Link to={`/policies/${currentPolicy.id}`}>Ver detalhes</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export function ClientDetailScreen() {
  const { clientId } = useParams<{ clientId: string }>();
  const { data: client, isLoading, isError, refetch } = useClient(clientId!);
  const { data: clientSellers } = useClientSellers(clientId!);
  const usuario = useAuthStore((state) => state.usuario);
  const canManageSellers = usuario?.role !== "seller" && usuario?.role !== "viewer";
  const canEdit = usuario?.role !== "viewer";
  const canCreateRelated =
    usuario?.role === "seller" ||
    usuario?.role === "supervisor" ||
    usuario?.role === "brokerage_admin" ||
    usuario?.role === "platform_admin";
  const [activeTab, setActiveTab] = useState("dados");

  const primarySeller = clientSellers?.find((cs) => cs.is_primary);

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon-sm">
            <Link to="/clients">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>

          {isLoading && (
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-5 w-56" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          )}

          {!isLoading && client && (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-base font-semibold text-muted-foreground">
                {client.legal_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-semibold text-foreground">{client.legal_name}</h1>
                  <Badge variant="outline">{client.client_type === "company" ? "PJ" : "PF"}</Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {client.tax_id && (
                    <span className="font-mono-data">
                      {client.client_type === "company"
                        ? formatCnpj(client.tax_id)
                        : formatCpf(client.tax_id)}
                    </span>
                  )}
                  {primarySeller?.users?.full_name && (
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-warning text-warning" />
                      {primarySeller.users.full_name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {client && (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setActiveTab("sellers")}>
              <Users className="h-4 w-4" />
              Vendedores
            </Button>
            {canEdit && (
              <Button asChild variant="outline">
                <Link to={`/clients/${client.id}/edit`}>
                  <Pencil className="h-4 w-4" />
                  Editar
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>

      {isLoading && (
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      )}

      {isError && !isLoading && (
        <div className="rounded-xl border border-border bg-card shadow-sm p-5 text-center">
          <p className="mb-2 text-sm text-muted-foreground">
            Não foi possível carregar os dados do cliente.
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </div>
      )}

      {!isLoading && !isError && client && (
        <div className="grid grid-cols-[1fr_320px] gap-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList variant="line">
              <TabsTrigger value="dados">Dados</TabsTrigger>
              <TabsTrigger value="vehicles">Veículos</TabsTrigger>
              <TabsTrigger value="history">Histórico</TabsTrigger>
              <TabsTrigger value="documents">Documentos</TabsTrigger>
              <TabsTrigger value="sellers">Vendedores</TabsTrigger>
            </TabsList>

            <TabsContent value="dados" className="mt-4">
              <ClientDataTab client={client} />
            </TabsContent>

            <TabsContent value="vehicles" className="mt-4">
              <ClientVehiclesTab clientId={client.id} canCreate={canCreateRelated} />
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              <ClientHistoryTab clientId={client.id} canCreate={canCreateRelated} />
            </TabsContent>

            <TabsContent value="documents" className="mt-4">
              <ClientDocumentsTab />
            </TabsContent>

            <TabsContent value="sellers" className="mt-4">
              <ClientSellersSection clientId={client.id} canManage={canManageSellers} />
            </TabsContent>
          </Tabs>

          <ClientSidebarCards
            clientId={client.id}
            primarySellerName={primarySeller?.users?.full_name ?? null}
            onSeeSellers={() => setActiveTab("sellers")}
          />
        </div>
      )}

      <Outlet />
    </>
  );
}
