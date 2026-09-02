import { ArrowLeft, Pencil } from "lucide-react";
import { Link, Outlet, useParams } from "react-router-dom";

import { formatCnpj, formatPhone } from "@/shared/lib/masks";
import { Button } from "@/shared/components/ui/button";
import { DetailField } from "@/shared/components/ui/detail-field";
import { Skeleton } from "@/shared/components/ui/skeleton";

import { useInsurer } from "../../hooks/use-insurer";

export function InsurerDetailScreen() {
  const { insurerId } = useParams<{ insurerId: string }>();
  const { data: insurer, isLoading, isError, refetch } = useInsurer(insurerId!);

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon-sm">
            <Link to="/admin/insurers">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>

          {!isLoading && insurer && (
            <>
              {insurer.logo_url ? (
                <img
                  src={insurer.logo_url}
                  alt={insurer.name}
                  className="h-10 w-10 shrink-0 rounded-full border-[3px] border-primary object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-[3px] border-primary bg-muted text-sm font-semibold text-muted-foreground">
                  {insurer.name.charAt(0).toUpperCase()}
                </div>
              )}
            </>
          )}

          <h1 className="text-lg font-semibold text-foreground">
            {isLoading ? <Skeleton className="h-6 w-40" /> : (insurer?.name ?? "Seguradora")}
          </h1>
        </div>
        {insurer && (
          <Button asChild variant="outline">
            <Link to={`/admin/insurers/${insurer.id}/edit`}>
              <Pencil className="h-4 w-4" />
              Editar
            </Link>
          </Button>
        )}
      </div>

      {isLoading && (
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      )}

      {isError && !isLoading && (
        <div className="rounded-xl border border-border bg-card p-5 text-center">
          <p className="mb-2 text-sm text-muted-foreground">
            Não foi possível carregar os dados da seguradora.
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </div>
      )}

      {!isLoading && !isError && insurer && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Identificação
            </p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div className="col-span-2">
                <DetailField label="Nome" value={insurer.name} />
              </div>
              <DetailField label="CNPJ" value={formatCnpj(insurer.cnpj)} />
              <DetailField label="E-mail" value={insurer.email} />
              <DetailField
                label="Telefone comercial"
                value={insurer.phone ? formatPhone(insurer.phone) : insurer.phone}
              />
              <div className="col-span-2">
                <DetailField label="Website" value={insurer.website} />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Contato comercial
            </p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <DetailField label="Nome do contato" value={insurer.contact_name} />
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Configurações
            </p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <DetailField label="Prazo de resposta (dias)" value={insurer.response_time_days} />
              <DetailField label="Ordem de exibição" value={insurer.display_order} />
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Observações
            </p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div className="col-span-2">
                <DetailField label="Observações" value={insurer.notes} />
              </div>
            </div>
          </div>
        </div>
      )}

      <Outlet />
    </>
  );
}
