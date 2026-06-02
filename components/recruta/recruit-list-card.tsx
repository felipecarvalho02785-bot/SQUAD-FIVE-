import Link from "next/link";
import { Prisma, RecruitStatus } from "@prisma/client";
import {
  IconArrowUpRight,
  IconBriefcase,
  IconCurrencyReal,
} from "@tabler/icons-react";
import { StatusPill } from "@/components/ui/status-pill";
import { cn } from "@/lib/utils";

/*
  Card de Recruta usado na lista. Diferente do RecruitCard (que e focado
  em operacao com progress + saude). Este e focado em ficha — nome,
  contato, segmento, status.
*/

interface RecruitListCardProps {
  recruit: {
    id: string;
    name: string;
    contactName: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
    segment: string | null;
    campaignBudget: Prisma.Decimal | null;
    status: RecruitStatus;
    createdAt: Date;
    _count: { operations: number };
  };
}

const STATUS_PILL_MAP: Record<RecruitStatus, "em_campo" | "atencao" | "extracao"> = {
  ATIVO: "em_campo",
  PAUSADO: "atencao",
  BAIXA: "extracao",
};

const STATUS_LABEL: Record<RecruitStatus, string> = {
  ATIVO: "Ativo",
  PAUSADO: "Pausado",
  BAIXA: "Baixa",
};

const STATUS_BORDER: Record<RecruitStatus, string> = {
  ATIVO: "before:bg-status-ok",
  PAUSADO: "before:bg-status-warn",
  BAIXA: "before:bg-status-idle",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatCurrency(value: Prisma.Decimal | null): string {
  if (!value) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export function RecruitListCard({ recruit }: RecruitListCardProps) {
  const initials = getInitials(recruit.name);

  return (
    <Link
      href={`/recrutas/${recruit.id}`}
      className={cn(
        "relative surface-raised lift-hover p-4 flex flex-col gap-3 group",
        "before:absolute before:left-0 before:top-3 before:bottom-3 before:w-[3px] before:rounded-r-full",
        STATUS_BORDER[recruit.status],
      )}
    >
      <header className="flex items-start gap-3">
        <div
          className="shrink-0 w-10 h-10 rounded-md bg-gradient-to-br from-accent to-jungle-deep flex items-center justify-center text-accent-cta-fg font-display font-medium text-[14px] tracking-[0.05em] ring-1 ring-border-default/60"
          aria-hidden
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-text-primary text-[14px] font-medium truncate group-hover:text-accent-hover transition-colors">
              {recruit.name}
            </h3>
            <IconArrowUpRight
              size={14}
              stroke={1.5}
              className="text-text-dim group-hover:text-accent-hover shrink-0 mt-0.5"
              aria-hidden
            />
          </div>
          {recruit.contactName || recruit.segment ? (
            <p className="text-text-dim text-[11px] mt-0.5 truncate">
              {[recruit.contactName, recruit.segment].filter(Boolean).join(" · ")}
            </p>
          ) : null}
        </div>
      </header>

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <StatusPill
          status={STATUS_PILL_MAP[recruit.status]}
          label={STATUS_LABEL[recruit.status]}
        />
        <div className="flex items-center gap-3 text-[11px] text-text-secondary font-mono tabular-nums">
          <span className="flex items-center gap-1">
            <IconBriefcase size={11} stroke={1.5} aria-hidden />
            {recruit._count.operations}
            <span className="text-text-dim font-sans not-italic">
              {recruit._count.operations === 1 ? "operação" : "operações"}
            </span>
          </span>
          <span className="flex items-center gap-1">
            <IconCurrencyReal size={11} stroke={1.5} aria-hidden />
            {formatCurrency(recruit.campaignBudget)}
          </span>
        </div>
      </div>
    </Link>
  );
}
