"use server";

import { revalidatePath } from "next/cache";
import { randomBytes } from "node:crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

export type ShareActionResult =
  | { ok: true; token: string | null }
  | { ok: false; error: string };

async function requireSession() {
  const session = await auth();
  if (!session?.user) throw new Error("Não autorizado");
  return session;
}

function generateToken(): string {
  return randomBytes(18).toString("base64url");
}

export async function enableOperationShareAction(
  operationId: string,
): Promise<ShareActionResult> {
  await requireSession();
  const token = generateToken();
  try {
    await prisma.operation.update({
      where: { id: operationId },
      data: { shareToken: token },
    });
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
  revalidatePath(`/operacoes/${operationId}`);
  return { ok: true, token };
}

export async function disableOperationShareAction(
  operationId: string,
): Promise<ShareActionResult> {
  await requireSession();
  try {
    await prisma.operation.update({
      where: { id: operationId },
      data: { shareToken: null },
    });
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
  revalidatePath(`/operacoes/${operationId}`);
  return { ok: true, token: null };
}
