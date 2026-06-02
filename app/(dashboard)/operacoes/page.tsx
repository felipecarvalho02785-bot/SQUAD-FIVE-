import Link from "next/link";
import { OperationStatus } from "@prisma/client";
import { IconTargetArrow } from "@tabler/icons-react";
import { PageHeader } from "@/components/squad/page-header";
import { HealthBar } from "@/components/squad/health-bar";
import { buttonVariants } from "@/components/ui/button";
import { OperationListCard } from "@/components/operacao/operation-list-card";
import { listOperations, countOperationHealth } from "@/lib/queries/operation";
import { operationFilterSchema } from "@/lib/schemas/operation";
import { cn } from "@/lib/utils";

export const metadata = { title: "Operações — Squad Five" };
export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function asString(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

const STATUS_TABS: Array<{
  value: OperationStatus | "all";
  label: string;
}> = [
  { value: "all", label: "Todas" },
  { value: OperationStatus.ATIVA, label: "Ativas" },
  { value: OperationStatus.PAUSADA, label: "Pausadas" },
  { value: OperationStatus.ENCERRADA, label: "Encerradas" },
];

const HEALTH_TABS: Array<{ value: string; label: string }> = [
  { value: "all", label: "Toda saúde" },
  { value: "baixa_iminente", label: "Baixas iminentes" },
  { value: "atencao", label: "Em atenção" },
  { value: "em_campo", label: "Em campo" },
];

function buildHref(
  status: string,
  health: string,
  base: { status: string; health: string },
): string {
  const params = new URLSearchParams();
  if (status !== "all") params.set("status", status);
  if (health !== "all") params.set("health", health);
  const qs = params.toString();
  void base;
  return `/operacoes${qs ? `?${qs}` : ""}`;
}

export default async function OperacoesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const parsed = operationFilterSchema.safeParse({
    status: asString(sp.status) || "all",
    health: asString(sp.health) || "all",
    productId: asString(sp.productId) || undefined,
  });
  const filter = parsed.success
    ? parsed.data
    : { status: "all" as const, health: "all" as const };

  const [operacoes, counts] = await Promise.all([
    listOperations(filter),
    countOperationHealth(),
  ]);

  const subtitle =
    counts.total === 0
      ? "Bora mobilizar a primeira operação?"
      : `${counts.em_campo} em campo · ${counts.atencao} em atenção · ${counts.baixa_iminente} em baixa iminente`;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Operações"
        subtitle={subtitle}
        actions={
          <Link
            href="/operacoes/nova"
            className={buttonVariants({ variant: "primary", size: "md" })}
          >
            <IconTargetArrow size={14} aria-hidden />
            Mobilizar operação
          </Link>
        }
      />

      {counts.total > 0 ? (
        <HealthBar
          total={counts.total}
          emCampo={counts.em_campo}
          atencao={counts.atencao}
          baixaIminente={counts.baixa_iminente}
          extracao={counts.extracao}
          label="Operações ativas"
        />
      ) : null}

      <div className="flex flex-col gap-3">
        <nav
          className="flex items-center gap-1 overflow-x-auto"
          aria-label="Filtro por status"
        >
          {STATUS_TABS.map((tab) => {
            const isActive = tab.value === filter.status;
            return (
              <Link
                key={tab.value}
                href={buildHref(tab.value, filter.health ?? "all", {
                  status: filter.status ?? "all",
                  health: filter.health ?? "all",
                })}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "shrink-0 inline-flex items-center px-3 py-1.5 rounded-full",
                  "font-display uppercase tracking-[0.06em] text-[11px] font-medium min-h-9 transition-colors",
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

        <nav
          className="flex items-center gap-1 overflow-x-auto"
          aria-label="Filtro por saúde"
        >
          {HEALTH_TABS.map((tab) => {
            const isActive = tab.value === filter.health;
            return (
              <Link
                key={tab.value}
                href={buildHref(filter.status ?? "all", tab.value, {
                  status: filter.status ?? "all",
                  health: filter.health ?? "all",
                })}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "shrink-0 inline-flex items-center px-3 py-1 rounded-full",
                  "text-[11px] min-h-9 transition-colors",
                  isActive
                    ? "bg-surface-accent text-text-primary"
                    : "text-text-secondary hover:text-text-primary",
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {operacoes.length === 0 ? (
        <section className="surface-raised p-10 flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-surface-accent border border-border-strong flex items-center justify-center">
            <IconTargetArrow
              size={26}
              stroke={1.5}
              className="text-bronze"
              aria-hidden
            />
          </div>
          <div className="flex flex-col gap-2 max-w-md">
            <h2 className="font-display text-[20px] font-medium leading-tight text-text-primary">
              {counts.total === 0
                ? "Nenhuma operação mobilizada."
                : "Nenhuma operação nesse filtro."}
            </h2>
            <p className="text-text-secondary text-[13px]">
              {counts.total === 0
                ? "Toda operação começa com um recruta + um produto. Recrute primeiro, depois mobilize."
                : "Ajuste os filtros para encontrar o que você procura."}
            </p>
          </div>
          <Link
            href="/operacoes/nova"
            className={buttonVariants({ variant: "primary", size: "md" })}
          >
            <IconTargetArrow size={14} aria-hidden />
            Mobilizar operação
          </Link>
        </section>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {operacoes.map((op) => (
            <li key={op.id}>
              <OperationListCard operation={op} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
