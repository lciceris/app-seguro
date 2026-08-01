import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

import { useUpdateUserPassword } from "../../hooks/use-update-user-password";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "../../validations/reset-password-schema";

interface ResetPasswordDialogProps {
  userId: string | null;
  onOpenChange: (open: boolean) => void;
}

export function ResetPasswordDialog({ userId, onOpenChange }: ResetPasswordDialogProps) {
  const updatePassword = useUpdateUserPassword();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  function handleOpenChange(open: boolean) {
    if (!open) reset();
    onOpenChange(open);
  }

  function onSubmit(values: ResetPasswordFormValues) {
    if (!userId) return;

    updatePassword.mutate(
      { user_id: userId, new_password: values.password },
      {
        onSuccess: () => {
          toast.success("Senha atualizada com sucesso");
          handleOpenChange(false);
        },
        onError: (error) => {
          toast.error(error.message || "Não foi possível atualizar a senha");
        },
      },
    );
  }

  return (
    <Dialog open={userId !== null} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resetar senha</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Nova senha</Label>
            <Input id="password" type="password" {...register("password")} />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirmPassword">Confirmar senha</Label>
            <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={updatePassword.isPending}>
              {updatePassword.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
