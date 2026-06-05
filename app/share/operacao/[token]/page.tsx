import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { calculateHealth } from "@/lib/domain/health";
import { OperationStatus, StageStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

type Params = Promise<{ token: string }>;

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

const HEALTH_LABEL: Record<string, string> = {
  em_campo: "Em campo",
  atencao: "Atenção",
  baixa_iminente: "Baixa iminente",
  extracao: "Extração",
};

const HEALTH_BG: Record<string, string> = {
  em_campo: "#4a6b45",
  atencao: "#d78a5c",
  baixa_iminente: "#c84a4a",
  extracao: "#3d3a35",
};

export async function generateMetadata({ params }: { params: Params }) {
  const { token } = await params;
  const op = await prisma.operation.findUnique({
    where: { shareToken: token },
    select: { codeName: true, recruit: { select: { name: true } } },
  });
  return {
    title: op
      ? `Status report — ${op.codeName} · ${op.recruit.name}`
      : "Status report",
    robots: "noindex, nofollow",
  };
}

export default async function PublicStatusReport({
  params,
}: {
  params: Params;
}) {
  const { token } = await params;
  const operation = await prisma.operation.findUnique({
    where: { shareToken: token },
    include: {
      recruit: true,
      product: true,
      owner: { select: { name: true, email: true } },
      stages: {
        orderBy: { order: "asc" },
        include: {
          orders: { select: { id: true, status: true, dueDate: true } },
        },
      },
      briefings: { orderBy: { date: "desc" }, take: 5 },
      gaps: { where: { status: { not: "RESOLVIDO" } } },
    },
  });

  if (!operation) notFound();

  const persistedStatus =
    operation.status === OperationStatus.ATIVA
      ? "ativa"
      : operation.status === OperationStatus.PAUSADA
        ? "pausada"
        : "encerrada";

  const currentStage = operation.stages.find(
    (s) => s.status === StageStatus.EM_ANDAMENTO,
  );
  const allOrders = operation.stages.flatMap((s) => s.orders);
  const orders = allOrders.map((o) => ({
    due_date: o.dueDate,
    status:
      o.status === "CUMPRIDA"
        ? ("cumprida" as const)
        : o.status === "EM_ANDAMENTO"
          ? ("em_andamento" as const)
          : ("a_fazer" as const),
  }));

  const health = calculateHealth({
    status: persistedStatus,
    orders,
    currentStage: currentStage
      ? {
          sla_days: currentStage.slaDays,
          started_at: currentStage.startedAt,
        }
      : null,
  });

  const totalStages = operation.stages.length;
  const doneStages = operation.stages.filter(
    (s) => s.status === StageStatus.CUMPRIDA,
  ).length;
  const progress =
    totalStages > 0 ? Math.round((doneStages / totalStages) * 100) : 0;

  const totalOrders = allOrders.length;
  const doneOrders = allOrders.filter((o) => o.status === "CUMPRIDA").length;

  const npsScores = operation.briefings
    .filter((b) => b.npsScore !== null)
    .map((b) => b.npsScore!);
  const avgNps =
    npsScores.length > 0
      ? npsScores.reduce((a, b) => a + b, 0) / npsScores.length
      : null;

  return (
    <div className="bg-white text-black min-h-screen">
      <style>{`
        body { background: white !important; color: #1a1816 !important; }
        @media print {
          @page { size: A4; margin: 18mm; }
          .print-hide { display: none !important; }
        }
      `}</style>

      <div className="print-hide bg-[#1a1816] text-[#e8e5d8] py-3 px-5 border-b border-[#3d3a35] flex items-center justify-between text-[12px]">
        <span>Status report compartilhado · Squad Five</span>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#a85a3a] text-[#1a1816] font-display uppercase tracking-[0.05em] text-[11px]"
        >
          Imprimir / Salvar PDF
        </button>
      </div>

      <div className="max-w-[800px] mx-auto p-8" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
        <header className="flex items-end justify-between border-b-2 border-[#2F4A2C] pb-4 mb-6">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#6b665d]">
              Status report · Squad Five · E3 Digital
            </div>
            <h1
              className="text-[28px] font-bold mt-1"
              style={{ fontFamily: "Oswald, Impact, sans-serif", letterSpacing: "0.02em" }}
            >
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
          <Kpi label="Saúde">
            <span
              className="inline-block px-2 py-0.5 rounded text-white"
              style={{ backgroundColor: HEALTH_BG[health], fontSize: 12 }}
            >
              {HEALTH_LABEL[health]}
            </span>
          </Kpi>
          <Kpi label="Progresso">
            <span className="text-[20px] font-bold" style={{ fontFamily: "Oswald" }}>
              {progress}%
            </span>
          </Kpi>
          <Kpi label="Ordens">
            <span className="text-[20px] font-bold" style={{ fontFamily: "Oswald" }}>
              {doneOrders}/{totalOrders}
            </span>
          </Kpi>
          <Kpi label="NPS médio">
            <span className="text-[20px] font-bold" style={{ fontFamily: "Oswald" }}>
              {avgNps !== null ? avgNps.toFixed(1) : "—"}
            </span>
          </Kpi>
        </section>

        <section className="mb-6">
          <h2
            className="text-[14px] uppercase tracking-[0.1em] border-b border-[#d8d3c4] pb-1 mb-3"
            style={{ fontFamily: "Oswald" }}
          >
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
                      : `SLA ${stage.slaDays}d`}
                </span>
              </li>
            ))}
          </ol>
        </section>

        {operation.briefings.length > 0 ? (
          <section className="mb-6">
            <h2
              className="text-[14px] uppercase tracking-[0.1em] border-b border-[#d8d3c4] pb-1 mb-3"
              style={{ fontFamily: "Oswald" }}
            >
              Últimos briefings
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

        {operation.gaps.length > 0 ? (
          <section className="mb-6">
            <h2
              className="text-[14px] uppercase tracking-[0.1em] border-b border-[#d8d3c4] pb-1 mb-3"
              style={{ fontFamily: "Oswald" }}
            >
              Pontos de atenção
            </h2>
            <ul className="space-y-2">
              {operation.gaps.map((g) => (
                <li
                  key={g.id}
                  className="text-[12px] p-2 border-l-2 border-[#c84a4a] bg-[#fdf3f3]"
                >
                  <p>{g.description}</p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <footer className="mt-12 pt-4 border-t border-[#d8d3c4] text-[10px] text-[#6b665d] text-center">
          Status report gerado pelo Squad Five · Squad 5 · E3 Digital
        </footer>
      </div>
    </div>
  );
}

function Kpi({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-[#d8d3c4] p-3 rounded">
      <div className="text-[9px] uppercase tracking-[0.1em] text-[#6b665d]">
        {label}
      </div>
      <div className="mt-1">{children}</div>
    </div>
  );
}
