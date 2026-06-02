import {
  IconCheck,
  IconClock,
  IconExclamationMark,
  IconCircleMinus,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

/*
  StatusIndicator — bolinha circular com icone interno.
  Specs em docs/03_SISTEMA_DESIGN.md secao 5.10.

  Acessibilidade:
    - Cada size >=18px traz icone interno, garantindo que o significado
      nao depende apenas de cor (WCAG 1.4.1 e SC 1.4.11 non-text contrast
      3:1).
*/

export type IndicatorStatus =
  | "em_campo"
  | "atencao"
  | "baixa_iminente"
  | "extracao";

const STATUS_STYLES: Record<
  IndicatorStatus,
  { bg: string; pulse: boolean }
> = {
  em_campo: { bg: "bg-status-ok", pulse: false },
  atencao: { bg: "bg-status-warn", pulse: false },
  baixa_iminente: { bg: "bg-status-critical", pulse: true },
  extracao: { bg: "bg-status-idle", pulse: false },
};

const STATUS_LABELS: Record<IndicatorStatus, string> = {
  em_campo: "Em campo",
  atencao: "Atenção",
  baixa_iminente: "Baixa iminente",
  extracao: "Extração",
};

interface StatusIndicatorProps {
  status: IndicatorStatus;
  /** mini (6px sem icone) · md (18px com icone) · lg (32-38px linha do tempo) */
  size?: "mini" | "md" | "lg";
  className?: string;
  /** Override do label de acessibilidade. Por padrao usa o nome do status em PT-BR. */
  label?: string;
}

export function StatusIndicator({
  status,
  size = "md",
  className,
  label,
}: StatusIndicatorProps) {
  const { bg, pulse } = STATUS_STYLES[status];
  const ariaLabel = label ?? STATUS_LABELS[status];

  if (size === "mini") {
    return (
      <span
        className={cn(
          "inline-block rounded-full w-1.5 h-1.5",
          bg,
          pulse && "animate-pulse-status",
          className,
        )}
        aria-label={ariaLabel}
        role="status"
      />
    );
  }

  const dimension = size === "md" ? "w-[18px] h-[18px]" : "w-9 h-9";
  const iconSize = size === "md" ? 11 : 18;
  const Icon =
    status === "em_campo"
      ? IconCheck
      : status === "atencao"
        ? IconClock
        : status === "baixa_iminente"
          ? IconExclamationMark
          : IconCircleMinus;

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full text-combat",
        dimension,
        bg,
        pulse && "animate-pulse-status",
        className,
      )}
      aria-label={ariaLabel}
      role="status"
    >
      <Icon size={iconSize} stroke={2.5} aria-hidden />
    </span>
  );
}
