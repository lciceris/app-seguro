import { Eye, KeyRound, Pencil, Search, UserCheck, UserX } from "lucide-react";
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

import { ROLE_LABELS } from "../../constants/role-labels";
import { useUsers } from "../../hooks/use-users";
import { useReactivateUser } from "../../hooks/use-reactivate-user";
import { ResetPasswordDialog } from "../../components/reset-password-dialog";
import { DeactivateConfirmDialog } from "../../components/deactivate-confirm-dialog";

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function UsersListScreen() {
  const { data: users, isLoading, isError, refetch } = useUsers();
  const usuario = useAuthStore((state) => state.usuario);
  const canManageUsers = usuario?.role === "platform_admin" || usuario?.role === "brokerage_admin";
  const [search, setSearch] = useState("");
  const [resetPasswordUserId, setResetPasswordUserId] = useState<string | null>(null);
  const [deactivateUser, setDeactivateUser] = useState<{ id: string; name: string } | null>(null);
  const reactivateUser = useReactivateUser();

  function handleReactivate(id: string) {
    reactivateUser.mutate(id, {
      onSuccess: () => toast.success("Usuário reativado com sucesso"),
      onError: (error) => toast.error(error.message || "Não foi possível reativar o usuário"),
    });
  }

  const filteredUsers = useMemo(() => {
    if (!users) return users;
    const query = normalize(search.trim());
    if (!query) return users;

    return users.filter((user) => {
      const name = normalize(user.full_name);
      const email = normalize(user.email);
      return name.includes(query) || email.includes(query);
    });
  }, [users, search]);

  const totalCount = users?.length ?? 0;
  const filteredCount = filteredUsers?.length ?? totalCount;

  return (
    <>
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Usuários</h1>
            {!isLoading && users && (
              <p className="text-xs text-muted-foreground">
                {filteredCount !== totalCount
                  ? `${filteredCount} de ${totalCount} usuários`
                  : totalCount === 1
                    ? "1 usuário cadastrado"
                    : `${totalCount} usuários cadastrados`}
              </p>
            )}
          </div>
          {canManageUsers && (
            <Button asChild>
              <Link to="/users/add">Convidar usuário</Link>
            </Button>
          )}
        </div>

        <div className="mb-4 relative max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome ou e-mail"
            className="pl-9"
          />
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
              Array.from({ length: 3 }).map((_, index) => (
                <TableSkeletonRow key={index} cells={5} />
              ))}

            {isError && !isLoading && (
              <TableErrorState
                colSpan={5}
                message="Não foi possível carregar os usuários."
                onRetry={() => refetch()}
              />
            )}

            {!isLoading && !isError && filteredUsers?.length === 0 && (
              <TableEmptyState
                colSpan={5}
                message={
                  search
                    ? "Nenhum usuário encontrado pra essa busca."
                    : "Nenhum usuário cadastrado ainda."
                }
              />
            )}

            {!isLoading &&
              !isError &&
              filteredUsers?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="text-foreground">{user.full_name}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell className="text-muted-foreground">{ROLE_LABELS[user.role]}</TableCell>
                  <TableCell>
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
      </div>

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
    </>
  );
}
