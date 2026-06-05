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
  try {
    return await prisma.activityEvent.count({
      where: { type, createdAt: { gte: start, lt: end } },
    });
  } catch {
    return 0;
  }
}

async function dailyCountByType(
  type: ActivityType,
  days: number = 7,
): Promise<number[]> {
  const { start } = dayBoundaries(days);
  try {
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
  } catch {
    return new Array(days).fill(0);
  }
}

export interface KpiSnapshot {
  label: string;
  value: number;
  previous: number;
  sparkline: number[];
  reverseTrend?: boolean;
}

async function dailyCountBetween(
  type: ActivityType,
  start: Date,
  days: number,
): Promise<number[]> {
  const end = new Date(start);
  end.setDate(end.getDate() + days);
  try {
    const events = await prisma.activityEvent.findMany({
      where: { type, createdAt: { gte: start, lt: end } },
      select: { createdAt: true },
    });
    const buckets = new Array(days).fill(0);
    const startMs = start.getTime();
    for (const e of events) {
      const idx = Math.floor((e.createdAt.getTime() - startMs) / MS_DAY);
      if (idx >= 0 && idx < days) buckets[idx] += 1;
    }
    return buckets;
  } catch {
    return new Array(days).fill(0);
  }
}

export interface WeeklyComparisonMetric {
  key: "tasksCompleted" | "briefings" | "newRecruits" | "gapsOpened";
  label: string;
  current: number[];
  previous: number[];
  tone: "bronze" | "patrol";
}

export interface WeeklyComparison {
  metrics: WeeklyComparisonMetric[];
  dayLabels: string[];
}

const DAY_LABELS_PT = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

export async function getWeeklyComparison(): Promise<WeeklyComparison> {
  const { start: weekStart } = dayBoundaries(7);
  const { start: prevWeekStart } = dayBoundaries(14);

  const metricsConfig: Array<{
    key: WeeklyComparisonMetric["key"];
    label: string;
    type: ActivityType;
    tone: "bronze" | "patrol";
  }> = [
    {
      key: "tasksCompleted",
      label: "Ordens cumpridas",
      type: ActivityType.ORDER_COMPLETED,
      tone: "patrol",
    },
    {
      key: "briefings",
      label: "Briefings",
      type: ActivityType.BRIEFING_REGISTERED,
      tone: "bronze",
    },
    {
      key: "newRecruits",
      label: "Novos recrutas",
      type: ActivityType.RECRUIT_CREATED,
      tone: "bronze",
    },
    {
      key: "gapsOpened",
      label: "Gaps detectados",
      type: ActivityType.GAP_CREATED,
      tone: "patrol",
    },
  ];

  const results = await Promise.all(
    metricsConfig.map(async (m) => ({
      key: m.key,
      label: m.label,
      tone: m.tone,
      current: await dailyCountBetween(m.type, weekStart, 7),
      previous: await dailyCountBetween(m.type, prevWeekStart, 7),
    })),
  );

  const labels: string[] = [];
  const cursor = new Date(weekStart);
  for (let i = 0; i < 7; i += 1) {
    labels.push(DAY_LABELS_PT[cursor.getDay()]);
    cursor.setDate(cursor.getDate() + 1);
  }

  return { metrics: results, dayLabels: labels };
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
