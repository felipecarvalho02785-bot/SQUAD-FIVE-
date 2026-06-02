"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { z } from "zod";
import { OrderStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { orderInputSchema, type OrderInput } from "@/lib/schemas/order";

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

async function requireSession() {
  const session = await auth();
  if (!session?.user) throw new Error("Não autorizado");
  return session;
}

function flatten(error: z.ZodError<OrderInput>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

function parse(formData: FormData) {
  return {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    operationStageId: String(formData.get("operationStageId") ?? ""),
    squadTask: formData.get("squadTask")
      ? String(formData.get("squadTask"))
      : undefined,
    assigneeId: String(formData.get("assigneeId") ?? ""),
    externalAssignee: String(formData.get("externalAssignee") ?? ""),
    dueDate: String(formData.get("dueDate") ?? ""),
    status: (formData.get("status") as OrderStatus) ?? OrderStatus.A_FAZER,
  };
}

async function revalidateOrderContext(opId?: string | null) {
  revalidatePath("/ordens");
  revalidatePath("/comando");
  revalidatePath("/pelotao");
  revalidatePath("/squad-tasks");
  if (opId) revalidatePath(`/operacoes/${opId}`);
}

export async function createOrderAction(
  redirectTo: string,
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  await requireSession();
  const parsed = orderInputSchema.safeParse(parse(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: "Confira os dados e tente de novo.",
      fieldErrors: flatten(parsed.error),
    };
  }

  const data = parsed.data;
  const created = await prisma.order.create({
    data: {
      title: data.title,
      description: data.description ?? null,
      operationStageId: data.squadTask ? null : (data.operationStageId ?? null),
      squadTask: Boolean(data.squadTask),
      assigneeId: data.assigneeId ?? null,
      externalAssignee: data.externalAssignee ?? null,
      dueDate: data.dueDate ?? null,
      status: data.status,
    },
    include: {
      stage: { select: { operationId: true } },
    },
  });

  await revalidateOrderContext(created.stage?.operationId);
  redirect(`${redirectTo}?just=order-created`);
}

export async function updateOrderStatusAction(
  orderId: string,
  status: OrderStatus,
  redirectTo: string,
): Promise<ActionResult> {
  await requireSession();

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: {
      status,
      completedAt: status === OrderStatus.CUMPRIDA ? new Date() : null,
    },
    include: { stage: { select: { operationId: true } } },
  });

  await revalidateOrderContext(updated.stage?.operationId);
  redirect(redirectTo);
}

export async function deleteOrderAction(
  orderId: string,
  redirectTo: string,
): Promise<ActionResult> {
  await requireSession();
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { stage: { select: { operationId: true } } },
  });
  if (!order) return { ok: false, error: "Ordem não encontrada." };
  await prisma.order.delete({ where: { id: orderId } });
  await revalidateOrderContext(order.stage?.operationId);
  redirect(`${redirectTo}?just=order-deleted`);
}
