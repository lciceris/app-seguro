import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useAuthStore } from "@/features/auth";
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

import { ROLE_LABELS } from "../../constants/role-labels";
import { useInviteUser } from "../../hooks/use-invite-user";
import {
  INVITABLE_ROLES,
  inviteUserSchema,
  type InviteUserFormValues,
} from "../../validations/invite-user-schema";

const PLAN_LIMIT_ERROR = "Limite de usuários do plano atingido.";

export function InviteUserDrawer() {
  const navigate = useNavigate();
  const usuario = useAuthStore((state) => state.usuario);
  const inviteUser = useInviteUser();

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<InviteUserFormValues>({
    resolver: zodResolver(inviteUserSchema),
  });

  function handleClose() {
    navigate("/users");
  }

  function onSubmit(values: InviteUserFormValues) {
    if (!usuario) return;

    inviteUser.mutate(
      {
        full_name: values.full_name,
        email: values.email,
        phone: values.phone === "" || values.phone === undefined ? null : values.phone,
        role: values.role,
        brokerage_id: usuario.brokerage_id,
      },
      {
        onSuccess: () => {
          toast.success("Usuário convidado com sucesso");
          handleClose();
        },
        onError: (error) => {
          if (error.message === PLAN_LIMIT_ERROR) {
            setError("role", { message: PLAN_LIMIT_ERROR });
            return;
          }
          toast.error(error.message || "Não foi possível convidar o usuário");
        },
      },
    );
  }

  return (
    <Sheet open onOpenChange={(open) => !open && handleClose()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Convidar usuário</SheetTitle>
        </SheetHeader>

        <form
          id="invite-user-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-1 flex-col gap-4 overflow-y-auto p-5"
        >
          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="full_name">Nome</Label>
                <Input id="full_name" {...register("full_name")} />
                {errors.full_name && (
                  <p className="text-sm text-destructive">{errors.full_name.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" {...register("email")} />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
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
                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                      <SelectTrigger id="role" className="w-full">
                        <SelectValue placeholder="Selecione um perfil" />
                      </SelectTrigger>
                      <SelectContent>
                        {INVITABLE_ROLES.map((role) => (
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
          </div>
        </form>

        <SheetFooter className="flex-row justify-end">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" form="invite-user-form" disabled={inviteUser.isPending}>
            {inviteUser.isPending ? "Convidando..." : "Convidar"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
