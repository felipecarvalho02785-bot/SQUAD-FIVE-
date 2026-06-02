import {
  GapSource,
  GapStatus,
  GapType,
  OperationStatus,
  StageStatus,
} from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

/*
  Detector de gaps automaticos.
  Idempotente: nao duplica gaps abertos pro mesmo tipo+operacao, e
  auto-resolve gaps que nao se aplicam mais.

  Regras implementadas (subset do briefing secao 10.2):
   - TASK_OVERDUE: ordem com due_date < hoje e status != CUMPRIDA
   - STAGE_SLA: etapa em_andamento com dias > sla_days

  Pendentes (Sprint 8+):
   - NO_BRIEFING (requer ciclo esperado por produto)
   - APPROVAL_PENDING (requer status approval_pending em order)
*/

const MS = 1000 * 60 * 60 * 24;

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export interface GapDetectionResult {
  created: number;
  resolved: number;
}

export async function detectAllGaps(now: Date = new Date()): Promise<GapDetectionResult> {
  const activeOperations = await prisma.operation.findMany({
    where: { status: OperationStatus.ATIVA },
    include: {
      stages: {
        orderBy: { order: "asc" },
        include: {
          orders: true,
        },
      },
      gaps: { where: { source: GapSource.AUTOMATIC, status: { not: GapStatus.RESOLVIDO } } },
    },
  });

  let created = 0;
  let resolved = 0;
  const today = startOfDay(now).getTime();

  for (const op of activeOperations) {
    // ---- Regra 1: STAGE_SLA estourado ----
    const currentStage = op.stages.find(
      (s) => s.status === StageStatus.EM_ANDAMENTO,
    );
    const slaExceeded =
      currentStage !== undefined &&
      currentStage.startedAt !== null &&
      Math.floor((today - startOfDay(currentStage.startedAt).getTime()) / MS) >
        currentStage.slaDays;

    const slaGap = op.gaps.find((g) => g.type === GapType.STAGE_SLA);
    if (slaExceeded && !slaGap && currentStage) {
      await prisma.gap.create({
        data: {
          operationId: op.id,
          source: GapSource.AUTOMATIC,
          type: GapType.STAGE_SLA,
          description: `SLA estourado na etapa "${currentStage.name}".`,
          status: GapStatus.ABERTO,
        },
      });
      created += 1;
    } else if (!slaExceeded && slaGap) {
      await prisma.gap.update({
        where: { id: slaGap.id },
        data: { status: GapStatus.RESOLVIDO, resolvedAt: now },
      });
      resolved += 1;
    }

    // ---- Regra 2: TASK_OVERDUE ----
    const overdueOrders = op.stages
      .flatMap((s) => s.orders)
      .filter(
        (o) =>
          o.dueDate !== null &&
          o.status !== "CUMPRIDA" &&
          o.dueDate.getTime() < today,
      );
    const overdueGap = op.gaps.find((g) => g.type === GapType.TASK_OVERDUE);
    if (overdueOrders.length > 0 && !overdueGap) {
      await prisma.gap.create({
        data: {
          operationId: op.id,
          source: GapSource.AUTOMATIC,
          type: GapType.TASK_OVERDUE,
          description: `${overdueOrders.length} ordem(ns) atrasada(s).`,
          status: GapStatus.ABERTO,
        },
      });
      created += 1;
    } else if (overdueOrders.length === 0 && overdueGap) {
      await prisma.gap.update({
        where: { id: overdueGap.id },
        data: { status: GapStatus.RESOLVIDO, resolvedAt: now },
      });
      resolved += 1;
    }
  }

  return { created, resolved };
}
