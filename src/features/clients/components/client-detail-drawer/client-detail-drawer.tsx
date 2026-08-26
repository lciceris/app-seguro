import { Star, X } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { useAuthStore } from "@/features/auth";
import { useUsers } from "@/features/users";
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
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";
import { Skeleton } from "@/shared/components/ui/skeleton";

import { CLIENT_TYPE_LABELS, SEGMENT_BADGE_CLASSES, SEGMENT_LABELS } from "../../constants/labels";
import { useAddClientSeller } from "../../hooks/use-add-client-seller";
import { useClient } from "../../hooks/use-client";
import { useClientSellers } from "../../hooks/use-client-sellers";
import { useRemoveClientSeller } from "../../hooks/use-remove-client-seller";
import { useSetPrimaryClientSeller } from "../../hooks/use-set-primary-client-seller";
import type { ClientSellerWithUser } from "../../types/client";

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
                        ? "h-4 w-4 fill-amber-400 text-amber-400"
                        : "h-4 w-4 text-muted-foreground"
                    }
                  />
                </Button>
              ) : (
                clientSeller.is_primary && (
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                )
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

export function ClientDetailDrawer() {
  const navigate = useNavigate();
  const { clientId } = useParams<{ clientId: string }>();
  const { data: client, isLoading, isError, refetch } = useClient(clientId!);
  const usuario = useAuthStore((state) => state.usuario);
  const canManageSellers = usuario?.role !== "seller" && usuario?.role !== "viewer";

  function handleClose() {
    navigate("/clients");
  }

  return (
    <Sheet open onOpenChange={(open) => !open && handleClose()}>
      <SheetContent size="lg">
        <SheetHeader>
          <SheetTitle>Detalhe do cliente</SheetTitle>
        </SheetHeader>

        <div className="flex-1 min-h-0 overflow-y-auto bg-background">
          <div className="mx-auto flex w-full max-w-[1000px] flex-col gap-4 p-5">
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
              <>
                <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
                  <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Identificação
                  </p>
                  <DetailField label="Tipo" value={CLIENT_TYPE_LABELS[client.client_type]} />
                  <DetailField label="Razão social / Nome completo" value={client.legal_name} />
                  <DetailField label="Nome fantasia" value={client.trade_name} />
                  <DetailField label="CPF/CNPJ" value={client.tax_id} />
                  <DetailField
                    label="Data de nascimento"
                    value={
                      client.birth_date
                        ? new Date(client.birth_date + "T00:00:00").toLocaleDateString("pt-BR")
                        : null
                    }
                  />
                  <DetailField label="CNAE" value={client.business_code} />
                  <DetailField label="Setor" value={client.industry} />
                  <DetailField label="Inscrição estadual" value={client.state_registration} />
                </div>

                <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
                  <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Endereço
                  </p>
                  <DetailField label="CEP" value={client.zip_code} />
                  <DetailField label="Logradouro" value={client.street} />
                  <DetailField label="Número" value={client.street_number} />
                  <DetailField label="Complemento" value={client.complement} />
                  <DetailField label="Bairro" value={client.neighborhood} />
                  <DetailField label="Cidade" value={client.city} />
                  <DetailField label="UF" value={client.state} />
                </div>

                <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
                  <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Contato comercial
                  </p>
                  <DetailField label="Nome do contato" value={client.contact_name} />
                  <DetailField label="Cargo" value={client.contact_role} />
                  <DetailField label="E-mail" value={client.contact_email} />
                  <DetailField label="Telefone" value={client.contact_phone} />
                </div>

                <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
                  <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Contato financeiro
                  </p>
                  <DetailField label="Nome do contato" value={client.financial_name} />
                  <DetailField label="E-mail" value={client.financial_email} />
                </div>

                <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
                  <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Configurações
                  </p>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                      Segmento
                    </span>
                    <Badge
                      variant="outline"
                      className={`w-fit ${SEGMENT_BADGE_CLASSES[client.segment]}`}
                    >
                      {SEGMENT_LABELS[client.segment]}
                    </Badge>
                  </div>
                  <DetailField label="Origem do lead" value={client.lead_source} />
                </div>

                <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
                  <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Observações
                  </p>
                  <DetailField label="Observações" value={client.notes} />
                </div>

                <ClientSellersSection clientId={client.id} canManage={canManageSellers} />
              </>
            )}
          </div>
        </div>

        <SheetFooter className="flex-row justify-end">
          <Button variant="outline" onClick={handleClose}>
            Fechar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
