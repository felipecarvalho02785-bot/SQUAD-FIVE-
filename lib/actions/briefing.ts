"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { z } from "zod";
import { ActivityType } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import {
  briefingInputSchema,
  type BriefingInput,
} from "@/lib/schemas/briefing";
import { notifyBriefingSoon } from "@/lib/domain/notification-emitter";
import { logActivity } from "@/lib/domain/activity-logger";

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

async function requireSession() {
  const session = await auth();
  if (!session?.user) throw new Error("Não autorizado");
  return session;
}

function flatten(error: z.ZodError<BriefingInput>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

function parse(formData: FormData) {
  return {
    operationId: String(formData.get("operationId") ?? ""),
    date: String(formData.get("date") ?? ""),
    durationMin: String(formData.get("durationMin") ?? ""),
    attendees: String(formData.get("attendees") ?? ""),
    notes: String(formData.get("notes") ?? ""),
    npsScore: String(formData.get("npsScore") ?? ""),
  };
}

export async function createBriefingAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireSession();
  const parsed = briefingInputSchema.safeParse(parse(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: "Confira os dados e tente de novo.",
      fieldErrors: flatten(parsed.error),
    };
  }
  const data = parsed.data;
  const created = await prisma.briefing.create({
    data: {
      operationId: data.operationId,
      date: data.date,
      durationMin: data.durationMin ?? null,
      attendees: data.attendees ? { raw: data.attendees } : undefined,
      notes: data.notes ?? null,
      npsScore: data.npsScore ?? null,
      createdById: session.user?.id ?? null,
    },
  });

  await logActivity({
    type: ActivityType.BRIEFING_REGISTERED,
    actorId: session.user?.id ?? null,
    operationId: data.operationId,
    description: `Briefing registrado${data.npsScore !== undefined ? ` (NPS ${data.npsScore})` : ""}.`,
    payload: { briefingId: created.id, npsScore: data.npsScore },
  });

  // Notifica owner da operação sobre briefing próximo (se for futuro)
  const operation = await prisma.operation.findUnique({
    where: { id: data.operationId },
    select: { ownerId: true },
  });
  if (operation?.ownerId && data.date.getTime() > Date.now()) {
    await notifyBriefingSoon({
      briefingId: created.id,
      operationId: data.operationId,
      ownerId: operation.ownerId,
    });
  }

  revalidatePath("/briefings");
  revalidatePath("/comando");
  revalidatePath(`/operacoes/${data.operationId}`);
  redirect(
    `/operacoes/${data.operationId}?just=briefing-registered&briefingId=${created.id}`,
  );
}
