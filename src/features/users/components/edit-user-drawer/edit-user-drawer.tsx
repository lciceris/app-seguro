import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
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

import { ROLE_LABELS } from "../../constants/role-labels";
import { useUpdateUser } from "../../hooks/use-update-user";
import { useUser } from "../../hooks/use-user";
import type { User } from "../../types/user";
import {
  EDITABLE_ROLES,
  editUserSchema,
  type EditUserFormValues,
} from "../../validations/edit-user-schema";

// Formulário próprio, montado só quando `user` já existe — os valores atuais
// viram `defaultValues` do useForm diretamente (em vez de popular via reset()
// num useEffect), porque o Select controlado só reflete o valor selecionado
// corretamente quando ele já nasce com esse valor.
function EditUserForm({ user, onSuccess }: { user: User; onSuccess: () => void }) {
  const updateUser = useUpdateUser();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      full_name: user.full_name,
      phone: user.phone ?? "",
      role: user.role as EditUserFormValues["role"],
    },
  });

  function onSubmit(values: EditUserFormValues) {
    updateUser.mutate(
      {
        id: user.id,
        full_name: values.full_name,
        phone: values.phone === "" || values.phone === undefined ? null : values.phone,
        role: values.role,
      },
      {
        onSuccess: () => {
          toast.success("Usuário atualizado com sucesso");
          onSuccess();
        },
        onError: (error) => {
          toast.error(error.message || "Não foi possível atualizar o usuário");
        },
      },
    );
  }

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
        <form
          id="edit-user-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="full_name">Nome</Label>
              <Input id="full_name" {...register("full_name")} />
              {errors.full_name && (
                <p className="text-sm text-destructive">{errors.full_name.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" {...register("phone")} />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
            </div>

            <div className="col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="role">Perfil</Label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="role" className="w-full">
                      <SelectValue placeholder="Selecione um perfil" />
                    </SelectTrigger>
                    <SelectContent>
                      {EDITABLE_ROLES.map((role) => (
                        <SelectItem key={role} value={role}>
                          {ROLE_LABELS[role]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
            </div>
          </div>
        </form>
      </div>

      <SheetFooter className="flex-row justify-end border-t border-border bg-card">
        <Button variant="outline" onClick={onSuccess}>
          Cancelar
        </Button>
        <Button type="submit" form="edit-user-form" disabled={updateUser.isPending}>
          {updateUser.isPending ? "Salvando..." : "Salvar"}
        </Button>
      </SheetFooter>
    </>
  );
}

export function EditUserDrawer() {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const { data: user, isLoading, isError, refetch } = useUser(userId!);

  function handleClose() {
    navigate("/users");
  }

  return (
    <Sheet open onOpenChange={(open) => !open && handleClose()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Editar usuário</SheetTitle>
        </SheetHeader>

        {(isLoading || isError) && (
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
            {isLoading && (
              <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            )}

            {isError && !isLoading && (
              <div className="rounded-xl border border-border bg-card shadow-sm p-5 text-center">
                <p className="mb-2 text-sm text-muted-foreground">
                  Não foi possível carregar os dados do usuário.
                </p>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  Tentar novamente
                </Button>
              </div>
            )}
          </div>
        )}

        {!isLoading && !isError && user && <EditUserForm user={user} onSuccess={handleClose} />}
      </SheetContent>
    </Sheet>
  );
}
