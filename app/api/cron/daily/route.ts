import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { detectAllGaps } from "@/lib/domain/gap-detector";
import { sendEmail, EMAIL_TEMPLATES } from "@/lib/observability/email";
import { captureError } from "@/lib/observability/sentry";

/*
  Cron diário — roda 08:00 BRT (11:00 UTC) configurado em vercel.json.
  - Roda detect-all-gaps (cria gaps automáticos novos, resolve os que não aplicam)
  - Envia digest pra owner de cada operação com gaps em aberto criados hoje
  - Envia lembrete pra assignee de ordens com D-day amanhã

  Protegido por header `Authorization: Bearer <CRON_SECRET>`. Vercel já
  injeta esse header automaticamente nas crons configuradas.
*/

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (process.env.CRON_SECRET) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
  }

  try {
    const detectionResult = await detectAllGaps();

    // Lembrete de ordens com D-day amanhã
    const tomorrow = new Date();
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    const ordersDueTomorrow = await prisma.order.findMany({
      where: {
        dueDate: { gte: tomorrow, lt: dayAfter },
        status: { not: "CUMPRIDA" },
        assigneeId: { not: null },
      },
      include: {
        assignee: { select: { id: true, email: true } },
        stage: {
          select: {
            operation: { select: { codeName: true } },
          },
        },
      },
    });

    let emailsSent = 0;
    for (const order of ordersDueTomorrow) {
      if (!order.assignee?.email) continue;
      const template = EMAIL_TEMPLATES.orderAssigned({
        title: order.title,
        operation: order.stage?.operation.codeName,
        dueDate: order.dueDate ? "amanhã" : undefined,
      });
      const result = await sendEmail({
        to: order.assignee.email,
        subject: `[Squad 5] Ordem vence amanhã: ${order.title}`,
        body: template.body,
      });
      if (result.ok) emailsSent += 1;
    }

    return NextResponse.json({
      ok: true,
      detected: detectionResult,
      emailsSent,
      ordersDueTomorrow: ordersDueTomorrow.length,
    });
  } catch (err) {
    captureError(err, { source: "cron-daily" });
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 500 },
    );
  }
}
