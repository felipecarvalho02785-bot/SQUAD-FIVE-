"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

/*
  Tabs com indicação de tab ativa via searchParams (?tab=...).
  Server-side friendly: cada tab é um Link que muda a URL.
*/

export interface TabItem {
  value: string;
  label: string;
  /** Contador opcional (badge) */
  count?: number;
  /** Tom do badge */
  badgeTone?: "default" | "critical" | "warn";
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  /** Tab default quando ?tab não está setado */
  defaultValue?: string;
  paramKey?: string;
  className?: string;
}

export function Tabs({
  tabs,
  defaultValue,
  paramKey = "tab",
  className,
}: TabsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get(paramKey) ?? defaultValue ?? tabs[0]?.value;

  function buildHref(value: string): string {
    const next = new URLSearchParams(searchParams.toString());
    if (value === (defaultValue ?? tabs[0]?.value)) {
      next.delete(paramKey);
    } else {
      next.set(paramKey, value);
    }
    const qs = next.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  return (
    <nav
      className={cn(
        "flex items-center gap-1 overflow-x-auto border-b border-border-default",
        className,
      )}
      role="tablist"
      aria-label="Seções"
    >
      {tabs.map((tab) => {
        const isActive = tab.value === current;
        const badgeToneClass =
          tab.badgeTone === "critical"
            ? "bg-status-critical text-text-primary"
            : tab.badgeTone === "warn"
              ? "bg-status-warn text-accent-cta-fg"
              : "bg-border-default text-text-secondary";
        return (
          <Link
            key={tab.value}
            href={buildHref(tab.value)}
            role="tab"
            aria-selected={isActive}
            scroll={false}
            className={cn(
              "shrink-0 inline-flex items-center gap-2 px-4 py-2 relative transition-colors",
              "font-display uppercase tracking-[0.06em] text-[11px] font-medium",
              isActive
                ? "text-text-primary"
                : "text-text-secondary hover:text-text-primary",
              "after:absolute after:bottom-[-1px] after:left-2 after:right-2 after:h-0.5 after:rounded-t-full",
              isActive ? "after:bg-bronze" : "after:bg-transparent",
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {typeof tab.count === "number" && tab.count > 0 ? (
              <span
                className={cn(
                  "min-w-[16px] h-[16px] px-1 rounded-full text-[10px] font-mono flex items-center justify-center leading-none",
                  badgeToneClass,
                )}
              >
                {tab.count > 9 ? "9+" : tab.count}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

/** Helper para resolver a tab atual no server */
export function getActiveTab(
  searchParams: Record<string, string | string[] | undefined>,
  paramKey: string,
  defaultValue: string,
): string {
  const raw = searchParams[paramKey];
  if (Array.isArray(raw)) return raw[0] ?? defaultValue;
  return raw ?? defaultValue;
}
