import { supabase } from "@/shared/lib/supabase";
import type { Usuario } from "../../store/auth-store";

export async function getSession(): Promise<Usuario | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return null;

  const { data, error } = await supabase
    .from("users")
    .select(
      "id, brokerage_id, role, status, full_name, avatar_url, brokerages(name, primary_color, logo_url)",
    )
    .eq("id", session.user.id)
    .single();

  if (error) throw error;

  // Para um usuário com status = inactive, get_my_brokerage_id() retorna NULL
  // (ver ADR 002 do backend), então o embed de brokerages vem vazio — não é erro,
  // é a RLS negando a leitura da corretora pra quem já não tem role/brokerage válidos.
  return {
    id: data.id,
    brokerage_id: data.brokerage_id,
    role: data.role,
    status: data.status,
    full_name: data.full_name,
    avatar_url: data.avatar_url,
    brokerage_name: data.brokerages?.name ?? null,
    primary_color: data.brokerages?.primary_color ?? null,
    logo_url: data.brokerages?.logo_url ?? null,
  };
}
