"use server";

import { revalidatePath } from "next/cache";
import { ActivityType, GapSource, GapStatus, GapType } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { logActivity } from "@/lib/domain/activity-logger";

export interface GapActionResult {
  ok: boolean;
  error?: string;
}

async function requireSession() {
  const session = await auth();
  if (!session?.user) throw new Error("Não autorizado");
  return session;
}

export async function createManualGapAction(
  operationId: string,
  description: string,
): Promise<GapActionResult> {
  const session = await requireSession();
  const trimmed = description.trim();
  if (trimmed.length < 5) {
    return {
      ok: false,
      error: "Descrição precisa ter no mínimo 5 caracteres.",
    };
  }
  await prisma.gap.create({
    data: {
      operationId,
      source: GapSource.MANUAL,
      type: GapType.MANUAL,
      description: trimmed,
      status: GapStatus.ABERTO,
      createdById: session.user?.id ?? null,
    },
  });
  await logActivity({
    type: ActivityType.GAP_CREATED,
    actorId: session.user?.id ?? null,
    operationId,
    description: `Gap registrado: "${trimmed.slice(0, 100)}".`,
  });
  revalidatePath(`/operacoes/${operationId}`);
  revalidatePath("/comando");
  return { ok: true };
}

export async function resolveGapAction(
  gapId: string,
  operationId: string,
): Promise<GapActionResult> {
  const session = await requireSession();
  await prisma.gap.update({
    where: { id: gapId },
    data: {
      status: GapStatus.RESOLVIDO,
      resolvedAt: new Date(),
    },
  });
  await logActivity({
    type: ActivityType.GAP_RESOLVED,
    actorId: session.user?.id ?? null,
    operationId,
    description: "Gap resolvido.",
    payload: { gapId },
  });
  revalidatePath(`/operacoes/${operationId}`);
  revalidatePath("/comando");
  return { ok: true };
}

export async function setGapInTreatmentAction(
  gapId: string,
  operationId: string,
): Promise<GapActionResult> {
  await requireSession();
  await prisma.gap.update({
    where: { id: gapId },
    data: { status: GapStatus.EM_TRATAMENTO },
  });
  revalidatePath(`/operacoes/${operationId}`);
  return { ok: true };
}
