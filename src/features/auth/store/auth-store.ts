import { create } from "zustand";

import type { Database } from "@/shared/lib/supabase";

export interface Usuario {
  id: string;
  brokerage_id: string;
  role: Database["public"]["Enums"]["user_role"];
  status: Database["public"]["Enums"]["user_status"];
  full_name: string;
  avatar_url: string | null;
  // Nulos quando status = inactive — a RLS bloqueia o embed de brokerages nesse caso.
  brokerage_name: string | null;
  primary_color: string | null;
  logo_url: string | null;
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
