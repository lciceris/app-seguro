import { cn } from "@/shared/lib/utils";

export interface DetailSummaryBandItem {
  label: string;
  value: React.ReactNode;
}

export function DetailSummaryBand({
  items,
  className,
}: {
  items: DetailSummaryBandItem[];
  className?: string;
}) {
  return (
    <div className={cn("mb-4 flex flex-wrap gap-4 rounded-lg bg-table-header p-4", className)}>
      {items.map((item, index) => (
        <div
          key={item.label}
          className={cn(
            "flex flex-1 flex-col gap-0.5",
            index !== items.length - 1 && "border-r border-border-strong pr-4",
          )}
        >
          <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            {item.label}
          </span>
          <span className="text-sm font-bold text-foreground">{item.value ?? "—"}</span>
        </div>
      ))}
    </div>
  );
}
