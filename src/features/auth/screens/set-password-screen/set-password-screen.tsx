import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

import { INITIAL_ROUTE_BY_ROLE } from "../../constants/initial-route-by-role";
import { useSetPassword } from "../../hooks/use-set-password";
import { useAuthStore } from "../../store/auth-store";
import {
  setPasswordSchema,
  type SetPasswordFormValues,
} from "../../validations/set-password-schema";

export function SetPasswordScreen() {
  const navigate = useNavigate();
  const usuario = useAuthStore((state) => state.usuario);
  const setPassword = useSetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SetPasswordFormValues>({
    resolver: zodResolver(setPasswordSchema),
  });

  function onSubmit(values: SetPasswordFormValues) {
    setPassword.mutate(values.password, {
      onSuccess: () => {
        if (usuario) {
          navigate(INITIAL_ROUTE_BY_ROLE[usuario.role], { replace: true });
        }
      },
      onError: () => {
        toast.error("Não foi possível definir a senha. Tente novamente.");
      },
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-sm">
        <h1 className="mb-1 text-lg font-semibold text-foreground">Defina sua senha</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Escolha uma senha para acessar sua conta.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Nova senha</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirmPassword">Confirmar senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button type="submit" disabled={setPassword.isPending} className="mt-2">
            {setPassword.isPending ? "Salvando..." : "Salvar senha"}
          </Button>
        </form>
      </div>
    </div>
  );
}
