import Link from "next/link";
import {
  IconCalendar,
  IconStar,
  IconLayoutList,
  IconCalendarMonth,
} from "@tabler/icons-react";
import { PageHeader } from "@/components/squad/page-header";
import { buttonVariants } from "@/components/ui/button";
import { BriefingCard } from "@/components/briefing/briefing-card";
import { BriefingsCalendar } from "@/components/briefing/briefings-calendar";
import { EmptyState } from "@/components/squad/empty-state";
import { listBriefings, avgNpsMonthly } from "@/lib/queries/briefing";
import { cn } from "@/lib/utils";

export const metadata = { title: "Briefings — Squad Five" };
export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function asString(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function BriefingsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const view = asString(sp.view) === "calendar" ? "calendar" : "list";

  const [briefings, nps] = await Promise.all([
    listBriefings({ limit: 100 }),
    avgNpsMonthly(),
  ]);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Briefings"
        subtitle={
          briefings.length === 0
            ? "Nenhum briefing registrado ainda."
            : `${briefings.length} briefing${briefings.length === 1 ? "" : "s"} registrado${briefings.length === 1 ? "" : "s"}.`
        }
        actions={
          <div className="flex items-center gap-2">
            <nav
              className="flex items-center gap-1 bg-surface-deep border border-border-default rounded-full p-1"
              aria-label="Modo de visualização"
            >
              <Link
                href="?view=list"
                aria-current={view === "list" ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors",
                  "font-display uppercase tracking-[0.06em] text-[11px] font-medium",
                  view === "list"
                    ? "bg-surface-accent text-text-primary"
                    : "text-text-secondary hover:text-text-primary",
                )}
              >
                <IconLayoutList size={12} stroke={1.5} aria-hidden />
                Lista
              </Link>
              <Link
                href="?view=calendar"
                aria-current={view === "calendar" ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors",
                  "font-display uppercase tracking-[0.06em] text-[11px] font-medium",
                  view === "calendar"
                    ? "bg-surface-accent text-text-primary"
                    : "text-text-secondary hover:text-text-primary",
                )}
              >
                <IconCalendarMonth size={12} stroke={1.5} aria-hidden />
                Calendário
              </Link>
            </nav>
            <Link
              href="/briefings/novo"
              className={buttonVariants({ variant: "primary", size: "md" })}
            >
              <IconCalendar size={14} aria-hidden />
              Registrar
            </Link>
          </div>
        }
      />

      {nps.count > 0 ? (
        <section className="surface-jungle px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className="w-9 h-9 rounded-full bg-surface-base/40 border border-border-strong flex items-center justify-center text-bronze"
              aria-hidden
            >
              <IconStar size={16} stroke={1.5} />
            </span>
            <div className="flex flex-col">
              <span className="label-display text-[10px] text-text-primary">
                NPS médio · mês corrente
              </span>
              <span className="font-display text-[22px] text-bronze leading-none mt-1 animate-glow-bronze">
                {nps.avg !== null ? nps.avg.toFixed(1) : "—"}
              </span>
            </div>
          </div>
          <span className="font-mono text-[11px] text-text-secondary tabular-nums">
            {nps.count} briefing{nps.count === 1 ? "" : "s"} com NPS
          </span>
        </section>
      ) : null}

      {briefings.length === 0 ? (
        <EmptyState
          title="Nenhum briefing registrado."
          description="Cada reunião com recruta vira um briefing aqui. Registre logo depois — enquanto o contexto está fresco."
          mood="sleepy"
          cta={{
            href: "/briefings/novo",
            label: "Registrar primeiro briefing",
            icon: <IconCalendar size={14} aria-hidden />,
          }}
        />
      ) : view === "calendar" ? (
        <BriefingsCalendar briefings={briefings} />
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {briefings.map((b) => (
            <li key={b.id}>
              <BriefingCard briefing={b} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
