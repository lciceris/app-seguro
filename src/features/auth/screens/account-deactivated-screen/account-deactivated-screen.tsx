import { useState } from "react";

import { useSession } from "../../hooks/use-session";

type Reason = "user" | "brokerage";

const MESSAGE_BY_REASON: Record<Reason, string> = {
  user: "Sua conta foi desativada. Entre em contato com o administrador da sua corretora para mais informações.",
  brokerage:
    "O acesso da sua corretora à plataforma foi desativado. Entre em contato com o suporte para mais informações.",
};

export function AccountDeactivatedScreen() {
  const { data: usuario } = useSession();
  const [reason, setReason] = useState<Reason | null>(null);

  // AccountDeactivatedPage desloga automaticamente ao montar esta tela (logout
  // de segurança, spec auth) — isso faz `usuario` virar null pouco depois do
  // primeiro render. Captura a causa uma única vez, na primeira vez que o dado
  // está disponível, e nunca mais atualiza — senão a mensagem mudaria sozinha
  // assim que o logout automático completasse. setState direto no corpo do
  // componente (não num useEffect) é o padrão que o próprio React documenta
  // pra "ajustar state durante o render" (https://react.dev/reference/react/useState#storing-information-from-previous-renders).
  if (usuario && reason === null) {
    setReason(usuario.status === "inactive" ? "user" : "brokerage");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 text-center shadow-sm">
        <h1 className="mb-2 text-lg font-semibold text-foreground">Conta desativada</h1>
        {reason && <p className="text-sm text-muted-foreground">{MESSAGE_BY_REASON[reason]}</p>}
      </div>
    </div>
  );
}
