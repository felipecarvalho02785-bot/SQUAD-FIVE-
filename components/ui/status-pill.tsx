import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/*
  StatusPill — badge de status de operacao/ordem.
  Specs em docs/03_SISTEMA_DESIGN.md secao 5.5.
*/

const statusPillStyles = cva(
  "inline-flex items-center gap-1.5 font-display uppercase font-medium tracking-[0.1em] text-[10px] leading-none px-2.5 py-1 rounded-pill border",
  {
    variants: {
      status: {
        em_campo: "bg-jungle text-cream-muted border-patrol",
        atencao: "bg-tactical text-bronze border-copper",
        baixa_iminente: "bg-casualty text-[#2B0F0F] border-casualty",
        extracao: "bg-tactical text-cream-dim border-tactical",
        cumprida: "bg-jungle text-cream-muted border-patrol",
        em_andamento: "bg-tactical text-bronze border-tactical",
        a_fazer: "bg-card-raised text-cream-dim border-tactical",
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
