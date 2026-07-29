export function AccountDeactivatedScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 text-center shadow-sm">
        <h1 className="mb-2 text-lg font-semibold text-foreground">Conta desativada</h1>
        <p className="text-sm text-muted-foreground">
          Sua conta foi desativada. Entre em contato com o administrador da sua corretora para mais
          informações.
        </p>
      </div>
    </div>
  );
}
