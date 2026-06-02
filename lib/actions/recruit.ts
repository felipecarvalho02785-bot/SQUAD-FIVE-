"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { z } from "zod";
import { Prisma, RecruitStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { recruitInputSchema, type RecruitInput } from "@/lib/schemas/recruit";

/*
  Server Actions de Recruta — CRUD basico.
  Padrao: validar com Zod, executar, revalidar cache, redirecionar/retornar.
*/

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

function flattenZodError(error: z.ZodError<RecruitInput>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (!out[key]) {
      out[key] = issue.message;
    }
  }
  return out;
}

function parseFormData(formData: FormData) {
  return {
    name: formData.get("name") ?? "",
    contactName: formData.get("contactName") ?? "",
    contactEmail: formData.get("contactEmail") ?? "",
    contactPhone: formData.get("contactPhone") ?? "",
    segment: formData.get("segment") ?? "",
    campaignBudget: formData.get("campaignBudget") ?? "",
    theses: formData.get("theses") ?? "",
    notes: formData.get("notes") ?? "",
    status: formData.get("status") ?? RecruitStatus.ATIVO,
  };
}

function toPrismaCreate(
  data: RecruitInput,
): Prisma.RecruitUncheckedCreateInput {
  return {
    name: data.name,
    contactName: data.contactName ?? null,
    contactEmail: data.contactEmail ?? null,
    contactPhone: data.contactPhone ?? null,
    segment: data.segment ?? null,
    campaignBudget:
      data.campaignBudget !== undefined
        ? new Prisma.Decimal(data.campaignBudget)
        : null,
    theses: data.theses ?? null,
    notes: data.notes ?? null,
    status: data.status,
  };
}

export async function createRecruitAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  await requireSession();

  const parsed = recruitInputSchema.safeParse(parseFormData(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: "Confira os dados e tente de novo.",
      fieldErrors: flattenZodError(parsed.error),
    };
  }

  const recruit = await prisma.recruit.create({
    data: toPrismaCreate(parsed.data),
    select: { id: true },
  });

  revalidatePath("/recrutas");
  revalidatePath("/comando");
  redirect(`/recrutas/${recruit.id}?just=created`);
}

export async function updateRecruitAction(
  id: string,
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  await requireSession();

  const parsed = recruitInputSchema.safeParse(parseFormData(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: "Confira os dados e tente de novo.",
      fieldErrors: flattenZodError(parsed.error),
    };
  }

  await prisma.recruit.update({
    where: { id },
    data: toPrismaCreate(parsed.data),
  });

  revalidatePath("/recrutas");
  revalidatePath(`/recrutas/${id}`);
  revalidatePath("/comando");
  redirect(`/recrutas/${id}?just=updated`);
}

export async function markRecruitBaixaAction(id: string): Promise<ActionResult> {
  await requireSession();

  await prisma.recruit.update({
    where: { id },
    data: { status: RecruitStatus.BAIXA },
  });

  revalidatePath("/recrutas");
  revalidatePath(`/recrutas/${id}`);
  revalidatePath("/comando");
  redirect(`/recrutas/${id}?just=baixa`);
}

export async function reactivateRecruitAction(id: string): Promise<ActionResult> {
  await requireSession();

  await prisma.recruit.update({
    where: { id },
    data: { status: RecruitStatus.ATIVO },
  });

  revalidatePath("/recrutas");
  revalidatePath(`/recrutas/${id}`);
  revalidatePath("/comando");
  redirect(`/recrutas/${id}?just=reactivated`);
}
