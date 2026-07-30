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
          <Toaster richColors position="top-right" />
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
