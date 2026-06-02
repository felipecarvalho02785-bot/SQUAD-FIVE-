import Link from "next/link";
import { RecruitStatus } from "@prisma/client";
import { IconSearch } from "@tabler/icons-react";
import { Input } from "@/components/form/input";
import { cn } from "@/lib/utils";

/*
  Filtros da lista de Recrutas — usa form GET pra atualizar URL sem JS.
*/

interface RecruitFiltersProps {
  query: string;
  status: RecruitStatus | "all";
}

const STATUS_TABS: Array<{ value: RecruitStatus | "all"; label: string }> = [
  { value: "all", label: "Todos" },
  { value: RecruitStatus.ATIVO, label: "Ativos" },
  { value: RecruitStatus.PAUSADO, label: "Pausados" },
  { value: RecruitStatus.BAIXA, label: "Baixas" },
];

function buildHref(status: RecruitStatus | "all", q: string): string {
  const params = new URLSearchParams();
  if (status !== "all") params.set("status", status);
  if (q.trim()) params.set("q", q);
  const qs = params.toString();
  return `/recrutas${qs ? `?${qs}` : ""}`;
}

export function RecruitFilters({ query, status }: RecruitFiltersProps) {
  return (
    <div className="flex flex-col gap-3">
      <form
        method="GET"
        action="/recrutas"
        className="relative flex items-center gap-2"
      >
        {status !== "all" ? (
          <input type="hidden" name="status" value={status} />
        ) : null}
        <div className="relative flex-1">
          <IconSearch
            size={14}
            stroke={1.5}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim pointer-events-none"
            aria-hidden
          />
          <Input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Buscar por nome, contato, segmento..."
            className="pl-9"
            aria-label="Buscar recruta"
          />
        </div>
      </form>

      <nav
        className="flex items-center gap-1 overflow-x-auto"
        aria-label="Filtro por status"
      >
        {STATUS_TABS.map((tab) => {
          const isActive = tab.value === status;
          return (
            <Link
              key={tab.value}
              href={buildHref(tab.value, query)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "shrink-0 inline-flex items-center px-3 py-1.5 rounded-full",
                "font-display uppercase tracking-[0.06em] text-[11px] font-medium",
                "min-h-9 transition-colors",
                isActive
                  ? "bg-surface-accent text-text-primary border border-border-strong"
                  : "bg-surface-deep text-text-secondary border border-border-default hover:text-text-primary hover:border-border-strong",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
