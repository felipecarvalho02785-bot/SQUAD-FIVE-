import { ActivityType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

interface LogActivityParams {
  type: ActivityType;
  actorId?: string | null;
  operationId?: string | null;
  recruitId?: string | null;
  payload?: Record<string, unknown>;
  description?: string;
}

/*
  Logger de atividade persistente.
  Fail-silent: nunca quebra a action principal se a inserção falhar.
*/
export async function logActivity(params: LogActivityParams): Promise<void> {
  try {
    await prisma.activityEvent.create({
      data: {
        type: params.type,
        actorId: params.actorId ?? null,
        operationId: params.operationId ?? null,
        recruitId: params.recruitId ?? null,
        payload: (params.payload ?? undefined) as Prisma.InputJsonValue | undefined,
        description: params.description ?? null,
      },
    });
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[Squad5 activity log failed]", err, params);
    }
  }
}

const ACTIVITY_SELECT = {
  id: true,
  type: true,
  payload: true,
  description: true,
  createdAt: true,
  actor: { select: { id: true, name: true, email: true } },
  operation: { select: { id: true, codeName: true } },
  recruit: { select: { id: true, name: true } },
} satisfies Prisma.ActivityEventSelect;

export async function listOperationActivity(operationId: string, limit = 50) {
  return prisma.activityEvent.findMany({
    where: { operationId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: ACTIVITY_SELECT,
  });
}

export async function listRecruitActivity(recruitId: string, limit = 50) {
  return prisma.activityEvent.findMany({
    where: { recruitId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: ACTIVITY_SELECT,
  });
}

export async function listRecentActivity(limit = 20) {
  return prisma.activityEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    select: ACTIVITY_SELECT,
  });
}

export type ActivityEventWithRelations = Awaited<
  ReturnType<typeof listOperationActivity>
>[number];
