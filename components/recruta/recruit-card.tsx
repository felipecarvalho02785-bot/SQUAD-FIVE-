import {
  IconGripVertical,
  IconAlertHexagonFilled,
} from "@tabler/icons-react";
import { StatusIndicator, type IndicatorStatus } from "@/components/ui/status-indicator";
import { cn } from "@/lib/utils";

/*
  RecruitCard — card de recruta usado no Painel de Pelotao (kanban) e
  na lista do Comando Central.

  Antecipa a Sprint 3 (CRUD de recrutas) ja entregando o componente certo.
*/

interface RecruitCardProps {
  /** Nome do recruta */
  name: string;
  /** Iniciais para o avatar (calculado fora pra evitar duplicacao) */
  initials: string;
  /** "Semana 6 · Campanha ativa" — subtitulo livre */
  subtitle?: string;
  /** Saude calculada da operacao */
  health: IndicatorStatus;
  /** Numero de prioridade (1-9) ou null */
  priority?: number;
  /** Progresso 0-100 da operacao */
  progress: number;
  /** Texto pequeno abaixo da barra. Ex: "8/9 entregaveis" */
  progressLabel?: string;
  /** Percentual textual a direita da barra (Ex: "89%") */
  progressPercentDisplay?: string;
  /** Tags de gap/critico/etc. Ex: ["2 gaps", "1 crit."] */
  tags?: string[];
  /** Para o futuro drag & drop do kanban */
  draggable?: boolean;
  /** Cor do avatar (gradient). Default: copper -> jungle */
  avatarGradient?: "copper" | "patrol" | "casualty" | "bronze";
  className?: string;
}

const AVATAR_GRADIENTS: Record<NonNullable<RecruitCardProps["avatarGradient"]>, string> = {
  copper: "from-copper to-copper-deep",
  patrol: "from-patrol to-jungle-deep",
  casualty: "from-casualty to-casualty-deep",
  bronze: "from-bronze to-copper",
};

export function RecruitCard({
  name,
  initials,
  subtitle,
  health,
  priority,
  progress,
  progressLabel,
  progressPercentDisplay,
  tags,
  draggable = false,
  avatarGradient = "copper",
  className,
}: RecruitCardProps) {
  const safeProgress = Math.max(0, Math.min(100, progress));
  const isCritical = health === "baixa_iminente";
  const isExtraction = health === "extracao";

  return (
    <article
      className={cn(
        "relative surface-raised lift-hover p-3.5 flex flex-col gap-2.5",
        // Borda lateral colorida segundo a saude
        "before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[3px] before:rounded-r-full",
        health === "em_campo" && "before:bg-patrol",
        health === "atencao" && "before:bg-bronze",
        isCritical && "before:bg-casualty",
        isExtraction && "before:bg-tactical",
        className,
      )}
    >
      <header className="flex items-start gap-3">
        {draggable ? (
          <button
            type="button"
            aria-label="Reordenar"
            className="mt-1 text-cream-dim hover:text-cream-muted cursor-grab active:cursor-grabbing"
            tabIndex={-1}
          >
            <IconGripVertical size={14} stroke={1.5} />
          </button>
        ) : null}

        <div
          className={cn(
            "shrink-0 w-9 h-9 rounded-md bg-gradient-to-br flex items-center justify-center text-combat font-display font-medium text-[14px] tracking-[0.05em] ring-1 ring-tactical/60",
            AVATAR_GRADIENTS[avatarGradient],
          )}
          aria-hidden
        >
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-cream text-[13px] font-medium truncate">
              {name}
            </h3>
            {priority !== undefined ? (
              <span
                className={cn(
                  "shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-medium",
                  isCritical
                    ? "bg-casualty text-cream"
                    : health === "atencao"
                      ? "bg-bronze text-combat"
                      : "bg-jungle text-cream",
                )}
                aria-label={`Prioridade ${priority}`}
              >
                {priority}
              </span>
            ) : (
              <StatusIndicator status={health} size="mini" />
            )}
          </div>
          {subtitle ? (
            <p className="text-cream-dim text-[11px] mt-0.5 truncate">
              {subtitle}
            </p>
          ) : null}
        </div>
      </header>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 rounded-full bg-combat/60 ring-1 ring-tactical/60 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full",
              isCritical ? "bg-casualty" : "bar-gradient-warm",
            )}
            style={{ width: `${safeProgress}%` }}
          />
        </div>
        {progressPercentDisplay ? (
          <span className="font-mono font-medium text-cream text-[12px] tabular-nums shrink-0 min-w-[36px] text-right">
            {progressPercentDisplay}
          </span>
        ) : null}
      </div>

      <footer className="flex items-center justify-between gap-2">
        {progressLabel ? (
          <span className="text-cream-dim text-[11px]">{progressLabel}</span>
        ) : (
          <span />
        )}

        {tags && tags.length > 0 ? (
          <ul className="flex items-center gap-1.5">
            {tags.map((tag) => (
              <li
                key={tag}
                className={cn(
                  "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium",
                  "bg-casualty/15 text-casualty border border-casualty/30",
                )}
              >
                <IconAlertHexagonFilled size={9} />
                {tag}
              </li>
            ))}
          </ul>
        ) : null}
      </footer>
    </article>
  );
}
