import { useNavigate, useParams } from "react-router-dom";

import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";

import { ROLE_LABELS } from "../../constants/role-labels";
import { useUser } from "../../hooks/use-user";

export function UserDetailDrawer() {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const { data: user, isLoading, isError, refetch } = useUser(userId!);

  function handleClose() {
    navigate("/users");
  }

  return (
    <Sheet open onOpenChange={(open) => !open && handleClose()}>
      <SheetContent size="lg">
        <SheetHeader>
          <SheetTitle>Detalhe do usuário</SheetTitle>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto bg-muted p-5">
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
            <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Nome
                </span>
                <span className="text-sm text-foreground">{user.full_name}</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  E-mail
                </span>
                <span className="text-sm text-foreground">{user.email}</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Telefone
                </span>
                <span className="text-sm text-foreground">{user.phone ?? "Não informado"}</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Perfil
                </span>
                <span className="text-sm text-foreground">{ROLE_LABELS[user.role]}</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Status
                </span>
                <span
                  className={
                    user.status === "active"
                      ? "text-sm font-medium text-emerald-700"
                      : "text-sm font-medium text-slate-500"
                  }
                >
                  {user.status === "active" ? "Ativo" : "Inativo"}
                </span>
              </div>
            </div>
          )}
        </div>

        <SheetFooter className="flex-row justify-end border-t border-border bg-card">
          <Button variant="outline" onClick={handleClose}>
            Fechar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
