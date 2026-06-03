"use client";

import { useState } from "react";
import Link from "next/link";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import type { BriefingItem } from "@/lib/queries/briefing";
import { cn } from "@/lib/utils";

interface BriefingsCalendarProps {
  briefings: BriefingItem[];
}

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function npsTone(score: number | null): string {
  if (score === null) return "bg-border-default";
  if (score >= 9) return "bg-status-ok";
  if (score >= 7) return "bg-bronze";
  return "bg-status-critical";
}

export function BriefingsCalendar({ briefings }: BriefingsCalendarProps) {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  // Agrupa briefings por data
  const byDate = briefings.reduce<Map<string, BriefingItem[]>>((map, b) => {
    const key = dateKey(b.date);
    const arr = map.get(key) ?? [];
    arr.push(b);
    map.set(key, arr);
    return map;
  }, new Map());

  // Gera matriz de semanas do mês
  const firstDay = new Date(viewYear, viewMonth, 1);
  const lastDay = new Date(viewYear, viewMonth + 1, 0);
  const startOffset = firstDay.getDay();
  const totalDays = lastDay.getDate();
  const cells: Array<{ date: Date | null; key: string }> = [];

  for (let i = 0; i < startOffset; i++) {
    cells.push({ date: null, key: `empty-start-${i}` });
  }
  for (let d = 1; d <= totalDays; d++) {
    const date = new Date(viewYear, viewMonth, d);
    cells.push({ date, key: dateKey(date) });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ date: null, key: `empty-end-${cells.length}` });
  }

  function prev() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }
  function next() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }
  function today() {
    setViewMonth(now.getMonth());
    setViewYear(now.getFullYear());
  }

  const todayKey = dateKey(now);

  return (
    <section className="surface-raised flex flex-col gap-3 p-5">
      <header className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="font-display text-[18px] font-medium text-text-primary">
          {MONTHS[viewMonth]} {viewYear}
        </h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={prev}
            aria-label="Mês anterior"
            className="w-9 h-9 rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-deep transition-colors"
          >
            <IconChevronLeft size={16} stroke={1.5} />
          </button>
          <button
            type="button"
            onClick={today}
            className="px-3 h-9 rounded-full text-[11px] font-display uppercase tracking-[0.06em] text-text-secondary hover:text-text-primary hover:bg-surface-deep transition-colors"
          >
            Hoje
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Próximo mês"
            className="w-9 h-9 rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-deep transition-colors"
          >
            <IconChevronRight size={16} stroke={1.5} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-7 gap-px bg-border-default/30 rounded-card overflow-hidden border border-border-default">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="bg-surface-deep py-2 text-center font-display uppercase tracking-[0.08em] text-[9px] text-text-label"
          >
            {day}
          </div>
        ))}
        {cells.map((cell) => {
          const events = cell.date ? (byDate.get(cell.key) ?? []) : [];
          const isToday = cell.key === todayKey;
          const isPast =
            cell.date && cell.date.getTime() < now.getTime() && !isToday;
          return (
            <div
              key={cell.key}
              className={cn(
                "bg-surface-raised min-h-[80px] sm:min-h-[100px] p-1.5 flex flex-col gap-1",
                !cell.date && "bg-surface-deep/50",
                isPast && "opacity-70",
              )}
            >
              {cell.date ? (
                <>
                  <span
                    className={cn(
                      "font-mono text-[10px] self-end",
                      isToday
                        ? "text-bronze font-bold"
                        : "text-text-dim",
                    )}
                  >
                    {cell.date.getDate()}
                  </span>
                  <div className="flex flex-col gap-1 flex-1">
                    {events.slice(0, 3).map((b) => (
                      <Link
                        key={b.id}
                        href={`/operacoes/${b.operation.id}`}
                        className={cn(
                          "block px-1.5 py-0.5 rounded text-[10px] text-text-primary truncate transition-opacity hover:opacity-90",
                          npsTone(b.npsScore),
                        )}
                        title={`${b.operation.codeName} · ${b.operation.recruit.name}${b.npsScore !== null ? ` · NPS ${b.npsScore}` : ""}`}
                      >
                        {b.operation.recruit.name}
                      </Link>
                    ))}
                    {events.length > 3 ? (
                      <span className="text-[9px] text-text-dim font-mono px-1.5">
                        +{events.length - 3} mais
                      </span>
                    ) : null}
                  </div>
                </>
              ) : null}
            </div>
          );
        })}
      </div>

      <footer className="flex items-center gap-4 text-[10px] text-text-dim flex-wrap">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded bg-status-ok" /> NPS ≥ 9
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded bg-bronze" /> NPS ≥ 7
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded bg-status-critical" /> NPS &lt; 7
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded bg-border-default" /> Sem NPS
        </span>
      </footer>
    </section>
  );
}
