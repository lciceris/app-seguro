import {
  Building2,
  FileText,
  Home,
  Landmark,
  ShieldCheck,
  Truck,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";

import type { Database } from "@/shared/lib/supabase";

type Role = Database["public"]["Enums"]["user_role"];

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  // undefined = todo perfil autenticado (só "/", hoje)
  allowedRoles?: Role[];
}

export interface NavGroup {
  label: string | null;
  items: NavItem[];
}

// Fonte única dos itens de menu — app-router.tsx lê allowedRoles daqui em vez
// de repetir os arrays inline em cada <ProtectedRoute> (ver
// .agents/specs/app-shell/design.md).
export const NAV_GROUPS: NavGroup[] = [
  {
    label: null,
    items: [{ to: "/", label: "Início", icon: Home }],
  },
  {
    label: "Operação",
    items: [
      {
        to: "/quotations",
        label: "Cotações",
        icon: FileText,
        allowedRoles: [
          "platform_admin",
          "brokerage_admin",
          "supervisor",
          "analyst",
          "seller",
          "viewer",
        ],
      },
      {
        to: "/policies",
        label: "Apólices",
        icon: ShieldCheck,
        allowedRoles: [
          "platform_admin",
          "brokerage_admin",
          "supervisor",
          "analyst",
          "seller",
          "viewer",
        ],
      },
      {
        to: "/clients",
        label: "Clientes",
        icon: Users,
        allowedRoles: ["platform_admin", "brokerage_admin", "supervisor", "seller", "viewer"],
      },
      {
        to: "/vehicles",
        label: "Veículos",
        icon: Truck,
        allowedRoles: ["platform_admin", "brokerage_admin", "supervisor", "seller"],
      },
    ],
  },
  {
    label: "Minha corretora",
    items: [
      {
        to: "/users",
        label: "Usuários",
        icon: UserCog,
        allowedRoles: ["platform_admin", "brokerage_admin", "supervisor"],
      },
      {
        to: "/my-brokerage",
        label: "Dados da corretora",
        icon: Building2,
        allowedRoles: ["platform_admin", "brokerage_admin"],
      },
      {
        to: "/my-insurers",
        label: "Seguradoras contratadas",
        icon: Landmark,
        allowedRoles: ["platform_admin", "brokerage_admin"],
      },
    ],
  },
  {
    label: "Plataforma",
    items: [
      {
        to: "/brokerages",
        label: "Corretoras",
        icon: Building2,
        allowedRoles: ["platform_admin"],
      },
      {
        to: "/admin/insurers",
        label: "Seguradoras (catálogo)",
        icon: Landmark,
        allowedRoles: ["platform_admin"],
      },
    ],
  },
];

export function allowedRolesFor(to: string): Role[] | undefined {
  return NAV_GROUPS.flatMap((group) => group.items).find((item) => item.to === to)?.allowedRoles;
}
