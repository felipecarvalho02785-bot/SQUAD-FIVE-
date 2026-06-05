"use server";

import { revalidatePath } from "next/cache";
import { SavedFilterScope } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { normalizeFilterParams } from "@/lib/saved-filter-utils";

/*
  Actions de filtros salvos por usuário no /operacoes e /recrutas.
  Cada filtro guarda a querystring (sem o "?") + um nome curto.
*/

export type SavedFilterActionResult =
  | { ok: true }
  | { ok: false; error: string };

const MAX_NAME = 40;
const MAX_PARAMS = 500;
const MAX_PER_SCOPE = 12;

async function requireUserId(): Promise<string> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Não autorizado");
  return userId;
}

function pathForScope(scope: SavedFilterScope): string {
  return scope === SavedFilterScope.OPERATIONS ? "/operacoes" : "/recrutas";
}

export async function saveFilterAction(
  scope: SavedFilterScope,
  name: string,
  params: string,
): Promise<SavedFilterActionResult> {
  const cleanName = name.trim().slice(0, MAX_NAME);
  if (!cleanName) return { ok: false, error: "Dê um nome ao filtro." };

  const cleanParams = normalizeFilterParams(params).slice(0, MAX_PARAMS);
  if (!cleanParams) {
    return { ok: false, error: "Nenhum filtro ativo para salvar." };
  }

  let userId: string;
  try {
    userId = await requireUserId();
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }

  try {
    const total = await prisma.savedFilter.count({
      where: { userId, scope },
    });
    if (total >= MAX_PER_SCOPE) {
      return {
        ok: false,
        error: `Máximo de ${MAX_PER_SCOPE} filtros salvos por seção.`,
      };
    }

    await prisma.savedFilter.create({
      data: { userId, scope, name: cleanName, params: cleanParams },
    });
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }

  revalidatePath(pathForScope(scope));
  return { ok: true };
}

export async function deleteFilterAction(
  id: string,
): Promise<SavedFilterActionResult> {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }

  try {
    const existing = await prisma.savedFilter.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return { ok: false, error: "Filtro não encontrado." };
    }
    await prisma.savedFilter.delete({ where: { id } });
    revalidatePath(pathForScope(existing.scope));
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }

  return { ok: true };
}

export interface SavedFilterListItem {
  id: string;
  name: string;
  params: string;
}

export async function listSavedFiltersForUser(
  scope: SavedFilterScope,
): Promise<SavedFilterListItem[]> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return [];

  try {
    const rows = await prisma.savedFilter.findMany({
      where: { userId, scope },
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, params: true },
    });
    return rows;
  } catch {
    return [];
  }
}

