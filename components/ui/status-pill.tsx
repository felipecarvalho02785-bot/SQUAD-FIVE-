import {
  IconCheck,
  IconClock,
  IconAlertTriangle,
  IconCircleMinus,
  IconCircleDashed,
  IconPlayerPlay,
} from "@tabler/icons-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/*
  StatusPill v2 — agora com ícone integrado pra reforçar leitura
  (acessibilidade WCAG 1.4.1: não-só-cor).
*/

const statusPillStyles = cva(
  "inline-flex items-center gap-1 font-display uppercase font-medium tracking-[0.1em] text-[10px] leading-none px-2 py-1 rounded-pill border",
  {
    variants: {
      status: {
        em_campo: "bg-surface-accent text-text-secondary border-border-strong",
        atencao: "bg-border-default text-bronze border-accent",
        baixa_iminente:
          "bg-status-critical-deep text-text-primary border-status-critical",
        extracao:
          "bg-border-default text-text-secondary border-border-default",
        cumprida: "bg-surface-accent text-text-secondary border-border-strong",
        em_andamento: "bg-border-default text-bronze border-border-default",
        a_fazer: "bg-surface-raised text-text-secondary border-border-default",
      },
    },
    defaultVariants: { status: "em_campo" },
  },
);

const STATUS_LABELS: Record<
  NonNullable<VariantProps<typeof statusPillStyles>["status"]>,
  string
> = {
  em_campo: "Em campo",
  atencao: "Atenção",
  baixa_iminente: "Baixa iminente",
  extracao: "Extração",
  cumprida: "Cumprida",
  em_andamento: "Em andamento",
  a_fazer: "A fazer",
};

const STATUS_ICONS: Record<
  NonNullable<VariantProps<typeof statusPillStyles>["status"]>,
  typeof IconCheck
> = {
  em_campo: IconCheck,
  atencao: IconClock,
  baixa_iminente: IconAlertTriangle,
  extracao: IconCircleMinus,
  cumprida: IconCheck,
  em_andamento: IconPlayerPlay,
  a_fazer: IconCircleDashed,
};

interface StatusPillProps extends VariantProps<typeof statusPillStyles> {
  className?: string;
  label?: string;
  /** Quando true esconde o ícone (textual only) */
  textOnly?: boolean;
}

export function StatusPill({
  status,
  label,
  className,
  textOnly = false,
}: StatusPillProps) {
  const resolvedStatus = status ?? "em_campo";
  const Icon = STATUS_ICONS[resolvedStatus];
  return (
    <span className={cn(statusPillStyles({ status }), className)}>
      {!textOnly ? <Icon size={9} stroke={2.5} aria-hidden /> : null}
      {label ?? STATUS_LABELS[resolvedStatus]}
    </span>
  );
}
