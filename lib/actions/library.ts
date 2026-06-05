"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import {
  libraryInputSchema,
  type LibraryInput,
} from "@/lib/schemas/library";

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

async function requireSession() {
  const session = await auth();
  if (!session?.user) throw new Error("Não autorizado");
  return session;
}

function flatten(error: z.ZodError<LibraryInput>): Record<string, string> {
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
    category: String(formData.get("category") ?? "OUTRO"),
    content: String(formData.get("content") ?? ""),
    tags: String(formData.get("tags") ?? ""),
  };
}

function tagsToArray(tagsStr: string | undefined): string[] {
  if (!tagsStr) return [];
  return tagsStr
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length > 0);
}

export async function createLibraryItemAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireSession();
  const parsed = libraryInputSchema.safeParse(parse(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: "Confira os dados e tente de novo.",
      fieldErrors: flatten(parsed.error),
    };
  }
  const created = await prisma.libraryItem.create({
    data: {
      title: parsed.data.title,
      category: parsed.data.category,
      content: parsed.data.content,
      tags: tagsToArray(parsed.data.tags),
      createdById: session.user?.id ?? null,
    },
  });
  revalidatePath("/biblioteca");
  redirect(`/biblioteca/${created.id}?just=created`);
}

export async function updateLibraryItemAction(
  id: string,
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  await requireSession();
  const existing = await prisma.libraryItem.findUnique({
    where: { id },
    select: { source: true },
  });
  if (existing?.source === "DRIVE") {
    return {
      ok: false,
      error: "Itens sincronizados do Drive nao podem ser editados aqui.",
    };
  }
  const parsed = libraryInputSchema.safeParse(parse(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: "Confira os dados e tente de novo.",
      fieldErrors: flatten(parsed.error),
    };
  }
  await prisma.libraryItem.update({
    where: { id },
    data: {
      title: parsed.data.title,
      category: parsed.data.category,
      content: parsed.data.content,
      tags: tagsToArray(parsed.data.tags),
    },
  });
  revalidatePath("/biblioteca");
  revalidatePath(`/biblioteca/${id}`);
  redirect(`/biblioteca/${id}?just=updated`);
}

export async function deleteLibraryItemAction(
  id: string,
): Promise<ActionResult> {
  await requireSession();
  const existing = await prisma.libraryItem.findUnique({
    where: { id },
    select: { source: true },
  });
  if (existing?.source === "DRIVE") {
    return {
      ok: false,
      error: "Itens sincronizados do Drive nao podem ser apagados manualmente.",
    };
  }
  await prisma.libraryItem.delete({ where: { id } });
  revalidatePath("/biblioteca");
  redirect("/biblioteca?just=deleted");
}
