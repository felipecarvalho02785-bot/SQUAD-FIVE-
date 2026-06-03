import Link from "next/link";
import { IconUserPlus, IconDownload } from "@tabler/icons-react";
import { RecruitStatus } from "@prisma/client";
import { PageHeader } from "@/components/squad/page-header";
import { buttonVariants } from "@/components/ui/button";
import { RecruitListCard } from "@/components/recruta/recruit-list-card";
import { RecruitFilters } from "@/components/recruta/recruit-filters";
import { FilterChips, type FilterChip } from "@/components/squad/filter-chips";
import { EmptyState } from "@/components/squad/empty-state";
import {
  listRecruits,
  countRecruitsByStatus,
  type RecruitSort,
} from "@/lib/queries/recruit";
import { SortDropdown } from "@/components/squad/sort-dropdown";
import { recruitFilterSchema } from "@/lib/schemas/recruit";

export const metadata = {
  title: "Recrutas — Squad Five",
};

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function asString(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function buildChips(filter: {
  q?: string;
  status?: RecruitStatus | "all";
}): FilterChip[] {
  const chips: FilterChip[] = [];
  if (filter.q && filter.q.trim()) {
    chips.push({
      param: "q",
      label: `"${filter.q}"`,
      tone: "default",
    });
  }
  if (filter.status && filter.status !== "all") {
    const labels: Record<RecruitStatus, string> = {
      ATIVO: "Ativos",
      PAUSADO: "Pausados",
      BAIXA: "Baixas",
    };
    chips.push({
      param: "status",
      label: labels[filter.status],
      tone:
        filter.status === RecruitStatus.BAIXA
          ? "critical"
          : filter.status === RecruitStatus.PAUSADO
            ? "warn"
            : "ok",
    });
  }
  return chips;
}

export default async function RecrutasPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const parsed = recruitFilterSchema.safeParse({
    q: asString(params.q),
    status: asString(params.status) || "all",
  });
  const filter = parsed.success
    ? parsed.data
    : { q: undefined, status: "all" as const };

  const sortParam = asString(params.sort) as RecruitSort;
  const validSort: RecruitSort =
    sortParam === "oldest" ||
    sortParam === "name" ||
    sortParam === "name-desc"
      ? sortParam
      : "recent";

  const [recrutas, counts] = await Promise.all([
    listRecruits(filter, validSort),
    countRecruitsByStatus(),
  ]);

  const heading =
    counts.total === 0
      ? "Nenhum recruta no radar."
      : counts.total === 1
        ? "1 recruta no radar."
        : `${counts.total} recrutas no radar.`;
  const subtitle =
    counts.total > 0
      ? `${counts.ATIVO} ativo${counts.ATIVO === 1 ? "" : "s"} · ${counts.PAUSADO} pausado${counts.PAUSADO === 1 ? "" : "s"} · ${counts.BAIXA} baixa${counts.BAIXA === 1 ? "" : "s"}`
      : "Bora alistar o primeiro recruta do squad?";

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={heading}
        subtitle={subtitle}
        actions={
          <div className="flex items-center gap-2">
            <a
              href="/api/export/recruits"
              className={buttonVariants({ variant: "secondary", size: "md" })}
              title="Exportar CSV"
            >
              <IconDownload size={14} aria-hidden />
              CSV
            </a>
            <Link
              href="/recrutas/novo"
              className={buttonVariants({ variant: "primary", size: "md" })}
            >
              <IconUserPlus size={14} aria-hidden />
              Recrutar novo
            </Link>
          </div>
        }
      />

      <div className="flex items-start justify-between gap-3 flex-wrap">
        <RecruitFilters
          query={filter.q ?? ""}
          status={filter.status as RecruitStatus | "all"}
        />
        <SortDropdown
          options={[
            { value: "recent", label: "Mais recentes" },
            { value: "oldest", label: "Mais antigos" },
            { value: "name", label: "Nome A-Z" },
            { value: "name-desc", label: "Nome Z-A" },
          ]}
          current={validSort}
        />
      </div>

      <FilterChips chips={buildChips(filter)} />

      {recrutas.length === 0 ? (
        <EmptyState
          title={
            counts.total === 0
              ? "Nenhum recruta no radar."
              : "Nenhum recruta nesse filtro."
          }
          description={
            counts.total === 0
              ? "Bora alistar o primeiro? Recrutas viram operações, briefings e ordens — toda a jornada começa aqui."
              : "Ajuste a busca ou o filtro de status para encontrar quem você procura."
          }
          mood={counts.total === 0 ? "sleepy" : "calm"}
          cta={
            counts.total === 0
              ? {
                  href: "/recrutas/novo",
                  label: "Recrutar novo",
                  icon: <IconUserPlus size={14} aria-hidden />,
                }
              : undefined
          }
        />
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {recrutas.map((recruit) => (
            <li key={recruit.id}>
              <RecruitListCard recruit={recruit} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
