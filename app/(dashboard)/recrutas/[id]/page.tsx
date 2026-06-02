import Link from "next/link";
import { notFound } from "next/navigation";
import { Prisma, RecruitStatus } from "@prisma/client";
import {
  IconEdit,
  IconArrowLeft,
  IconTarget,
  IconTargetArrow,
} from "@tabler/icons-react";
import { PageHeader } from "@/components/squad/page-header";
import { FeedbackBanner } from "@/components/squad/feedback-banner";
import { StatusPill } from "@/components/ui/status-pill";
import { buttonVariants } from "@/components/ui/button";
import { RecruitStatusActions } from "@/components/recruta/recruit-status-actions";
import { getRecruitById } from "@/lib/queries/recruit";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const STATUS_PILL: Record<RecruitStatus, "em_campo" | "atencao" | "extracao"> = {
  ATIVO: "em_campo",
  PAUSADO: "atencao",
  BAIXA: "extracao",
};
const STATUS_LABEL: Record<RecruitStatus, string> = {
  ATIVO: "Ativo",
  PAUSADO: "Pausado",
  BAIXA: "Baixa",
};

const JUST_MESSAGES: Record<string, string> = {
  created: "Recruta alistado com sucesso.",
  updated: "Ficha atualizada.",
  baixa: "Recruta marcado como baixa.",
  reactivated: "Recruta reativado. De volta ao campo.",
};

function formatCurrency(value: Prisma.Decimal | null): string {
  if (!value) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value));
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export async function generateMetadata({ params }: { params: Params }) {
  const { id } = await params;
  const recruit = await getRecruitById(id);
  return { title: recruit ? `${recruit.name} — Squad Five` : "Recruta — Squad Five" };
}

