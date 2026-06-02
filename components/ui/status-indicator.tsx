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
*/

export type IndicatorStatus =
  | "em_campo"
  | "atencao"
  | "baixa_iminente"
  | "extracao";

const STATUS_STYLES: Record<
  IndicatorStatus,
  { bg: string; ring: string; pulse: boolean }
> = {
  em_campo: { bg: "bg-patrol", ring: "ring-patrol/40", pulse: false },
  atencao: { bg: "bg-bronze", ring: "ring-bronze/40", pulse: false },
  baixa_iminente: { bg: "bg-casualty", ring: "ring-casualty/40", pulse: true },
  extracao: { bg: "bg-tactical", ring: "ring-tactical/40", pulse: false },
};

interface StatusIndicatorProps {
  status: IndicatorStatus;
  /** mini (6px sem icone) · md (18px com icone) · lg (32-38px linha do tempo) */
  size?: "mini" | "md" | "lg";
  className?: string;
  label?: string;
}

export function StatusIndicator({
  status,
  size = "md",
  className,
  label,
}: StatusIndicatorProps) {
  const { bg, ring, pulse } = STATUS_STYLES[status];

  if (size === "mini") {
    return (
      <span
        className={cn(
          "inline-block rounded-full ring-2 w-1.5 h-1.5",
          bg,
          ring,
          pulse && "animate-pulse-status",
          className,
        )}
        aria-label={label ?? status}
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
      aria-label={label ?? status}
      role="status"
    >
      <Icon size={iconSize} stroke={2.5} />
    </span>
  );
}
