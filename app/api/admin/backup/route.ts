import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

/*
  Backup JSON completo das tabelas de domínio.
  Apenas admin. Pode ser restaurado via script de seed customizado.
*/

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Não autorizado", { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return new NextResponse("Apenas comandantes", { status: 403 });
  }

  const [
    users,
    recruits,
    products,
    stageTemplates,
    operations,
    operationStages,
    orders,
    briefings,
    gaps,
    libraryItems,
    activityEvents,
    notifications,
  ] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    }),
    prisma.recruit.findMany(),
    prisma.product.findMany(),
    prisma.stageTemplate.findMany(),
    prisma.operation.findMany(),
    prisma.operationStage.findMany(),
    prisma.order.findMany(),
    prisma.briefing.findMany(),
    prisma.gap.findMany(),
    prisma.libraryItem.findMany().catch(() => []),
    prisma.activityEvent.findMany().catch(() => []),
    prisma.notification.findMany().catch(() => []),
  ]);

  const payload = {
    meta: {
      generatedAt: new Date().toISOString(),
      generatedBy: session.user.email,
      version: 1,
      counts: {
        users: users.length,
        recruits: recruits.length,
        products: products.length,
        stageTemplates: stageTemplates.length,
        operations: operations.length,
        operationStages: operationStages.length,
        orders: orders.length,
        briefings: briefings.length,
        gaps: gaps.length,
        libraryItems: libraryItems.length,
        activityEvents: activityEvents.length,
        notifications: notifications.length,
      },
    },
    users,
    recruits,
    products,
    stageTemplates,
    operations,
    operationStages,
    orders,
    briefings,
    gaps,
    libraryItems,
    activityEvents,
    notifications,
  };

  const today = new Date().toISOString().slice(0, 10);
  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="squad-five-backup-${today}.json"`,
    },
  });
}
