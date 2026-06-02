import Link from "next/link";
import {
  IconBell,
  IconSearch,
  IconSettings,
  IconLogout,
  IconCommand,
} from "@tabler/icons-react";
import { signOut } from "@/lib/auth";
import { Mascot } from "./mascot";
import { TopbarNav, type NavItem } from "./topbar-nav";
import { cn } from "@/lib/utils";

/*
  Topbar v2 — barra superior fixa do dashboard.
  Tokens semanticos (surface/text/accent) e z-index via escala.

  Acessibilidade:
    - Botoes-icone tem area tocavel >=44px no mobile via min-h-11/min-w-11.
    - aria-label em todos os botoes-icone.
    - Reduz no mobile (<lg): so wordmark + sino + avatar (nav vai pra
      BottomTabBar).
*/

interface TopbarProps {
  userName?: string | null;
  userEmail?: string | null;
  unreadCount?: number;
  navCounts?: {
    comando?: number;
    recrutas?: number;
    pelotao?: number;
    ordens?: number;
    briefings?: number;
  };
  isAdmin?: boolean;
}

async function logoutAction() {
  "use server";
  await signOut({ redirectTo: "/login" });
}

function getInitials(
  name: string | null | undefined,
  email: string | null | undefined,
): string {
  if (name && name.trim()) {
    return name
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }
  if (email) {
    return email[0]?.toUpperCase() ?? "?";
  }
  return "?";
}

export function Topbar({
  userName,
  userEmail,
  unreadCount = 0,
  navCounts = {},
  isAdmin = false,
}: TopbarProps) {
  const items: NavItem[] = [
    {
      href: "/comando",
      label: "Comando",
      badge: navCounts.comando
        ? { count: navCounts.comando, tone: "critical" }
        : undefined,
    },
    {
      href: "/recrutas",
      label: "Recrutas",
      badge: navCounts.recrutas
        ? { count: navCounts.recrutas, tone: "accent" }
        : undefined,
    },
    {
      href: "/pelotao",
      label: "Pelotão",
      badge: navCounts.pelotao
        ? { count: navCounts.pelotao, tone: "default" }
        : undefined,
    },
    {
      href: "/ordens",
      label: "Ordens",
      badge: navCounts.ordens
        ? { count: navCounts.ordens, tone: "accent" }
        : undefined,
    },
    {
      href: "/briefings",
      label: "Briefings",
      badge: navCounts.briefings
        ? { count: navCounts.briefings, tone: "default" }
        : undefined,
    },
    {
      href: "/squad-tasks",
      label: "Squad",
    },
    ...(isAdmin
      ? ([{ href: "/quartel", label: "Quartel" }] satisfies NavItem[])
      : []),
  ];

  const initials = getInitials(userName, userEmail);

  return (
    <header
      className={cn(
        "h-[56px] px-4 sm:px-5 sticky top-0 z-sticky",
        "bg-surface-base/85 backdrop-blur-md border-b border-border-default",
        "flex items-center justify-between gap-3",
      )}
    >
      <Link
        href="/comando"
        className="flex items-center gap-2.5 shrink-0 group min-h-11"
        aria-label="Comando Central"
      >
        <Mascot size={32} useAsset={true} />
        <div className="hidden sm:flex flex-col leading-none">
          <span className="font-display uppercase tracking-[0.1em] text-[14px] font-medium text-text-primary group-hover:text-accent-hover transition-colors">
            SQUAD <span className="text-accent">5</span>
          </span>
          <span className="text-[9px] tracking-[0.2em] uppercase text-text-dim mt-0.5">
            E3 · Sistema Operacional
          </span>
        </div>
      </Link>

      <div className="hidden lg:flex flex-1 justify-center">
        <TopbarNav items={items} />
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          aria-label="Buscar (Ctrl + K)"
          className="hidden md:flex items-center gap-2 h-9 px-3 rounded-full bg-surface-deep border border-border-default text-text-dim hover:text-text-primary hover:border-border-strong transition-all"
        >
          <IconSearch size={14} stroke={1.5} aria-hidden />
          <span className="text-[11px]">Buscar</span>
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-surface-base border border-border-default text-[10px] font-mono text-text-dim">
            <IconCommand size={9} stroke={1.5} aria-hidden />K
          </span>
        </button>

        <Link
          href="/quartel"
          aria-label="Configurações"
          className={cn(
            "min-w-11 min-h-11 lg:min-w-9 lg:min-h-9 w-9 h-9 rounded-full flex items-center justify-center text-text-dim hover:text-text-primary hover:bg-surface-deep transition-colors",
            !isAdmin && "hidden",
          )}
        >
          <IconSettings size={16} stroke={1.5} aria-hidden />
        </Link>

        <button
          type="button"
          aria-label={`Notificações${unreadCount > 0 ? ` (${unreadCount} não lidas)` : ""}`}
          className="relative min-w-11 min-h-11 lg:min-w-9 lg:min-h-9 w-9 h-9 rounded-full flex items-center justify-center text-text-dim hover:text-text-primary hover:bg-surface-deep transition-colors"
        >
          <IconBell size={16} stroke={1.5} aria-hidden />
          {unreadCount > 0 ? (
            <span
              className="absolute top-1.5 right-1.5 min-w-[14px] h-[14px] px-1 rounded-full bg-status-critical text-[9px] font-medium text-text-primary flex items-center justify-center leading-none"
              aria-hidden
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </button>

        <div
          className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-status-ok text-accent-cta-fg font-display font-medium text-[12px] tracking-[0.05em] flex items-center justify-center ring-2 ring-border-default"
          aria-label={`Logado como ${userName ?? userEmail ?? "Comandante"}`}
          title={userName ?? userEmail ?? "Comandante"}
        >
          {initials}
        </div>

        <form action={logoutAction}>
          <button
            type="submit"
            aria-label="Sair"
            className="hidden sm:flex items-center gap-1.5 h-9 px-3 rounded-full text-text-dim hover:text-status-critical-text hover:bg-surface-deep transition-colors"
          >
            <IconLogout size={14} stroke={1.5} aria-hidden />
            <span className="text-[11px]">Sair</span>
          </button>
        </form>
      </div>
    </header>
  );
}
