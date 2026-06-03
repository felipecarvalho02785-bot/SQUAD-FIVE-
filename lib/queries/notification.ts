import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

const NOTIFICATION_SELECT = {
  id: true,
  type: true,
  payload: true,
  read: true,
  createdAt: true,
} satisfies Prisma.NotificationSelect;

export async function listNotifications(userId: string, limit = 20) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: NOTIFICATION_SELECT,
  });
}

export async function countUnread(userId: string) {
  return prisma.notification.count({
    where: { userId, read: false },
  });
}

export type NotificationItem = Awaited<
  ReturnType<typeof listNotifications>
>[number];
