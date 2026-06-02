"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import {
  stageTemplateUpdateSchema,
  stageTemplateCreateSchema,
} from "@/lib/schemas/template";

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string };

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Não autorizado");
  if (session.user.role !== UserRole.ADMIN) {
    throw new Error("Apenas comandantes podem alterar templates.");
  }
  return session;
}

export async function updateStageTemplateAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = stageTemplateUpdateSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    slaDays: formData.get("slaDays"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error:
        parsed.error.issues[0]?.message ?? "Confira os dados e tente de novo.",
    };
  }
  await prisma.stageTemplate.update({
    where: { id: parsed.data.id },
    data: { name: parsed.data.name, slaDays: parsed.data.slaDays },
  });
  revalidatePath("/quartel");
  redirect("/quartel?just=template-updated");
}

export async function createStageTemplateAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = stageTemplateCreateSchema.safeParse({
    productId: formData.get("productId"),
    name: formData.get("name"),
    slaDays: formData.get("slaDays"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error:
        parsed.error.issues[0]?.message ?? "Confira os dados e tente de novo.",
    };
  }
  const last = await prisma.stageTemplate.findFirst({
    where: { productId: parsed.data.productId },
    orderBy: { order: "desc" },
  });
  await prisma.stageTemplate.create({
    data: {
      productId: parsed.data.productId,
      name: parsed.data.name,
      slaDays: parsed.data.slaDays,
      order: (last?.order ?? 0) + 1,
    },
  });
  revalidatePath("/quartel");
  redirect("/quartel?just=template-created");
}

export async function deleteStageTemplateAction(
  id: string,
): Promise<ActionResult> {
  await requireAdmin();
  await prisma.stageTemplate.delete({ where: { id } });
  revalidatePath("/quartel");
  redirect("/quartel?just=template-deleted");
}

export async function updateMemberRoleAction(
  userId: string,
  nextRole: UserRole,
): Promise<ActionResult> {
  const session = await requireAdmin();
  if (session.user?.id === userId && nextRole === UserRole.OPERATOR) {
    return {
      ok: false,
      error: "Você não pode rebaixar a si mesmo. Peça pra outro admin.",
    };
  }
  await prisma.user.update({
    where: { id: userId },
    data: { role: nextRole },
  });
  revalidatePath("/quartel");
  redirect("/quartel?just=member-updated");
}
