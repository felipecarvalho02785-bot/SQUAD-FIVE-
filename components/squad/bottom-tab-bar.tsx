"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconLayoutDashboard,
  IconUsersGroup,
  IconTarget,
  IconChecklist,
  IconLayoutKanban,
  type Icon,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

/*
  BottomTabBar — navegacao primaria no mobile (<lg).
  Fixed bottom, h-14, bg-surface-deep + border-t + backdrop-blur.

  Acessibilidade:
    - Itens tem >=44px de area tocavel (mobile WCAG 2.2 AAA).
    - aria-current="page" no item ativo.
    - Respeita env(safe-area-inset-bottom) para iOS notched devices.
*/

interface BottomTabItem {
  href: string;
  label: string;
  Icon: Icon;
  badge?: number;
}

const TABS: BottomTabItem[] = [
  { href: "/comando", label: "Comando", Icon: IconLayoutDashboard },
  { href: "/recrutas", label: "Recrutas", Icon: IconUsersGroup },
  { href: "/operacoes", label: "Operações", Icon: IconTarget },
  { href: "/ordens", label: "Ordens", Icon: IconChecklist },
  { href: "/pelotao", label: "Pelotão", Icon: IconLayoutKanban },
];

interface BottomTabBarProps {
  /** Contadores opcionais por rota (mesmas chaves do navCounts do Topbar) */
  badges?: Partial<Record<string, number>>;
}

export function BottomTabBar({ badges = {} }: BottomTabBarProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "lg:hidden fixed inset-x-0 bottom-0 h-14",
        "z-sticky",
        "bg-surface-deep/95 border-t border-border-default backdrop-blur-md",
        "flex items-stretch",
      )}
      style={{
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
      aria-label="Navegação principal"
    >
      {TABS.map((tab) => {
        const isActive =
          pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        const badge = badges[tab.href];
        const { Icon: TabIcon } = tab;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            aria-label={tab.label}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-0.5 relative",
              "transition-colors min-h-[44px]",
              isActive
                ? "text-accent"
                : "text-text-secondary hover:text-text-primary",
            )}
          >
            <span className="relative">
              <TabIcon size={20} stroke={1.5} aria-hidden />
              {typeof badge === "number" && badge > 0 ? (
                <span
                  className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] px-1 rounded-full bg-status-critical text-text-primary text-[9px] font-mono font-medium flex items-center justify-center leading-none"
                  aria-hidden
                >
                  {badge > 9 ? "9+" : badge}
                </span>
              ) : null}
            </span>
            <span className="font-display uppercase tracking-[0.08em] text-[9px] font-medium leading-none">
              {tab.label}
            </span>
            {isActive ? (
              <span
                className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-b-full bg-accent"
                aria-hidden
              />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
