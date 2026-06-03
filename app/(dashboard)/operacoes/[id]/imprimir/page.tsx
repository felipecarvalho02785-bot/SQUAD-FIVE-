import { notFound } from "next/navigation";
import Link from "next/link";
import { IconArrowLeft, IconPrinter } from "@tabler/icons-react";
import { getOperationById } from "@/lib/queries/operation";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

function formatDate(date: Date | null): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatTime(date: Date | null): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export async function generateMetadata({ params }: { params: Params }) {
  const { id } = await params;
  const op = await getOperationById(id);
  return {
    title: op
      ? `Status report: ${op.codeName}`
      : "Status report — Squad Five",
  };
}

export default async function StatusReportPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const operation = await getOperationById(id);
  if (!operation) notFound();

  const totalStages = operation.stages.length;
  const doneStages = operation.stages.filter(
    (s) => s.status === "CUMPRIDA",
  ).length;
  const progress =
    totalStages > 0 ? Math.round((doneStages / totalStages) * 100) : 0;

  const totalOrders = operation.stages.flatMap((s) => s.orders).length;
  const doneOrders = operation.stages
    .flatMap((s) => s.orders)
    .filter((o) => o.status === "CUMPRIDA").length;

  const npsScores = operation.briefings
    .filter((b) => b.npsScore !== null)
    .map((b) => b.npsScore!);
  const avgNps =
    npsScores.length > 0
      ? npsScores.reduce((a, b) => a + b, 0) / npsScores.length
      : null;

  return (
    <div className="bg-white text-black min-h-screen print:bg-white print:text-black">
      <style>{`
        @media print {
          @page { size: A4; margin: 18mm; }
          body { background: white !important; }
          .print-hide { display: none !important; }
        }
        @media screen {
          .report-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 32px 24px;
            background: white;
            color: #1a1816;
            font-family: 'Inter', system-ui, sans-serif;
          }
        }
      `}</style>

      <div className="print-hide bg-surface-base text-text-primary py-3 px-5 flex items-center justify-between border-b border-border-default">
        <Link
          href={`/operacoes/${operation.id}`}
          className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary text-[12px] transition-colors"
        >
          <IconArrowLeft size={14} aria-hidden />
          Voltar à operação
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-input bg-accent-cta text-accent-cta-fg font-display uppercase tracking-[0.05em] text-[12px]"
        >
          <IconPrinter size={14} aria-hidden />
          Imprimir / Salvar PDF
        </button>
      </div>

      <div className="report-container print:max-w-full">
        <header
          className="flex items-end justify-between border-b-2 border-[#2F4A2C] pb-4 mb-6"
          style={{ pageBreakAfter: "avoid" }}
        >
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#6b665d]">
              Status report · Squad Five · E3 Digital
            </div>
            <h1 className="text-[28px] font-bold mt-1" style={{ fontFamily: "Oswald, Impact, sans-serif", letterSpacing: "0.02em" }}>
              {operation.codeName}
            </h1>
            <p className="text-[13px] text-[#3D3A35] mt-1">
              {operation.recruit.name} · {operation.product.name}
            </p>
          </div>
          <div className="text-right text-[11px] text-[#6b665d]">
            <div>Gerado em {formatTime(new Date())}</div>
            <div>Iniciada em {formatDate(operation.startedAt)}</div>
            {operation.endedAt ? (
              <div>Encerrada em {formatDate(operation.endedAt)}</div>
            ) : null}
          </div>
        </header>

        <section className="grid grid-cols-4 gap-3 mb-6">
          <div className="border border-[#d8d3c4] p-3 rounded">
            <div className="text-[9px] uppercase tracking-[0.1em] text-[#6b665d]">
              Status
            </div>
            <div className="text-[16px] font-bold mt-1" style={{ fontFamily: "Oswald" }}>
              {operation.status}
            </div>
          </div>
          <div className="border border-[#d8d3c4] p-3 rounded">
            <div className="text-[9px] uppercase tracking-[0.1em] text-[#6b665d]">
              Progresso
            </div>
            <div className="text-[16px] font-bold mt-1" style={{ fontFamily: "Oswald" }}>
              {progress}%
            </div>
          </div>
          <div className="border border-[#d8d3c4] p-3 rounded">
            <div className="text-[9px] uppercase tracking-[0.1em] text-[#6b665d]">
              Ordens
            </div>
            <div className="text-[16px] font-bold mt-1" style={{ fontFamily: "Oswald" }}>
              {doneOrders}/{totalOrders}
            </div>
          </div>
          <div className="border border-[#d8d3c4] p-3 rounded">
            <div className="text-[9px] uppercase tracking-[0.1em] text-[#6b665d]">
              NPS médio
            </div>
            <div className="text-[16px] font-bold mt-1" style={{ fontFamily: "Oswald" }}>
              {avgNps !== null ? avgNps.toFixed(1) : "—"}
            </div>
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-[14px] uppercase tracking-[0.1em] border-b border-[#d8d3c4] pb-1 mb-3" style={{ fontFamily: "Oswald" }}>
            Jornada
          </h2>
          <ol className="space-y-2">
            {operation.stages.map((stage) => (
              <li key={stage.id} className="flex items-center gap-3 text-[12px]">
                <span
                  className={`inline-flex items-center justify-center w-6 h-6 rounded-full border-2 text-[10px] font-bold ${
                    stage.status === "CUMPRIDA"
                      ? "bg-[#4a6b45] border-[#4a6b45] text-white"
                      : stage.status === "EM_ANDAMENTO"
                        ? "bg-[#d78a5c] border-[#d78a5c] text-white"
                        : "bg-white border-[#d8d3c4] text-[#6b665d]"
                  }`}
                >
                  {stage.order}
                </span>
                <span className="flex-1 font-medium">{stage.name}</span>
                <span className="text-[10px] text-[#6b665d] font-mono">
                  {stage.status === "CUMPRIDA"
                    ? `Cumprida em ${formatDate(stage.completedAt)}`
                    : stage.status === "EM_ANDAMENTO"
                      ? `Em andamento desde ${formatDate(stage.startedAt)}`
                      : `Pendente · SLA ${stage.slaDays}d`}
                </span>
              </li>
            ))}
          </ol>
        </section>

        {operation.briefings.length > 0 ? (
          <section className="mb-6">
            <h2 className="text-[14px] uppercase tracking-[0.1em] border-b border-[#d8d3c4] pb-1 mb-3" style={{ fontFamily: "Oswald" }}>
              Briefings registrados
            </h2>
            <ul className="space-y-2">
              {operation.briefings.map((b) => (
                <li
                  key={b.id}
                  className="flex items-center justify-between text-[12px] py-1 border-b border-[#f0ece1] last:border-0"
                >
                  <span>{formatDate(b.date)}</span>
                  {b.npsScore !== null ? (
                    <span className="font-mono text-[#a85a3a] font-bold">
                      NPS {b.npsScore}
                    </span>
                  ) : (
                    <span className="text-[#6b665d]">sem NPS</span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {operation.gaps.filter((g) => g.status !== "RESOLVIDO").length > 0 ? (
          <section className="mb-6">
            <h2 className="text-[14px] uppercase tracking-[0.1em] border-b border-[#d8d3c4] pb-1 mb-3" style={{ fontFamily: "Oswald" }}>
              Gaps em aberto
            </h2>
            <ul className="space-y-2">
              {operation.gaps
                .filter((g) => g.status !== "RESOLVIDO")
                .map((g) => (
                  <li
                    key={g.id}
                    className="text-[12px] p-2 border-l-2 border-[#c84a4a] bg-[#fdf3f3]"
                  >
                    <span className="text-[9px] uppercase tracking-[0.1em] text-[#8a1f1f] font-bold">
                      {g.type.replace(/_/g, " ")}
                    </span>
                    <p className="mt-0.5">{g.description}</p>
                  </li>
                ))}
            </ul>
          </section>
        ) : null}

        <footer
          className="mt-12 pt-4 border-t border-[#d8d3c4] text-[10px] text-[#6b665d] text-center"
          style={{ pageBreakBefore: "avoid" }}
        >
          Status report gerado pelo Squad Five — Sistema Operacional da E3
          Digital · {formatTime(new Date())}
        </footer>
      </div>
    </div>
  );
}
