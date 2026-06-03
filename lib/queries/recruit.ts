import { Prisma, RecruitStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { RecruitFilter } from "@/lib/schemas/recruit";

export type RecruitSort = "recent" | "oldest" | "name" | "name-desc";

export async function listRecruits(
  filter: RecruitFilter = { status: "all" },
  sort: RecruitSort = "recent",
) {
  const where: Prisma.RecruitWhereInput = {};

  if (filter.q && filter.q.trim()) {
    where.OR = [
      { name: { contains: filter.q, mode: "insensitive" } },
      { contactName: { contains: filter.q, mode: "insensitive" } },
      { contactEmail: { contains: filter.q, mode: "insensitive" } },
      { segment: { contains: filter.q, mode: "insensitive" } },
    ];
  }

  if (filter.status && filter.status !== "all") {
    where.status = filter.status;
  }

  const orderBy: Prisma.RecruitOrderByWithRelationInput =
    sort === "oldest"
      ? { createdAt: "asc" }
      : sort === "name"
        ? { name: "asc" }
        : sort === "name-desc"
          ? { name: "desc" }
          : { createdAt: "desc" };

  return prisma.recruit.findMany({
    where,
    orderBy: [orderBy],
    select: {
      id: true,
      name: true,
      contactName: true,
      contactEmail: true,
      contactPhone: true,
      segment: true,
      campaignBudget: true,
      status: true,
      createdAt: true,
      _count: { select: { operations: true } },
    },
  });
}

export type RecruitListItem = Awaited<ReturnType<typeof listRecruits>>[number];

export async function getRecruitById(id: string) {
  return prisma.recruit.findUnique({
    where: { id },
    include: {
      operations: {
        orderBy: { startedAt: "desc" },
        include: {
          product: { select: { id: true, name: true, archetype: true } },
        },
      },
    },
  });
}

export async function getRecruitRichDetails(id: string) {
  const [recruit, briefings] = await Promise.all([
    getRecruitById(id),
    prisma.briefing.findMany({
      where: { operation: { recruitId: id } },
      orderBy: { date: "desc" },
      take: 20,
      select: {
        id: true,
        date: true,
        npsScore: true,
        operation: { select: { id: true, codeName: true } },
      },
    }),
  ]);

  if (!recruit) return null;

  const npsScored = briefings.filter((b) => b.npsScore !== null);
  const avgNps =
    npsScored.length > 0
      ? npsScored.reduce((acc, b) => acc + (b.npsScore ?? 0), 0) /
        npsScored.length
      : null;

  const now = Date.now();
  const upcomingBriefings = briefings.filter((b) => b.date.getTime() > now);
  const nextBriefing = upcomingBriefings[upcomingBriefings.length - 1] ?? null;
  const lastBriefing = briefings.find((b) => b.date.getTime() <= now) ?? null;

  return {
    recruit,
    briefings,
    avgNps,
    npsCount: npsScored.length,
    nextBriefing,
    lastBriefing,
  };
}

export async function countRecruitsByStatus() {
  const grouped = await prisma.recruit.groupBy({
    by: ["status"],
    _count: { _all: true },
  });

  const map: Record<RecruitStatus, number> = {
    ATIVO: 0,
    PAUSADO: 0,
    BAIXA: 0,
  };
  for (const row of grouped) {
    map[row.status] = row._count._all;
  }
  return {
    ...map,
    total: map.ATIVO + map.PAUSADO + map.BAIXA,
  };
}
