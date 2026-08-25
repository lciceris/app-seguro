import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";

import { useAdvancePolicyEndorsementStatus } from "../../hooks/use-advance-policy-endorsement-status";
import {
  insurerResponseSchema,
  type InsurerResponseFormValues,
} from "../../validations/insurer-response-schema";

function sanitizeNum(value: string | undefined) {
  return value === "" || value === undefined || Number.isNaN(Number(value)) ? null : Number(value);
}

function sanitize(value: string | undefined) {
  return value === "" || value === undefined ? null : value;
}

interface InsurerResponseFormProps {
  endorsementId: string;
  onBack: () => void;
}

// Sub-view do drawer (waiting -> presented) — navegação interna com ← Voltar
// em vez de modal (CLAUDE.md regra 4: nunca Dialog dentro de drawer).
export function InsurerResponseForm({ endorsementId, onBack }: InsurerResponseFormProps) {
  const advanceStatus = useAdvancePolicyEndorsementStatus();
  const { register, handleSubmit } = useForm<InsurerResponseFormValues>({
    resolver: zodResolver(insurerResponseSchema),
    defaultValues: { premium_adjustment: "", insurer_response_notes: "" },
  });

  function onSubmit(values: InsurerResponseFormValues) {
    advanceStatus.mutate(
      {
        id: endorsementId,
        status: "presented",
        premium_adjustment: sanitizeNum(values.premium_adjustment),
        insurer_response_notes: sanitize(values.insurer_response_notes),
      },
      {
        onSuccess: () => {
          toast.success("Retorno da seguradora registrado com sucesso");
          onBack();
        },
        onError: (error) => toast.error(error.message || "Não foi possível registrar o retorno"),
      },
    );
  }

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
        <button
          type="button"
          onClick={onBack}
          className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>

        <form
          id="insurer-response-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5"
        >
          <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Retorno da seguradora
          </p>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="premium_adjustment">Ajuste de prêmio (R$)</Label>
            <Input
              id="premium_adjustment"
              type="number"
              step="0.01"
              {...register("premium_adjustment")}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="insurer_response_notes">Notas do retorno</Label>
            <Textarea
              id="insurer_response_notes"
              rows={4}
              {...register("insurer_response_notes")}
            />
          </div>
        </form>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-border bg-card p-4">
        <Button variant="outline" onClick={onBack}>
          Cancelar
        </Button>
        <Button type="submit" form="insurer-response-form" disabled={advanceStatus.isPending}>
          {advanceStatus.isPending ? "Salvando..." : "Registrar e apresentar ao cliente"}
        </Button>
      </div>
    </>
  );
}
