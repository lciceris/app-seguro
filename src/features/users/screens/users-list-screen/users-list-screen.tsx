import { Eye, KeyRound, Pencil } from "lucide-react";
import { useState } from "react";
import { Link, Outlet } from "react-router-dom";

import { useAuthStore } from "@/features/auth";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip";

import { ROLE_LABELS } from "../../constants/role-labels";
import { useUsers } from "../../hooks/use-users";
import { ResetPasswordDialog } from "../../components/reset-password-dialog";

export function UsersListScreen() {
  const { data: users, isLoading, isError, refetch } = useUsers();
  const usuario = useAuthStore((state) => state.usuario);
  const canManageUsers = usuario?.role === "platform_admin" || usuario?.role === "brokerage_admin";
  const [resetPasswordUserId, setResetPasswordUserId] = useState<string | null>(null);

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">Usuários</h1>
        {canManageUsers && (
          <Button asChild>
            <Link to="/users/add">Convidar usuário</Link>
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Nome
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                E-mail
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Perfil
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Status
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
                    <Skeleton className="h-4 w-40" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-16" />
                  </td>
                  <td className="px-4 py-3" />
                </tr>
              ))}

            {isError && !isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center">
                  <p className="mb-2 text-sm text-muted-foreground">
                    Não foi possível carregar os usuários.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => refetch()}>
                    Tentar novamente
                  </Button>
                </td>
              </tr>
            )}

            {!isLoading && !isError && users?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Nenhum usuário cadastrado ainda.
                </td>
              </tr>
            )}

            {!isLoading &&
              !isError &&
              users?.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-border last:border-0 hover:bg-muted/50"
                >
                  <td className="px-4 py-3 text-foreground">{user.full_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{ROLE_LABELS[user.role]}</td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={
                        user.status === "active"
                          ? "border-transparent bg-emerald-100 text-emerald-700"
                          : "border-transparent bg-slate-100 text-slate-500"
                      }
                    >
                      {user.status === "active" ? "Ativo" : "Inativo"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button asChild variant="ghost" size="icon-sm">
                            <Link to={`/users/${user.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Ver</TooltipContent>
                      </Tooltip>
                      {canManageUsers && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button asChild variant="ghost" size="icon-sm">
                              <Link to={`/users/${user.id}/edit`}>
                                <Pencil className="h-4 w-4" />
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Editar</TooltipContent>
                        </Tooltip>
                      )}
                      {canManageUsers && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => setResetPasswordUserId(user.id)}
                            >
                              <KeyRound className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Resetar senha</TooltipContent>
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

      <ResetPasswordDialog
        userId={resetPasswordUserId}
        onOpenChange={(open) => !open && setResetPasswordUserId(null)}
      />
    </div>
  );
}
