import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

const ORDER_SELECT = {
  id: true,
  title: true,
  description: true,
  squadTask: true,
  status: true,
  dueDate: true,
  completedAt: true,
  externalAssignee: true,
  recurring: true,
  createdAt: true,
  assignee: { select: { id: true, name: true, email: true } },
  stage: {
    select: {
      id: true,
      name: true,
      order: true,
      operation: {
        select: {
          id: true,
          codeName: true,
          recruit: { select: { id: true, name: true } },
        },
      },
    },
  },
} satisfies Prisma.OrderSelect;

export async function listMyOrders(userId: string) {
  return prisma.order.findMany({
    where: {
      assigneeId: userId,
      status: { not: "CUMPRIDA" },
    },
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    select: ORDER_SELECT,
  });
}

export async function listOrdersForStage(stageId: string) {
  return prisma.order.findMany({
    where: { operationStageId: stageId },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }],
    select: ORDER_SELECT,
  });
}

export async function listSquadTasks() {
  return prisma.order.findMany({
    where: { squadTask: true, status: { not: "CUMPRIDA" } },
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    select: ORDER_SELECT,
  });
}

export async function listSquadTasksCompleted(limit = 20) {
  return prisma.order.findMany({
    where: { squadTask: true, status: "CUMPRIDA" },
    orderBy: { completedAt: "desc" },
    take: limit,
    select: ORDER_SELECT,
  });
}

export type OrderListItem = Awaited<ReturnType<typeof listMyOrders>>[number];