export default async function RecrutaDetalhePage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const recruit = await getRecruitById(id);

  if (!recruit) {
    notFound();
  }

  const justKey = Array.isArray(sp.just) ? sp.just[0] : sp.just;
  const justMessage = justKey ? JUST_MESSAGES[justKey] : undefined;

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/recrutas"
        className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary text-[12px] transition-colors w-fit"
      >
        <IconArrowLeft size={14} aria-hidden />
        Voltar para Recrutas
      </Link>

      {justMessage ? <FeedbackBanner message={justMessage} /> : null}

      <PageHeader
        title={recruit.name}
        subtitle={
          recruit.segment
            ? `${recruit.segment} · alistado em ${formatDate(recruit.createdAt)}`
            : `Alistado em ${formatDate(recruit.createdAt)}`
        }
        actions={
          <div className="flex items-center gap-2">
            <StatusPill
              status={STATUS_PILL[recruit.status]}
              label={STATUS_LABEL[recruit.status]}
            />
            {recruit.status !== "BAIXA" ? (
              <Link
                href={`/operacoes/nova?recruitId=${recruit.id}`}
                className={buttonVariants({ variant: "primary", size: "md" })}
              >
                <IconTargetArrow size={14} aria-hidden />
                Mobilizar
              </Link>
            ) : null}
            <Link
              href={`/recrutas/${recruit.id}/editar`}
              className={buttonVariants({ variant: "secondary", size: "md" })}
            >
              <IconEdit size={14} aria-hidden />
              Editar
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 flex flex-col gap-3">
          <section className="surface-raised p-5 flex flex-col gap-4">
            <header className="flex items-center justify-between">
              <h2 className="label-display text-[11px] text-text-secondary">
                Contato
              </h2>
            </header>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-[13px]">
              <FieldRow label="Responsável" value={recruit.contactName} />
              <FieldRow label="E-mail" value={recruit.contactEmail} mono />
              <FieldRow label="Telefone" value={recruit.contactPhone} mono />
              <FieldRow label="Segmento" value={recruit.segment} />
            </dl>
          </section>

          <section className="surface-raised p-5 flex flex-col gap-4">
            <header className="flex items-center justify-between">
              <h2 className="label-display text-[11px] text-text-secondary">
                Operacional
              </h2>
              <span className="font-display text-[14px] text-bronze tabular-nums">
                {formatCurrency(recruit.campaignBudget)}
              </span>
            </header>
            <FieldRow
              label="Orçamento de campanha"
              value={formatCurrency(recruit.campaignBudget)}
              hideValueIfText
            />
            <FieldRow
              label="Teses"
              value={recruit.theses}
              multiline
              empty="Sem teses registradas. Use o botão Editar para adicionar."
            />
            <FieldRow
              label="Observações"
              value={recruit.notes}
              multiline
              empty="Sem observações."
            />
          </section>

          <section className="surface-raised p-5 flex flex-col gap-3">
            <header className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconTarget
                  size={14}
                  className="text-bronze"
                  stroke={1.5}
                  aria-hidden
                />
                <h2 className="label-display text-[11px] text-text-secondary">
                  Operações vinculadas
                </h2>
                <span className="font-mono text-[11px] text-text-dim">
                  {recruit.operations.length}
                </span>
              </div>
            </header>

            {recruit.operations.length === 0 ? (
              <div className="py-6 flex flex-col items-center gap-3 text-center">
                <p className="text-text-secondary text-[13px]">
                  Nenhuma operação registrada nesta ficha.
                </p>
                {recruit.status !== "BAIXA" ? (
                  <Link
                    href={`/operacoes/nova?recruitId=${recruit.id}`}
                    className={buttonVariants({
                      variant: "primary",
                      size: "md",
                    })}
                  >
                    <IconTargetArrow size={14} aria-hidden />
                    Mobilizar primeira operação
                  </Link>
                ) : null}
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {recruit.operations.map((op) => (
                  <li key={op.id}>
                    <Link
                      href={`/operacoes/${op.id}`}
                      className="flex items-center justify-between gap-3 p-3 rounded-card bg-surface-deep border border-border-default/60 hover:border-border-strong transition-colors group"
                    >
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-text-primary text-[13px] truncate group-hover:text-accent-hover transition-colors">
                          {op.codeName}
                        </span>
                        <span className="text-text-dim text-[11px]">
                          {op.product.name} · {op.status.toLowerCase()}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="flex flex-col gap-3">
          <section className="surface-jungle p-5 flex flex-col gap-3">
            <h2 className="label-display text-[11px] text-text-primary">
              Estado da ficha
            </h2>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary text-[12px]">Status</span>
              <StatusPill
                status={STATUS_PILL[recruit.status]}
                label={STATUS_LABEL[recruit.status]}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary text-[12px]">Alistado</span>
              <span className="font-mono text-text-primary text-[11px]">
                {formatDate(recruit.createdAt)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary text-[12px]">Operações</span>
              <span className="font-mono text-text-primary text-[11px]">
                {recruit.operations.length}
              </span>
            </div>
          </section>

          <section className="surface-raised p-5 flex flex-col gap-3">
            <h2 className="label-display text-[11px] text-text-secondary">
              Ações
            </h2>
            <RecruitStatusActions id={recruit.id} status={recruit.status} />
          </section>
        </aside>
      </div>
    </div>
  );
}

function FieldRow({
  label,
  value,
  mono = false,
  multiline = false,
  empty = "—",
  hideValueIfText = false,
}: {
  label: string;
  value: string | null | undefined;
  mono?: boolean;
  multiline?: boolean;
  empty?: string;
  hideValueIfText?: boolean;
}) {
  const isEmpty = !value || (typeof value === "string" && value.trim() === "");
  if (hideValueIfText) return null;
  return (
    <div
      className={multiline ? "flex flex-col gap-1" : "flex flex-col gap-0.5"}
    >
      <dt className="label-display text-[9px] text-text-label">{label}</dt>
      <dd
        className={`text-text-primary ${mono ? "font-mono" : ""} ${multiline ? "text-[12px] leading-relaxed whitespace-pre-wrap" : "text-[13px]"} ${isEmpty ? "text-text-dim italic" : ""}`}
      >
        {isEmpty ? empty : value}
      </dd>
    </div>
  );
}
