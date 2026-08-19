import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";

import { queryClient } from "@/app/query";
import { useAuthStateListener } from "@/features/auth";
import { TooltipProvider } from "@/shared/components/ui/tooltip";

interface AppProvidersProps {
  children: ReactNode;
}

function AuthStateSync() {
  useAuthStateListener();
  return null;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider delayDuration={300}>
          <AuthStateSync />
          {children}
          {/* bottom-right, não top-right: cabeçalhos de tela de detalhe (Editar,
              ações de status da cotação) ficam encostados no canto superior
              direito — um toast ali em cima intercepta o clique do botão
              seguinte em fluxos de cliques em sequência (ex: avançar status
              da cotação várias vezes seguidas). */}
          <Toaster richColors position="bottom-right" />
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
