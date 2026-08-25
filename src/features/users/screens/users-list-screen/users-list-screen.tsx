import { Eye, KeyRound, Pencil, UserCheck, UserX } from "lucide-react";
import { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { toast } from "sonner";

import { useAuthStore } from "@/features/auth";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
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

import { ROLE_LABELS } from "../../constants/role-labels";
import { useUsers } from "../../hooks/use-users";
import { useReactivateUser } from "../../hooks/use-reactivate-user";
import { ResetPasswordDialog } from "../../components/reset-password-dialog";
import { DeactivateConfirmDialog } from "../../components/deactivate-confirm-dialog";

export function UsersListScreen() {
  const { data: users, isLoading, isError, refetch } = useUsers();
  const usuario = useAuthStore((state) => state.usuario);
  const canManageUsers = usuario?.role === "platform_admin" || usuario?.role === "brokerage_admin";
  const [resetPasswordUserId, setResetPasswordUserId] = useState<string | null>(null);
  const [deactivateUser, setDeactivateUser] = useState<{ id: string; name: string } | null>(null);
  const reactivateUser = useReactivateUser();

  function handleReactivate(id: string) {
    reactivateUser.mutate(id, {
      onSuccess: () => toast.success("Usuário reativado com sucesso"),
      onError: (error) => toast.error(error.message || "Não foi possível reativar o usuário"),
    });
  }

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

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>Perfil</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading &&
            Array.from({ length: 3 }).map((_, index) => <TableSkeletonRow key={index} cells={5} />)}

          {isError && !isLoading && (
            <TableErrorState
              colSpan={5}
              message="Não foi possível carregar os usuários."
              onRetry={() => refetch()}
            />
          )}

          {!isLoading && !isError && users?.length === 0 && (
            <TableEmptyState colSpan={5} message="Nenhum usuário cadastrado ainda." />
          )}

          {!isLoading &&
            !isError &&
            users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="text-foreground">{user.full_name}</TableCell>
                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                <TableCell className="text-muted-foreground">{ROLE_LABELS[user.role]}</TableCell>
                <TableCell>
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
                </TableCell>
                <TableCell>
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
                    {canManageUsers &&
                      user.id !== usuario?.id &&
                      (user.status === "active" ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() =>
                                setDeactivateUser({ id: user.id, name: user.full_name })
                              }
                            >
                              <UserX className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Desativar</TooltipContent>
                        </Tooltip>
                      ) : (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleReactivate(user.id)}
                            >
                              <UserCheck className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Reativar</TooltipContent>
                        </Tooltip>
                      ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

      <Outlet />

      <ResetPasswordDialog
        userId={resetPasswordUserId}
        onOpenChange={(open) => !open && setResetPasswordUserId(null)}
      />

      <DeactivateConfirmDialog
        userId={deactivateUser?.id ?? null}
        userName={deactivateUser?.name}
        onOpenChange={(open) => !open && setDeactivateUser(null)}
      />
    </div>
  );
}
