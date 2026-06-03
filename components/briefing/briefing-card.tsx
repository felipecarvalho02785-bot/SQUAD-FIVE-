import Link from "next/link";
import {
  IconCalendar,
  IconArrowUpRight,
  IconCalendarPlus,
} from "@tabler/icons-react";
import type { BriefingItem } from "@/lib/queries/briefing";
import { cn } from "@/lib/utils";

interface BriefingCardProps {
  briefing: BriefingItem;
  showOperation?: boolean;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(date);
}

function attendeesToString(attendees: unknown): string | null {
  if (!attendees) return null;
  if (typeof attendees === "string") return attendees;
  if (typeof attendees === "object" && attendees !== null && "raw" in attendees) {
    const raw = (attendees as { raw: unknown }).raw;
    if (typeof raw === "string") return raw;
  }
  return null;
}

function npsTone(score: number): string {
  if (score >= 9) return "text-status-ok-text";
  if (score >= 7) return "text-bronze";
  return "text-status-critical-text";
}

export function BriefingCard({ briefing, showOperation = true }: BriefingCardProps) {
  const attendeesStr = attendeesToString(briefing.attendees);

  return (
    <Link
      href={`/operacoes/${briefing.operation.id}`}
      className={cn(
        "surface-raised lift-hover p-4 flex flex-col gap-3 group",
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <IconCalendar
            size={14}
            stroke={1.5}
            className="text-bronze shrink-0"
            aria-hidden
          />
          <div className="flex flex-col min-w-0">
            <span className="text-text-primary text-[12px] truncate">
              {formatDate(briefing.date)}
            </span>
            {showOperation ? (
              <span className="text-text-dim text-[11px] truncate">
                {briefing.operation.codeName} ·{" "}
                {briefing.operation.recruit.name}
              </span>
            ) : null}
          </div>
        </div>
        <IconArrowUpRight
          size={14}
          stroke={1.5}
          className="text-text-dim group-hover:text-accent-hover shrink-0"
          aria-hidden
        />
      </header>

      {briefing.notes ? (
        <p className="text-text-secondary text-[12px] leading-relaxed line-clamp-3">
          {briefing.notes}
        </p>
      ) : null}

      <footer className="flex items-center justify-between gap-3 text-[11px]">
        {attendeesStr ? (
          <span className="text-text-dim truncate flex-1">{attendeesStr}</span>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={`/briefings/${briefing.id}/calendar.ics`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-text-dim hover:text-bronze transition-colors"
            title="Adicionar ao calendário"
            aria-label="Adicionar ao calendário (.ics)"
          >
            <IconCalendarPlus size={12} stroke={1.5} aria-hidden />
          </a>
          {briefing.npsScore !== null ? (
            <span
              className={cn(
                "font-mono tabular-nums font-medium",
                npsTone(briefing.npsScore),
              )}
            >
              NPS {briefing.npsScore}
            </span>
          ) : null}
        </div>
      </footer>
    </Link>
  );
}
