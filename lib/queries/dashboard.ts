import { GapStatus, OperationStatus, RecruitStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { listOperations, countOperationHealth } from "./operation";
import { countRecruitsByStatus } from "./recruit";
import { detectAllGaps } from "@/lib/domain/gap-detector";

/*
  Dashboard — aggregator queries pro Comando Central.
*/

export async function getDashboardSnapshot() {
  await detectAllGaps();
  const [
    healthCounts,
    recruitCounts,
    operations,
    productsWithCounts,
    upcomingBriefings,
    openGapsCount,
    criticalGapsCount,
  ] = await Promise.all([
    countOperationHealth(),
    countRecruitsByStatus(),
    listOperations({ status: "all", health: "all" }),
    prisma.product.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      include: {
        _count: { select: { operations: true } },
      },
    }),
    prisma.briefing.findMany({
      where: {
        date: {
          gte: startOfToday(),
          lte: endOfToday(),
        },
      },
      orderBy: { date: "asc" },
      take: 6,
      select: {
        id: true,
        date: true,
        durationMin: true,
        operation: { select: { codeName: true, recruit: { select: { name: true } } } },
      },
    }),
    prisma.gap.count({ where: { status: { not: GapStatus.RESOLVIDO } } }),
    prisma.gap.count({
      where: {
        status: { not: GapStatus.RESOLVIDO },
        type: { in: ["TASK_OVERDUE", "STAGE_SLA"] },
      },
    }),
  ]);

  const activeOps = operations.filter(
    (op) => op.status === OperationStatus.ATIVA,
  );

  const topOps = [...activeOps]
    .map((op) => {
      const total = op.stages.length || 1;
      const done = op.stages.filter((s) => s.status === "CUMPRIDA").length;
      const progress = Math.round((done / total) * 100);
      return { op, progress };
    })
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 6)
    .map(({ op, progress }) => ({
      id: op.id,
      label: op.codeName,
      primary: progress,
      secondary: progress,
      trailing: `${progress}%`,
    }));

  const baixas = activeOps.filter((op) => op.health === "baixa_iminente");
  const atencao = activeOps.filter((op) => op.health === "atencao");

  const totalOps = operations.length || 1;
  const cumpridas = operations.reduce((acc, op) => {
    const ops = op.stages.reduce(
      (a, s) => a + (s.status === "CUMPRIDA" ? 1 : 0),
      0,
    );
    return acc + ops;
  }, 0);
  const totalStages = operations.reduce(
    (acc, op) => acc + op.stages.length,
    0,
  );
  const entregasMedia =
    totalStages > 0 ? Math.round((cumpridas / totalStages) * 100) : 0;
  const saudeMedia =
    Math.round((healthCounts.em_campo * 100 + healthCounts.atencao * 60) /
      Math.max(1, totalOps - healthCounts.extracao));

  const produtos = await Promise.all(
    productsWithCounts.map(async (p) => {
      const ops = activeOps.filter((op) => op.product.id === p.id);
      const stats = {
        saudaveis: ops.filter((o) => o.health === "em_campo").length,
        atencao: ops.filter((o) => o.health === "atencao").length,
        criticos: ops.filter((o) => o.health === "baixa_iminente").length,
        avancaram: ops.reduce(
          (acc, op) =>
            acc +
            op.stages.filter(
              (s) =>
                s.status === "CUMPRIDA" &&
                s.completedAt !== null &&
                Date.now() - s.completedAt.getTime() < 7 * 24 * 60 * 60 * 1000,
            ).length,
          0,
        ),
      };
      const tasksTotal = ops.reduce(
        (acc, op) => acc + op.stages.length,
        0,
      );
      const tasksDone = ops.reduce(
        (acc, op) =>
          acc + op.stages.filter((s) => s.status === "CUMPRIDA").length,
        0,
      );
      return {
        id: p.id,
        name: p.name,
        activeCount: ops.length,
        stats,
        tasksProgress: { done: tasksDone, total: tasksTotal },
        highlight: ops[0]
          ? {
              name: ops[0].recruit.name,
              tag: p.name.slice(0, 2).toUpperCase(),
              pct:
                ops[0].stages.length > 0
                  ? Math.round(
                      (ops[0].stages.filter((s) => s.status === "CUMPRIDA").length /
                        ops[0].stages.length) *
                        100,
                    )
                  : 0,
            }
          : undefined,
      };
    }),
  );

  return {
    healthCounts,
    recruitCounts,
    kpis: {
      clientesAtivos: recruitCounts.ATIVO,
      tasksMedia: entregasMedia,
      entregasMedia: entregasMedia,
      gapsAbertos: openGapsCount,
      gapsCriticos: criticalGapsCount,
    },
    saudeMedia,
    topOperacoes: topOps,
    baixas: baixas.map(opToCardMock),
    atencao: atencao.map(opToCardMock),
    briefingsHoje: upcomingBriefings.map((b) => ({
      id: b.id,
      time: new Intl.DateTimeFormat("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "America/Sao_Paulo",
      }).format(b.date),
      recruit: b.operation.recruit.name,
      duration: b.durationMin ?? 30,
    })),
    produtos,
    isEmpty:
      operations.length === 0 && recruitCounts.total === 0,
  };
}

function opToCardMock(op: {
  id: string;
  codeName: string;
  recruit: { name: string };
  health: "em_campo" | "atencao" | "baixa_iminente" | "extracao";
  stages: Array<{ status: string; name: string; order: number }>;
}) {
  const totalStages = op.stages.length || 1;
  const doneStages = op.stages.filter((s) => s.status === "CUMPRIDA").length;
  const progress = Math.round((doneStages / totalStages) * 100);
  const currentStage = op.stages.find((s) => s.status === "EM_ANDAMENTO");

  return {
    id: op.id,
    name: op.codeName,
    initials: op.recruit.name
      .split(" ")
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase(),
    subtitle: `${op.recruit.name}${currentStage ? ` · ${currentStage.name}` : ""}`,
    health: op.health,
    progress,
    progressLabel: `${doneStages}/${totalStages} etapas`,
    progressPercentDisplay: `${progress}%`,
    avatarGradient: (op.health === "baixa_iminente"
      ? "casualty"
      : op.health === "atencao"
        ? "bronze"
        : "patrol") as "casualty" | "bronze" | "patrol" | "copper",
  };
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfToday(): Date {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

// Re-export para a page consumir tipos
export type DashboardSnapshot = Awaited<ReturnType<typeof getDashboardSnapshot>>;
export { RecruitStatus, OperationStatus };
