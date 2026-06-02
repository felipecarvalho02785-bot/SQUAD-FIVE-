import { Prisma, OperationStatus, StageStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { calculateHealth } from "@/lib/domain/health";
import type { OperationFilter } from "@/lib/schemas/operation";

/*
  Queries de leitura de Operacoes.
*/

const operationSelect = {
  id: true,
  codeName: true,
  status: true,
  startedAt: true,
  targetEndAt: true,
  endedAt: true,
  recruit: { select: { id: true, name: true } },
  product: { select: { id: true, name: true, archetype: true } },
  owner: { select: { id: true, name: true, email: true } },
  stages: {
    select: {
      id: true,
      name: true,
      order: true,
      slaDays: true,
      status: true,
      startedAt: true,
      completedAt: true,
      orders: {
        select: { id: true, status: true, dueDate: true },
      },
    },
    orderBy: { order: "asc" as const },
  },
} satisfies Prisma.OperationSelect;

export type OperationListItem = Awaited<
  ReturnType<typeof listOperations>
>[number];

function operationToHealthInput(op: {
  status: OperationStatus;
  stages: Array<{
    status: StageStatus;
    slaDays: number;
    startedAt: Date | null;
    orders: Array<{ status: "A_FAZER" | "EM_ANDAMENTO" | "CUMPRIDA"; dueDate: Date | null }>;
  }>;
}) {
  const persistedStatus: "ativa" | "pausada" | "encerrada" =
    op.status === OperationStatus.ATIVA
      ? "ativa"
      : op.status === OperationStatus.PAUSADA
        ? "pausada"
        : "encerrada";

  const currentStage = op.stages.find(
    (s) => s.status === StageStatus.EM_ANDAMENTO,
  );

  const allOrders = op.stages.flatMap((s) => s.orders);
  const orders = allOrders.map((o) => ({
    due_date: o.dueDate,
    status:
      o.status === "CUMPRIDA"
        ? ("cumprida" as const)
        : o.status === "EM_ANDAMENTO"
          ? ("em_andamento" as const)
          : ("a_fazer" as const),
  }));

  return {
    status: persistedStatus,
    orders,
    currentStage: currentStage
      ? {
          sla_days: currentStage.slaDays,
          started_at: currentStage.startedAt,
        }
      : null,
  };
}

export async function listOperations(
  filter: OperationFilter = { status: "all", health: "all" },
) {
  const where: Prisma.OperationWhereInput = {};

  if (filter.status && filter.status !== "all") {
    where.status = filter.status;
  }
  if (filter.productId) {
    where.productId = filter.productId;
  }

  const operations = await prisma.operation.findMany({
    where,
    orderBy: [{ startedAt: "desc" }],
    select: operationSelect,
  });

  const withHealth = operations.map((op) => ({
    ...op,
    health: calculateHealth(operationToHealthInput(op)),
  }));

  if (filter.health && filter.health !== "all") {
    return withHealth.filter((op) => {
      const expected =
        filter.health === "em_campo"
          ? "em_campo"
          : filter.health === "atencao"
            ? "atencao"
            : filter.health === "baixa_iminente"
              ? "baixa_iminente"
              : "extracao";
      return op.health === expected;
    });
  }

  return withHealth;
}

export async function getOperationById(id: string) {
  const op = await prisma.operation.findUnique({
    where: { id },
    include: {
      recruit: { select: { id: true, name: true } },
      product: true,
      owner: { select: { id: true, name: true, email: true } },
      stages: {
        orderBy: { order: "asc" },
        include: {
          orders: {
            orderBy: { dueDate: "asc" },
          },
        },
      },
      briefings: {
        orderBy: { date: "desc" },
        take: 5,
        select: {
          id: true,
          date: true,
          npsScore: true,
          createdBy: { select: { name: true } },
        },
      },
      gaps: {
        where: { status: { not: "RESOLVIDO" } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!op) return null;

  return {
    ...op,
    health: calculateHealth(operationToHealthInput(op)),
  };
}

export async function countOperationHealth() {
  const ops = await prisma.operation.findMany({ select: operationSelect });
  const counts = {
    em_campo: 0,
    atencao: 0,
    baixa_iminente: 0,
    extracao: 0,
    total: ops.length,
  };
  for (const op of ops) {
    const h = calculateHealth(operationToHealthInput(op));
    counts[h] += 1;
  }
  return counts;
}
