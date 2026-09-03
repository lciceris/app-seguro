import { ArrowLeft, Pencil } from "lucide-react";
import { Link, Outlet, useParams } from "react-router-dom";

import { useAuthStore } from "@/features/auth";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { DetailField } from "@/shared/components/ui/detail-field";
import { DetailSummaryBand } from "@/shared/components/ui/detail-summary-band";
import { Skeleton } from "@/shared/components/ui/skeleton";

import { ROLE_LABELS } from "../../constants/role-labels";
import { useUser } from "../../hooks/use-user";

export function UserDetailScreen() {
  const { userId } = useParams<{ userId: string }>();
  const { data: user, isLoading, isError, refetch } = useUser(userId!);
  const usuario = useAuthStore((state) => state.usuario);
  const canManageUsers = usuario?.role === "platform_admin" || usuario?.role === "brokerage_admin";

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon-sm">
            <Link to="/users">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-lg font-semibold text-foreground">
            {isLoading ? <Skeleton className="h-6 w-40" /> : (user?.full_name ?? "Usuário")}
          </h1>
          {!isLoading && user && (
            <Badge
              variant="outline"
              className={
                user.status === "active"
                  ? "border-transparent bg-success-bg text-success-text"
                  : "border-transparent bg-neutral-bg text-neutral-text"
              }
            >
              {user.status === "active" ? "Ativo" : "Inativo"}
            </Badge>
          )}
        </div>
        {user && canManageUsers && (
          <Button asChild variant="outline">
            <Link to={`/users/${user.id}/edit`}>
              <Pencil className="h-4 w-4" />
              Editar
            </Link>
          </Button>
        )}
      </div>

      {isLoading && (
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
      )}

      {isError && !isLoading && (
        <div className="rounded-xl border border-border bg-card p-5 text-center">
          <p className="mb-2 text-sm text-muted-foreground">
            Não foi possível carregar os dados do usuário.
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </div>
      )}

      {!isLoading && !isError && user && (
        <div className="rounded-xl border border-border bg-card p-5">
          <DetailSummaryBand
            items={[
              { label: "E-mail", value: user.email },
              { label: "Telefone", value: user.phone },
              { label: "Perfil", value: ROLE_LABELS[user.role] },
            ]}
          />
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <div className="col-span-2">
              <DetailField label="Nome" value={user.full_name} />
            </div>
            <DetailField label="E-mail" value={user.email} />
            <DetailField label="Telefone" value={user.phone} />
            <DetailField label="Perfil" value={ROLE_LABELS[user.role]} />
          </div>
        </div>
      )}

      <Outlet />
    </>
  );
}
