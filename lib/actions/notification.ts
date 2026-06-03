"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

export async function markAllNotificationsReadAction() {
  const session = await auth();
  if (!session?.user?.id) return { ok: false };
  await prisma.notification.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true },
  });
  revalidatePath("/");
  return { ok: true };
}

export async function markNotificationReadAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false };
  await prisma.notification.update({
    where: { id, userId: session.user.id },
    data: { read: true },
  });
  revalidatePath("/");
  return { ok: true };
}
