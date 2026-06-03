import {
  NotificationType,
  OperationStatus,
  Prisma,
} from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

/*
  Helpers que disparam notificações como side-effect das ações.
  Mantemos a criação idempotente quando possível e silenciosa em erros
  (uma falha em criar notification nunca deve quebrar a ação principal).
*/

async function safeCreate(data: Prisma.NotificationCreateInput) {
  try {
    await prisma.notification.create({ data });
  } catch {
    // silent
  }
}

export async function notifyOrderAssigned(params: {
  orderId: string;
  assigneeId: string;
  assignedByUserId: string | null;
  title: string;
}) {
  if (params.assigneeId === params.assignedByUserId) return;
  await safeCreate({
    user: { connect: { id: params.assigneeId } },
    type: NotificationType.ORDER_ASSIGNED,
    payload: {
      orderId: params.orderId,
      title: params.title,
    },
  });
}

export async function notifyOperationRisk(params: {
  operationId: string;
  ownerId: string | null;
  reason: string;
}) {
  if (!params.ownerId) return;
  await safeCreate({
    user: { connect: { id: params.ownerId } },
    type: NotificationType.OPERATION_RISK,
    payload: {
      operationId: params.operationId,
      reason: params.reason,
    },
  });
}

export async function notifyGapOpen(params: {
  operationId: string;
  ownerId: string | null;
  description: string;
}) {
  if (!params.ownerId) return;
  await safeCreate({
    user: { connect: { id: params.ownerId } },
    type: NotificationType.GAP_OPEN,
    payload: {
      operationId: params.operationId,
      description: params.description,
    },
  });
}

export async function notifyBriefingSoon(params: {
  briefingId: string;
  operationId: string;
  ownerId: string | null;
}) {
  if (!params.ownerId) return;
  await safeCreate({
    user: { connect: { id: params.ownerId } },
    type: NotificationType.BRIEFING_SOON,
    payload: {
      briefingId: params.briefingId,
      operationId: params.operationId,
    },
  });
}

export async function notifyOrderDue(params: {
  orderId: string;
  assigneeId: string;
  title: string;
}) {
  await safeCreate({
    user: { connect: { id: params.assigneeId } },
    type: NotificationType.ORDER_DUE,
    payload: {
      orderId: params.orderId,
      title: params.title,
    },
  });
}

/**
 * Marca operação como em risco se status mudou pra ENCERRADA ou se
 * o caller indicou via flag.
 */
export function inferRiskReason(prevStatus: OperationStatus | null, nextStatus: OperationStatus): string | null {
  if (prevStatus === OperationStatus.ATIVA && nextStatus === OperationStatus.PAUSADA) {
    return "Operação foi pausada.";
  }
  if (prevStatus !== OperationStatus.ENCERRADA && nextStatus === OperationStatus.ENCERRADA) {
    return "Operação foi encerrada.";
  }
  return null;
}
