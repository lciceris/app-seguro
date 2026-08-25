export function DetailField({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        {label}
      </span>
      <span className="text-sm text-foreground">{value ?? "Não informado"}</span>
    </div>
  );
}
