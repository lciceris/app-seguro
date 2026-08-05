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
      "id, brokerage_id, role, status, full_name, avatar_url, brokerages(name, primary_color, logo_url, status)",
    )
    .eq("id", session.user.id)
    .single();

  if (error) throw error;

  // O embed de brokerages usa a policy brokerages_select_own_unconditional (ver
  // .agents/specs/brokerages/design.md) — funciona mesmo com o usuário ou a
  // corretora inativos, de propósito: é o que permite a tela de conta desativada
  // diferenciar as duas causas. Por isso `brokerage_status` (não a ausência do
  // embed) é o sinal correto de que a corretora está bloqueada.
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
    brokerage_status: data.brokerages?.status ?? null,
  };
}
