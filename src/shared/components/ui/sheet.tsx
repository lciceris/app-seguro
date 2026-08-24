"use client";

import * as React from "react";
import { Dialog as SheetPrimitive } from "radix-ui";

import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { XIcon } from "lucide-react";

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({ ...props }: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({ ...props }: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal({ ...props }: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
        className,
      )}
      {...props}
    />
  );
}

const SHEET_CONTENT_SIZES = {
  md: "max-w-[720px]", // cadastro/edição
  lg: "max-w-[1000px]", // visualização
} as const;

// Sinaliza pro SheetHeader/SheetFooter que estão dentro do container
// centralizado (side="bottom") — eles "furam" essa largura pra ocupar a
// folha inteira (ver Requirement 1 de .agents/specs/drawer-pattern), sem
// precisar identificar/extrair esses filhos da árvore (o que seria frágil
// pra árvores condicionais como policy-endorsement-detail-drawer).
const SheetIsCenteredBodyContext = React.createContext(false);

function SheetContent({
  className,
  children,
  side = "bottom",
  size = "md",
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left";
  size?: keyof typeof SHEET_CONTENT_SIZES;
  showCloseButton?: boolean;
}) {
  const closeButton = showCloseButton && (
    <SheetPrimitive.Close data-slot="sheet-close" asChild>
      <Button variant="ghost" className="absolute top-3 right-3" size="icon-sm">
        <XIcon />
        <span className="sr-only">Close</span>
      </Button>
    </SheetPrimitive.Close>
  );

  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        data-side={side}
        className={cn(
          "fixed z-50 flex flex-col bg-popover bg-clip-padding text-sm text-popover-foreground shadow-lg transition duration-200 ease-in-out",
          "data-[side=bottom]:inset-x-0 data-[side=bottom]:top-16 data-[side=bottom]:bottom-0 data-[side=bottom]:rounded-t-2xl data-[side=bottom]:border-t sm:data-[side=bottom]:top-28",
          "data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:h-full data-[side=left]:w-3/4 data-[side=left]:border-r data-[side=left]:sm:max-w-sm",
          "data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:h-full data-[side=right]:w-3/4 data-[side=right]:border-l data-[side=right]:sm:max-w-sm",
          "data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:h-auto data-[side=top]:border-b",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
          "data-[side=bottom]:data-[state=open]:slide-in-from-bottom-full data-[side=bottom]:data-[state=closed]:slide-out-to-bottom-full",
          "data-[side=left]:data-[state=open]:slide-in-from-left-10 data-[side=left]:data-[state=closed]:slide-out-to-left-10",
          "data-[side=right]:data-[state=open]:slide-in-from-right-10 data-[side=right]:data-[state=closed]:slide-out-to-right-10",
          "data-[side=top]:data-[state=open]:slide-in-from-top-10 data-[side=top]:data-[state=closed]:slide-out-to-top-10",
          side !== "bottom" && className,
        )}
        {...props}
      >
        {side === "bottom" ? (
          <SheetIsCenteredBodyContext.Provider value>
            <div
              className={cn(
                "relative mx-auto flex h-full min-h-0 w-full flex-1 flex-col gap-4",
                SHEET_CONTENT_SIZES[size],
                className,
              )}
            >
              {children}
            </div>
            {closeButton}
          </SheetIsCenteredBodyContext.Provider>
        ) : (
          <>
            {children}
            {closeButton}
          </>
        )}
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  const isCenteredBody = React.useContext(SheetIsCenteredBodyContext);
  const header = (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-0.5 p-4", className)}
      {...props}
    />
  );
  if (!isCenteredBody) return header;
  // "Fura" o container centralizado do corpo — título e botão de fechar
  // ocupam a largura inteira da folha, só o corpo abaixo fica centralizado.
  return <div className="relative left-1/2 w-screen -translate-x-1/2">{header}</div>;
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  const isCenteredBody = React.useContext(SheetIsCenteredBodyContext);
  if (!isCenteredBody) {
    return (
      <div
        data-slot="sheet-footer"
        className={cn("mt-auto flex flex-col gap-2 p-4", className)}
        {...props}
      />
    );
  }
  // "Fura" o container centralizado do corpo, igual ao SheetHeader —
  // mt-auto vai pro wrapper (é ele o item flex de verdade dentro do
  // container centralizado).
  return (
    <div className="relative left-1/2 mt-auto w-screen -translate-x-1/2">
      <div
        data-slot="sheet-footer"
        className={cn("flex flex-col gap-2 p-4", className)}
        {...props}
      />
    </div>
  );
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-base font-medium text-foreground", className)}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
