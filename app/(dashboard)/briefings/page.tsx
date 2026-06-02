import Link from "next/link";
import { IconCalendar, IconStar } from "@tabler/icons-react";
import { PageHeader } from "@/components/squad/page-header";
import { buttonVariants } from "@/components/ui/button";
import { BriefingCard } from "@/components/briefing/briefing-card";
import { listBriefings, avgNpsMonthly } from "@/lib/queries/briefing";

export const metadata = { title: "Briefings — Squad Five" };
export const dynamic = "force-dynamic";

export default async function BriefingsPage() {
  const [briefings, nps] = await Promise.all([
    listBriefings({ limit: 50 }),
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
          <Link
            href="/briefings/novo"
            className={buttonVariants({ variant: "primary", size: "md" })}
          >
            <IconCalendar size={14} aria-hidden />
            Registrar briefing
          </Link>
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
        <section className="surface-raised p-10 flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-surface-accent border border-border-strong flex items-center justify-center">
            <IconCalendar
              size={26}
              stroke={1.5}
              className="text-bronze"
              aria-hidden
            />
          </div>
          <div className="flex flex-col gap-2 max-w-md">
            <h2 className="font-display text-[20px] font-medium leading-tight text-text-primary">
              Nenhum briefing registrado.
            </h2>
            <p className="text-text-secondary text-[13px]">
              Cada reunião com recruta vira um briefing aqui. Registre logo
              depois — enquanto o contexto está fresco.
            </p>
          </div>
          <Link
            href="/briefings/novo"
            className={buttonVariants({ variant: "primary", size: "md" })}
          >
            <IconCalendar size={14} aria-hidden />
            Registrar primeiro briefing
          </Link>
        </section>
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
