import Link from "next/link";
import { IconShield, IconBell } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

/*
  Topbar — barra superior fixa do dashboard.
  Specs em docs/03_SISTEMA_DESIGN.md secao 5.9.
*/

interface TopbarProps {
  /** Lista de paginas para o breadcrumb. A ultima e a atual. */
  breadcrumb?: { label: string; href?: string }[];
  /** Nome do usuario logado (placeholder ate Auth.js entrar). */
  userName?: string;
  /** Numero de notificacoes nao lidas. */
  unreadCount?: number;
}

function Breadcrumb({
  items,
}: {
  items: NonNullable<TopbarProps["breadcrumb"]>;
}) {
  return (
    <nav
      aria-label="Localizacao"
      className="flex items-center gap-2 text-[12px]"
    >
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={`${item.label}-${i}`} className="flex items-center gap-2">
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-cream-muted hover:text-cream transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={isLast ? "text-cream" : "text-cream-muted"}
                aria-current={isLast ? "page" : undefined}
              >
                {item.label}
              </span>
            )}
            {!isLast && <span className="text-cream-dim">/</span>}
          </span>
        );
      })}
    </nav>
  );
}

function Avatar({ name }: { name: string }) {
  const initials =
    name
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  return (
    <div
      className="w-8 h-8 rounded-full bg-copper text-combat font-sans text-[11px] font-medium tracking-[0.05em] flex items-center justify-center"
      aria-label={`Avatar de ${name}`}
    >
      {initials}
    </div>
  );
}

export function Topbar({
  breadcrumb = [],
  userName = "Comandante",
  unreadCount = 0,
}: TopbarProps) {
  return (
    <header
      className={cn(
        "h-[52px] bg-combat border-b border-tactical px-5",
        "flex items-center justify-between gap-4",
        "sticky top-0 z-50",
      )}
    >
      <div className="flex items-center gap-4">
        <Link
          href="/comando"
          className="flex items-center gap-2 text-cream hover:text-bronze transition-colors"
          aria-label="Ir para o Comando Central"
        >
          <IconShield size={20} stroke={1.5} />
          <span className="font-display font-medium text-[18px] tracking-[0.02em]">
            SQUAD 5
          </span>
        </Link>

        {breadcrumb.length > 0 && (
          <>
            <span className="text-cream-dim text-[12px]">/</span>
            <Breadcrumb items={breadcrumb} />
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={`Notificacoes${unreadCount > 0 ? ` (${unreadCount} nao lidas)` : ""}`}
          className="relative w-8 h-8 flex items-center justify-center text-cream-muted hover:text-cream transition-colors"
        >
          <IconBell size={18} stroke={1.5} />
          {unreadCount > 0 && (
            <span
              className="absolute top-1 right-1 min-w-[14px] h-[14px] px-1 rounded-full bg-casualty text-[9px] font-medium text-cream flex items-center justify-center"
              aria-hidden
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        <Avatar name={userName} />
      </div>
    </header>
  );
}
