// O client do Supabase não expõe a mensagem de erro de uma Edge Function por
// padrão (`error.message` vem genérico) — o corpo real fica em `error.context`,
// um Response.
export async function extractFunctionErrorMessage(error: unknown): Promise<string | undefined> {
  if (error && typeof error === "object" && "context" in error) {
    const context = (error as { context?: Response }).context;
    if (context instanceof Response) {
      try {
        const body = await context.clone().json();
        if (typeof body?.error === "string") return body.error;
      } catch {
        // corpo não era JSON — segue com a mensagem padrão do client
      }
    }
  }
  return undefined;
}
