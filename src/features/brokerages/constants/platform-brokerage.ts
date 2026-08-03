// Corretora especial da plataforma (seed via migration, id fixo) — só usuários
// platform_admin pertencem a ela. Nunca aparece na listagem de gestão de
// corretoras-cliente (ver .agents/specs/brokerages/design.md).
export const PLATFORM_BROKERAGE_ID = "00000000-0000-0000-0000-000000000001";
