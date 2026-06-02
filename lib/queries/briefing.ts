import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

const BRIEFING_SELECT = {
  id: true,
  date: true,
  durationMin: true,
  attendees: true,
  notes: true,
  npsScore: true,
  createdAt: true,
  createdBy: { select: { id: true, name: true, email: true } },
  operation: {
    select: {
      id: true,
      codeName: true,
      recruit: { select: { id: true, name: true } },
    },
  },
} satisfies Prisma.BriefingSelect;

export async function listBriefings(options: { limit?: number } = {}) {
  return prisma.briefing.findMany({
    orderBy: { date: "desc" },
    take: options.limit ?? 50,
    select: BRIEFING_SELECT,
  });
}

export async function listBriefingsForOperation(operationId: string) {
  return prisma.briefing.findMany({
    where: { operationId },
    orderBy: { date: "desc" },
    select: BRIEFING_SELECT,
  });
}

export async function avgNpsMonthly() {
  const result = await prisma.briefing.aggregate({
    where: {
      date: {
        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
      npsScore: { not: null },
    },
    _avg: { npsScore: true },
    _count: { _all: true },
  });
  return {
    avg: result._avg.npsScore ?? null,
    count: result._count._all,
  };
}

export type BriefingItem = Awaited<ReturnType<typeof listBriefings>>[number];
