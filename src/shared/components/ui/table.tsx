import * as React from "react";

import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";

// Densidade "denso e técnico" da spec design-system — mais compacta que o
// shadcn padrão (px-3 py-1.5 em vez de p-2, texto 12.5px em vez de text-sm).
function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="overflow-hidden rounded-xl border border-border bg-card"
    >
      <div className="overflow-x-auto">
        <table
          data-slot="table"
          className={cn("w-full text-[12.5px] text-foreground", className)}
          {...props}
        />
      </div>
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return <thead data-slot="table-header" className={cn("bg-[#E9EDF2]", className)} {...props} />;
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return <tbody data-slot="table-body" className={className} {...props} />;
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn("border-b border-border last:border-0 hover:bg-background/30", className)}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "px-3 py-1.5 text-left text-[10.5px] font-semibold tracking-wider text-muted-foreground uppercase",
        className,
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return <td data-slot="table-cell" className={cn("px-3 py-1.5", className)} {...props} />;
}

// Linha de estado vazio ("Nenhum X encontrado/cadastrado") — mesmo padrão
// repetido nas 7 listagens antes desta spec.
function TableEmptyState({ colSpan, message }: { colSpan: number; message: string }) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="px-4 py-8 text-center text-muted-foreground">
        {message}
      </TableCell>
    </TableRow>
  );
}

// Linha de erro de carregamento + "Tentar novamente" — idem.
function TableErrorState({
  colSpan,
  message,
  onRetry,
}: {
  colSpan: number;
  message: string;
  onRetry: () => void;
}) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="px-4 py-8 text-center">
        <p className="mb-2 text-muted-foreground">{message}</p>
        <Button variant="outline" size="sm" onClick={onRetry}>
          Tentar novamente
        </Button>
      </TableCell>
    </TableRow>
  );
}

// Linha de loading — `cells` colunas de skeleton genérico.
function TableSkeletonRow({ cells }: { cells: number }) {
  return (
    <TableRow>
      {Array.from({ length: cells }).map((_, index) => (
        <TableCell key={index}>
          <Skeleton className="h-4 w-24" />
        </TableCell>
      ))}
    </TableRow>
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmptyState,
  TableErrorState,
  TableSkeletonRow,
};
