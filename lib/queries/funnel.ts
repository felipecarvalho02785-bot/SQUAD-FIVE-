import { ActivityType } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

/*
  Distribuição de operações ativas por etapa, agrupado por produto.
  Usado no funnel chart do Comando Central.
*/

const MS_DAY = 1000 * 60 * 60 * 24;

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function weekBoundaries() {
  const todayEnd = startOfDay(new Date());
  todayEnd.setDate(todayEnd.getDate() + 1);
  const weekStart = new Date(todayEnd.getTime() - 7 * MS_DAY);
  const prevWeekStart = new Date(weekStart.getTime() - 7 * MS_DAY);
  return { todayEnd, weekStart, prevWeekStart };
}

export interface ProductWeeklyMetric {
  label: string;
  current: number;
  previous: number;
}

export interface ProductWeeklyComparison {
  id: string;
  name: string;
  archetype: string;
  activeOperations: number;
  metrics: {
    mobilized: ProductWeeklyMetric;
    stages: ProductWeeklyMetric;
    briefings: ProductWeeklyMetric;
    orders: ProductWeeklyMetric;
  };
}

const METRIC_TYPES: ActivityType[] = [
  ActivityType.OPERATION_MOBILIZED,
  ActivityType.STAGE_ADVANCED,
  ActivityType.BRIEFING_REGISTERED,
  ActivityType.ORDER_COMPLETED,
];

export async function getProductWeeklyComparison(): Promise<
  ProductWeeklyComparison[]
> {
  const { todayEnd, weekStart, prevWeekStart } = weekBoundaries();

  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      archetype: true,
      _count: {
        select: { operations: { where: { status: "ATIVA" } } },
      },
    },
  });

  if (products.length === 0) return [];

  let events: Array<{
    type: ActivityType;
    createdAt: Date;
    operation: { productId: string } | null;
  }> = [];

  try {
    events = await prisma.activityEvent.findMany({
      where: {
        type: { in: METRIC_TYPES },
        createdAt: { gte: prevWeekStart, lt: todayEnd },
        operationId: { not: null },
      },
      select: {
        type: true,
        createdAt: true,
        operation: { select: { productId: true } },
      },
    });
  } catch {
    events = [];
  }

  function makeBucket() {
    return {
      mobilized: { current: 0, previous: 0 },
      stages: { current: 0, previous: 0 },
      briefings: { current: 0, previous: 0 },
      orders: { current: 0, previous: 0 },
    };
  }

  const byProduct = new Map<string, ReturnType<typeof makeBucket>>();
  for (const p of products) byProduct.set(p.id, makeBucket());

  for (const e of events) {
    const pid = e.operation?.productId;
    if (!pid) continue;
    const bucket = byProduct.get(pid);
    if (!bucket) continue;

    const isCurrent = e.createdAt.getTime() >= weekStart.getTime();
    const slot = isCurrent ? "current" : "previous";

    switch (e.type) {
      case ActivityType.OPERATION_MOBILIZED:
        bucket.mobilized[slot] += 1;
        break;
      case ActivityType.STAGE_ADVANCED:
        bucket.stages[slot] += 1;
        break;
      case ActivityType.BRIEFING_REGISTERED:
        bucket.briefings[slot] += 1;
        break;
      case ActivityType.ORDER_COMPLETED:
        bucket.orders[slot] += 1;
        break;
    }
  }

  return products.map((p) => {
    const b = byProduct.get(p.id) ?? makeBucket();
    return {
      id: p.id,
      name: p.name,
      archetype: p.archetype,
      activeOperations: p._count.operations,
      metrics: {
        mobilized: {
          label: "Mobilizadas",
          current: b.mobilized.current,
          previous: b.mobilized.previous,
        },
        stages: {
          label: "Etapas concluídas",
          current: b.stages.current,
          previous: b.stages.previous,
        },
        briefings: {
          label: "Briefings",
          current: b.briefings.current,
          previous: b.briefings.previous,
        },
        orders: {
          label: "Ordens cumpridas",
          current: b.orders.current,
          previous: b.orders.previous,
        },
      },
    };
  });
}

export async function getProductFunnels() {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    include: {
      stageTemplates: { orderBy: { order: "asc" } },
      operations: {
        where: { status: "ATIVA" },
        include: {
          stages: {
            where: { status: "EM_ANDAMENTO" },
            select: { name: true, order: true },
          },
        },
      },
    },
  });

  return products.map((product) => {
    const stageCounts = product.stageTemplates.map((template) => {
      const count = product.operations.filter((op) =>
        op.stages.some((s) => s.order === template.order),
      ).length;
      return {
        name: template.name,
        order: template.order,
        count,
      };
    });

    // Inclui operações sem etapa em andamento (encerradas internamente)
    const noStage = product.operations.filter(
      (op) => op.stages.length === 0,
    ).length;
    if (noStage > 0) {
      stageCounts.push({
        name: "Sem etapa ativa",
        order: stageCounts.length + 1,
        count: noStage,
      });
    }

    return {
      id: product.id,
      name: product.name,
      archetype: product.archetype,
      total: product.operations.length,
      stages: stageCounts,
    };
  });
}
