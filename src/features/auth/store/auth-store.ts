import { create } from "zustand";

import type { Database } from "@/shared/lib/supabase";

export interface Usuario {
  id: string;
  brokerage_id: string;
  role: Database["public"]["Enums"]["user_role"];
  status: Database["public"]["Enums"]["user_status"];
  full_name: string;
  email: string;
  avatar_url: string | null;
  // brokerage_name/primary_color/logo_url só ficam null num embed que falhou de
  // fato (não pelo status — a policy brokerages_select_own_unconditional garante
  // leitura da própria corretora mesmo desativada). brokerage_status é o sinal
  // explícito de que a corretora está bloqueada (ver protected-route.tsx).
  brokerage_name: string | null;
  primary_color: string | null;
  logo_url: string | null;
  brokerage_status: Database["public"]["Enums"]["brokerage_status"] | null;
}

interface AuthState {
  usuario: Usuario | null;
  setUsuario: (usuario: Usuario | null) => void;
  clearUsuario: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  usuario: null,
  setUsuario: (usuario) => set({ usuario }),
  clearUsuario: () => set({ usuario: null }),
}));
