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
  Reescrita na Sprint 1.5 para alinhar com o nivel visual do CRM antigo
  da E3 (vide referencia mostrada pelo usuario).

  Layout:
    [Mascote + SQUAD 5]  [Tabs nav]  [Search ⌘K] [Settings] [Bell] [Avatar] [Sair]
*/

interface TopbarProps {
  userName?: string | null;
  userEmail?: string | null;
  unreadCount?: number;
  /** Contadores para badges das tabs (futuramente vem dos dados reais) */
  navCounts?: {
    comando?: number;
    recrutas?: number;
    pelotao?: number;
    ordens?: number;
    briefings?: number;
  };
  /** Se o usuario logado e admin, mostra o link pro Quartel General */
  isAdmin?: boolean;
}

async function logoutAction() {
  "use server";
  await signOut({ redirectTo: "/login" });
}

function getInitials(name: string | null | undefined, email: string | null | undefined): string {
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
        ? { count: navCounts.comando, tone: "casualty" }
        : undefined,
    },
    {
      href: "/recrutas",
      label: "Recrutas",
      badge: navCounts.recrutas ? { count: navCounts.recrutas, tone: "copper" } : undefined,
    },
    {
      href: "/pelotao",
      label: "Pelotão",
      badge: navCounts.pelotao ? { count: navCounts.pelotao, tone: "tactical" } : undefined,
    },
    {
      href: "/ordens",
      label: "Ordens",
      badge: navCounts.ordens ? { count: navCounts.ordens, tone: "copper" } : undefined,
    },
    {
      href: "/briefings",
      label: "Briefings",
      badge: navCounts.briefings
        ? { count: navCounts.briefings, tone: "tactical" }
        : undefined,
    },
    ...(isAdmin
      ? ([{ href: "/quartel", label: "Quartel" }] satisfies NavItem[])
      : []),
  ];

  const initials = getInitials(userName, userEmail);

  return (
    <header
      className={cn(
        "h-[56px] px-4 sm:px-5 sticky top-0 z-50",
        "bg-combat/85 backdrop-blur-md border-b border-tactical",
        "flex items-center justify-between gap-3",
      )}
    >
      <Link
        href="/comando"
        className="flex items-center gap-2.5 shrink-0 group"
        aria-label="Comando Central"
      >
        <Mascot size={32} useAsset={false} />
        <div className="hidden sm:flex flex-col leading-none">
          <span className="font-display uppercase tracking-[0.1em] text-[14px] font-medium text-cream group-hover:text-bronze transition-colors">
            SQUAD <span className="text-copper">5</span>
          </span>
          <span className="text-[9px] tracking-[0.2em] uppercase text-cream-dim mt-0.5">
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
          aria-label="Buscar (⌘ K)"
          className="hidden md:flex items-center gap-2 h-9 px-3 rounded-full bg-card-deep border border-tactical text-cream-dim hover:text-cream hover:border-patrol transition-all"
        >
          <IconSearch size={14} stroke={1.5} />
          <span className="text-[11px]">Buscar</span>
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-combat border border-tactical text-[10px] font-mono text-cream-dim">
            <IconCommand size={9} stroke={1.5} />K
          </span>
        </button>

        <Link
          href="/quartel"
          aria-label="Configurações"
          className={cn(
            "w-9 h-9 rounded-full flex items-center justify-center text-cream-dim hover:text-cream hover:bg-card-deep transition-colors",
            !isAdmin && "hidden",
          )}
        >
          <IconSettings size={16} stroke={1.5} />
        </Link>

        <button
          type="button"
          aria-label={`Notificações${unreadCount > 0 ? ` (${unreadCount} não lidas)` : ""}`}
          className="relative w-9 h-9 rounded-full flex items-center justify-center text-cream-dim hover:text-cream hover:bg-card-deep transition-colors"
        >
          <IconBell size={16} stroke={1.5} />
          {unreadCount > 0 ? (
            <span
              className="absolute top-1.5 right-1.5 min-w-[14px] h-[14px] px-1 rounded-full bg-casualty text-[9px] font-medium text-cream flex items-center justify-center leading-none"
              aria-hidden
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </button>

        <div
          className="w-8 h-8 rounded-full bg-gradient-to-br from-copper to-jungle text-combat font-display font-medium text-[12px] tracking-[0.05em] flex items-center justify-center ring-2 ring-tactical"
          aria-label={`Logado como ${userName ?? userEmail ?? "Comandante"}`}
          title={userName ?? userEmail ?? "Comandante"}
        >
          {initials}
        </div>

        <form action={logoutAction}>
          <button
            type="submit"
            aria-label="Sair"
            className="hidden sm:flex items-center gap-1.5 h-9 px-3 rounded-full text-cream-dim hover:text-casualty hover:bg-card-deep transition-colors"
          >
            <IconLogout size={14} stroke={1.5} />
            <span className="text-[11px]">Sair</span>
          </button>
        </form>
      </div>
    </header>
  );
}
