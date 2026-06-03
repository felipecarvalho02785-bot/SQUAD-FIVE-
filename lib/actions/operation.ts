"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { z } from "zod";
import { ActivityType, OperationStatus, StageStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import {
  operationInputSchema,
  type OperationInput,
} from "@/lib/schemas/operation";
import { notifyOperationRisk } from "@/lib/domain/notification-emitter";
import { logActivity } from "@/lib/domain/activity-logger";

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

async function requireSession() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Não autorizado");
  }
  return session;
}

function flatten(error: z.ZodError<OperationInput>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

function parse(formData: FormData) {
  return {
    recruitId: String(formData.get("recruitId") ?? ""),
    productId: String(formData.get("productId") ?? ""),
    codeName: String(formData.get("codeName") ?? ""),
    ownerId: String(formData.get("ownerId") ?? ""),
    startedAt: String(formData.get("startedAt") ?? ""),
    targetEndAt: String(formData.get("targetEndAt") ?? ""),
  };
}

export async function createOperationAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  await requireSession();

  const parsed = operationInputSchema.safeParse(parse(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: "Confira os dados e tente de novo.",
      fieldErrors: flatten(parsed.error),
    };
  }

  const data = parsed.data;

  // Verifica produto + carrega templates
  const product = await prisma.product.findUnique({
    where: { id: data.productId },
    include: { stageTemplates: { orderBy: { order: "asc" } } },
  });
  if (!product) {
    return { ok: false, error: "Produto não encontrado." };
  }

  // Cria operacao + copia templates em transacao
  const startedAt = data.startedAt ?? new Date();
  const operation = await prisma.$transaction(async (tx) => {
    const op = await tx.operation.create({
      data: {
        recruitId: data.recruitId,
        productId: data.productId,
        codeName: data.codeName,
        ownerId: data.ownerId ?? null,
        startedAt,
        targetEndAt: data.targetEndAt ?? null,
        status: OperationStatus.ATIVA,
      },
    });

    if (product.stageTemplates.length > 0) {
      await tx.operationStage.createMany({
        data: product.stageTemplates.map((t, i) => ({
          operationId: op.id,
          templateId: t.id,
          name: t.name,
          order: t.order,
          slaDays: t.slaDays,
          status: i === 0 ? StageStatus.EM_ANDAMENTO : StageStatus.PENDENTE,
          startedAt: i === 0 ? startedAt : null,
        })),
      });
    }

    return op;
  });

  const session = await auth();
  await logActivity({
    type: ActivityType.OPERATION_MOBILIZED,
    actorId: session?.user?.id ?? null,
    operationId: operation.id,
    recruitId: data.recruitId,
    description: `Operação "${data.codeName}" mobilizada (${product.name}).`,
    payload: { productId: data.productId, codeName: data.codeName },
  });

  revalidatePath("/operacoes");
  revalidatePath(`/recrutas/${data.recruitId}`);
  revalidatePath("/comando");
  redirect(`/operacoes/${operation.id}?just=mobilized`);
}

export async function advanceStageAction(
  operationId: string,
  stageId: string,
): Promise<ActionResult> {
  await requireSession();

  const op = await prisma.operation.findUnique({
    where: { id: operationId },
    include: { stages: { orderBy: { order: "asc" } } },
  });
  if (!op) return { ok: false, error: "Operação não encontrada." };

  const stage = op.stages.find((s) => s.id === stageId);
  if (!stage) return { ok: false, error: "Etapa não encontrada." };
  if (stage.status === StageStatus.CUMPRIDA) {
    return { ok: false, error: "Etapa já está cumprida." };
  }

  const next = op.stages.find((s) => s.order > stage.order);
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.operationStage.update({
      where: { id: stage.id },
      data: {
        status: StageStatus.CUMPRIDA,
        completedAt: now,
      },
    });

    if (next) {
      await tx.operationStage.update({
        where: { id: next.id },
        data: {
          status: StageStatus.EM_ANDAMENTO,
          startedAt: now,
        },
      });
    } else {
      // Sem proxima etapa: encerra a operacao.
      await tx.operation.update({
        where: { id: operationId },
        data: {
          status: OperationStatus.ENCERRADA,
          endedAt: now,
        },
      });
    }
  });

  const session = await auth();

  await logActivity({
    type: ActivityType.STAGE_ADVANCED,
    actorId: session?.user?.id ?? null,
    operationId,
    description: `Etapa "${stage.name}" cumprida${next ? `, próxima "${next.name}" iniciada` : ", operação encerrada"}.`,
    payload: { stageId: stage.id, stageName: stage.name, completed: !next },
  });

  if (!next) {
    await logActivity({
      type: ActivityType.OPERATION_EXTRACTED,
      actorId: session?.user?.id ?? null,
      operationId,
      description: "Operação encerrada após cumprir todas as etapas.",
    });
  }

  // Notifica owner se houve transição relevante
  if (op.ownerId) {
    if (!next) {
      await notifyOperationRisk({
        operationId,
        ownerId: op.ownerId,
        reason: "Operação encerrada — última etapa cumprida.",
      });
    }
  }

  revalidatePath("/operacoes");
  revalidatePath(`/operacoes/${operationId}`);
  revalidatePath("/comando");
  redirect(`/operacoes/${operationId}?just=advanced${!next ? "&completed=true" : ""}`);
}

export async function pauseOperationAction(
  operationId: string,
): Promise<ActionResult> {
  const session = await requireSession();
  await prisma.operation.update({
    where: { id: operationId },
    data: { status: OperationStatus.PAUSADA },
  });
  await logActivity({
    type: ActivityType.OPERATION_PAUSED,
    actorId: session.user?.id ?? null,
    operationId,
    description: "Operação pausada.",
  });
  revalidatePath("/operacoes");
  revalidatePath(`/operacoes/${operationId}`);
  revalidatePath("/comando");
  redirect(`/operacoes/${operationId}?just=paused`);
}

export async function resumeOperationAction(
  operationId: string,
): Promise<ActionResult> {
  const session = await requireSession();
  await prisma.operation.update({
    where: { id: operationId },
    data: { status: OperationStatus.ATIVA },
  });
  await logActivity({
    type: ActivityType.OPERATION_RESUMED,
    actorId: session.user?.id ?? null,
    operationId,
    description: "Operação retomada.",
  });
  revalidatePath("/operacoes");
  revalidatePath(`/operacoes/${operationId}`);
  revalidatePath("/comando");
  redirect(`/operacoes/${operationId}?just=resumed`);
}

export async function extractOperationAction(
  operationId: string,
): Promise<ActionResult> {
  const session = await requireSession();
  await prisma.operation.update({
    where: { id: operationId },
    data: {
      status: OperationStatus.ENCERRADA,
      endedAt: new Date(),
    },
  });
  await logActivity({
    type: ActivityType.OPERATION_EXTRACTED,
    actorId: session.user?.id ?? null,
    operationId,
    description: "Operação encerrada manualmente (extração).",
  });
  revalidatePath("/operacoes");
  revalidatePath(`/operacoes/${operationId}`);
  revalidatePath("/comando");
  redirect(`/operacoes/${operationId}?just=extracted`);
}

