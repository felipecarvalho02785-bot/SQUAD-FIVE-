import { ActivityType } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

/*
  Computa KPIs com série histórica (sparkline) e comparação com período
  anterior (trend). Usa activity_events como fonte da série temporal.
*/

const MS_DAY = 1000 * 60 * 60 * 24;

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function dayBoundaries(daysBack: number): { start: Date; end: Date } {
  const end = startOfDay(new Date());
  end.setDate(end.getDate() + 1);
  const start = new Date(end);
  start.setDate(start.getDate() - daysBack);
  return { start, end };
}

async function countActivityByType(
  type: ActivityType,
  start: Date,
  end: Date,
): Promise<number> {
  return prisma.activityEvent.count({
    where: { type, createdAt: { gte: start, lt: end } },
  });
}

async function dailyCountByType(
  type: ActivityType,
  days: number = 7,
): Promise<number[]> {
  const { start } = dayBoundaries(days);
  const events = await prisma.activityEvent.findMany({
    where: { type, createdAt: { gte: start } },
    select: { createdAt: true },
  });

  const buckets = new Array(days).fill(0);
  const startMs = start.getTime();
  for (const e of events) {
    const idx = Math.floor((e.createdAt.getTime() - startMs) / MS_DAY);
    if (idx >= 0 && idx < days) buckets[idx] += 1;
  }
  return buckets;
}

export interface KpiSnapshot {
  label: string;
  value: number;
  previous: number;
  sparkline: number[];
  reverseTrend?: boolean;
}

export async function getKpisWithTrends(): Promise<{
  tasksCompleted: KpiSnapshot;
  briefings: KpiSnapshot;
  newRecruits: KpiSnapshot;
  gapsOpened: KpiSnapshot;
}> {
  const { start: weekStart, end: weekEnd } = dayBoundaries(7);
  const { start: prevWeekStart } = dayBoundaries(14);

  const [
    tasksCurrent,
    tasksPrev,
    tasksSpark,
    briefingsCurrent,
    briefingsPrev,
    briefingsSpark,
    recruitsCurrent,
    recruitsPrev,
    recruitsSpark,
    gapsCurrent,
    gapsPrev,
    gapsSpark,
  ] = await Promise.all([
    countActivityByType(ActivityType.ORDER_COMPLETED, weekStart, weekEnd),
    countActivityByType(ActivityType.ORDER_COMPLETED, prevWeekStart, weekStart),
    dailyCountByType(ActivityType.ORDER_COMPLETED, 7),
    countActivityByType(ActivityType.BRIEFING_REGISTERED, weekStart, weekEnd),
    countActivityByType(
      ActivityType.BRIEFING_REGISTERED,
      prevWeekStart,
      weekStart,
    ),
    dailyCountByType(ActivityType.BRIEFING_REGISTERED, 7),
    countActivityByType(ActivityType.RECRUIT_CREATED, weekStart, weekEnd),
    countActivityByType(ActivityType.RECRUIT_CREATED, prevWeekStart, weekStart),
    dailyCountByType(ActivityType.RECRUIT_CREATED, 7),
    countActivityByType(ActivityType.GAP_CREATED, weekStart, weekEnd),
    countActivityByType(ActivityType.GAP_CREATED, prevWeekStart, weekStart),
    dailyCountByType(ActivityType.GAP_CREATED, 7),
  ]);

  return {
    tasksCompleted: {
      label: "Ordens cumpridas",
      value: tasksCurrent,
      previous: tasksPrev,
      sparkline: tasksSpark,
    },
    briefings: {
      label: "Briefings registrados",
      value: briefingsCurrent,
      previous: briefingsPrev,
      sparkline: briefingsSpark,
    },
    newRecruits: {
      label: "Novos recrutas",
      value: recruitsCurrent,
      previous: recruitsPrev,
      sparkline: recruitsSpark,
    },
    gapsOpened: {
      label: "Gaps detectados",
      value: gapsCurrent,
      previous: gapsPrev,
      sparkline: gapsSpark,
      reverseTrend: true,
    },
  };
}
