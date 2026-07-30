// O gate de verify_jwt da plataforma intercepta o preflight OPTIONS antes dele
// chegar no código da função (preflight não carrega Authorization) e responde
// 401 sem cabeçalho CORS, quebrando toda chamada feita a partir do navegador.
// Por isso essas funções são deployadas com --no-verify-jwt e fazem a própria
// verificação via `verify-admin.ts`.
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
