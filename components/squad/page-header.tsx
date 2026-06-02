import { cn } from "@/lib/utils";

/*
  PageHeader — cabecalho grande de tela com titulo Oswald + subtitulo +
  indicador live de "atualizado HH:MM" com bolinha pulsando.
*/

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Data/hora do ultimo refresh dos dados — formata como "Atualizado HH:MM" */
  updatedAt?: Date;
  /** Quando true, mostra a bolinha verde piscando ao lado do "Atualizado" */
  live?: boolean;
  /** Acoes opcionais a direita (botoes, filtros) */
  actions?: React.ReactNode;
  className?: string;
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(date);
}

export function PageHeader({
  title,
  subtitle,
  updatedAt,
  live = false,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "surface-raised px-6 py-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4",
        className,
      )}
    >
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-[26px] sm:text-[28px] font-medium leading-tight text-cream">
          {title}
        </h1>
        {subtitle ? (
          <p className="text-cream-muted text-[13px]">{subtitle}</p>
        ) : null}
      </div>

      <div className="flex items-center gap-4">
        {actions}
        {updatedAt ? (
          <div className="flex items-center gap-2 text-cream-dim text-[11px] font-mono">
            {live ? (
              <span
                className="inline-block w-1.5 h-1.5 rounded-full bg-patrol animate-pulse-live"
                aria-hidden
              />
            ) : null}
            <span>Atualizado {formatTime(updatedAt)}</span>
          </div>
        ) : null}
      </div>
    </header>
  );
}
