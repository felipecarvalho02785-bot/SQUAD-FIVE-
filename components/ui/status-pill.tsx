import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/*
  StatusPill — badge de status de operacao/ordem.
  Specs em docs/03_SISTEMA_DESIGN.md secao 5.5.

  Acessibilidade:
    - Toda variante tem texto explicito (nao comunica so por cor) e
      contraste >=4.5:1. baixa_iminente usa casualty-deep como fill
      pra permitir cream como texto (8:1+).
*/

const statusPillStyles = cva(
  "inline-flex items-center gap-1.5 font-display uppercase font-medium tracking-[0.1em] text-[10px] leading-none px-2.5 py-1 rounded-pill border",
  {
    variants: {
      status: {
        em_campo:
          "bg-surface-accent text-text-secondary border-border-strong",
        atencao:
          "bg-border-default text-bronze border-accent",
        baixa_iminente:
          "bg-status-critical-deep text-text-primary border-status-critical",
        extracao:
          "bg-border-default text-text-secondary border-border-default",
        cumprida:
          "bg-surface-accent text-text-secondary border-border-strong",
        em_andamento:
          "bg-border-default text-bronze border-border-default",
        a_fazer:
          "bg-surface-raised text-text-secondary border-border-default",
      },
    },
    defaultVariants: {
      status: "em_campo",
    },
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

interface StatusPillProps extends VariantProps<typeof statusPillStyles> {
  className?: string;
  /** Sobrescreve o texto exibido. Por padrao usa o label canonico do status. */
  label?: string;
}

export function StatusPill({ status, label, className }: StatusPillProps) {
  const resolvedStatus = status ?? "em_campo";
  return (
    <span className={cn(statusPillStyles({ status }), className)}>
      {label ?? STATUS_LABELS[resolvedStatus]}
    </span>
  );
}
