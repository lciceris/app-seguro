import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Skeleton } from "@/shared/components/ui/skeleton";

import { useOwnBrokerage } from "../../hooks/use-own-brokerage";
import { useUpdateOwnBrokerage } from "../../hooks/use-update-own-brokerage";
import type { Brokerage } from "../../types/brokerage";
import {
  editOwnBrokerageSchema,
  type EditOwnBrokerageFormValues,
} from "../../validations/edit-own-brokerage-schema";

// Formulário próprio, montado só quando `brokerage` já existe — os valores
// atuais viram `defaultValues` do useForm diretamente (mesmo padrão adotado
// nos drawers de edição, ver edit-brokerage-drawer/edit-user-drawer).
function OwnBrokerageForm({ brokerage }: { brokerage: Brokerage }) {
  const updateOwnBrokerage = useUpdateOwnBrokerage();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditOwnBrokerageFormValues>({
    resolver: zodResolver(editOwnBrokerageSchema),
    defaultValues: {
      name: brokerage.name,
      logo_url: brokerage.logo_url ?? "",
      primary_color: brokerage.primary_color ?? "",
    },
  });

  function onSubmit(values: EditOwnBrokerageFormValues) {
    updateOwnBrokerage.mutate(
      {
        id: brokerage.id,
        name: values.name,
        logo_url: values.logo_url === "" || values.logo_url === undefined ? null : values.logo_url,
        primary_color:
          values.primary_color === "" || values.primary_color === undefined
            ? null
            : values.primary_color,
      },
      {
        onSuccess: () => {
          toast.success("Corretora atualizada com sucesso");
        },
        onError: (error) => {
          toast.error(error.message || "Não foi possível atualizar a corretora");
        },
      },
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex max-w-lg flex-col gap-4 rounded-xl border border-border bg-card p-5"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Nome</Label>
        <Input id="name" {...register("name")} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="logo_url">URL do logo</Label>
        <Input id="logo_url" {...register("logo_url")} />
        {errors.logo_url && <p className="text-sm text-destructive">{errors.logo_url.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="primary_color">Cor primária</Label>
        <Input id="primary_color" placeholder="#3B82F6" {...register("primary_color")} />
        {errors.primary_color && (
          <p className="text-sm text-destructive">{errors.primary_color.message}</p>
        )}
      </div>

      <Button type="submit" disabled={updateOwnBrokerage.isPending} className="mt-2 self-start">
        {updateOwnBrokerage.isPending ? "Salvando..." : "Salvar"}
      </Button>
    </form>
  );
}

export function OwnBrokerageScreen() {
  const { data: brokerage, isLoading, isError, refetch } = useOwnBrokerage();

  return (
    <div className="p-6">
      <h1 className="mb-4 text-lg font-semibold text-foreground">Minha corretora</h1>

      {isLoading && (
        <div className="flex max-w-lg flex-col gap-4 rounded-xl border border-border bg-card p-5">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      )}

      {isError && !isLoading && (
        <div className="max-w-lg rounded-xl border border-border bg-card p-5 text-center">
          <p className="mb-2 text-sm text-muted-foreground">
            Não foi possível carregar os dados da corretora.
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </div>
      )}

      {!isLoading && !isError && brokerage && <OwnBrokerageForm brokerage={brokerage} />}
    </div>
  );
}
