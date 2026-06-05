"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import {
  DriveAuthError,
  extractFolderId,
  getDriveAccessToken,
  getFolderMetadata,
} from "@/lib/drive/client";
import { syncDriveConfig } from "@/lib/drive/sync";

export type DriveActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string };

async function requireUserId() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Não autorizado");
  return userId;
}

export async function connectDriveFolderAction(
  _prev: DriveActionResult | undefined,
  formData: FormData,
): Promise<DriveActionResult> {
  const userId = await requireUserId();
  const raw = String(formData.get("folder") ?? "").trim();
  const folderId = extractFolderId(raw);
  if (!folderId) {
    return {
      ok: false,
      error: "URL/ID de pasta invalido. Cole a URL da pasta no Drive.",
    };
  }

  try {
    const accessToken = await getDriveAccessToken(userId);
    const meta = await getFolderMetadata(accessToken, folderId);

    await prisma.driveSyncConfig.deleteMany({ where: { isActive: true } });
    await prisma.driveSyncConfig.create({
      data: {
        folderId: meta.id,
        folderName: meta.name,
        folderUrl: meta.webViewLink ?? `https://drive.google.com/drive/folders/${meta.id}`,
        syncedById: userId,
        isActive: true,
      },
    });
  } catch (err) {
    if (err instanceof DriveAuthError) {
      return { ok: false, error: err.message };
    }
    return {
      ok: false,
      error: `Falha ao conectar pasta: ${(err as Error).message}`,
    };
  }

  revalidatePath("/biblioteca");
  return { ok: true, message: "Pasta conectada. Clique em Sincronizar agora." };
}

export async function runDriveSyncNowAction(): Promise<DriveActionResult> {
  await requireUserId();
  const config = await prisma.driveSyncConfig.findFirst({
    where: { isActive: true },
  });
  if (!config) {
    return { ok: false, error: "Nenhuma pasta conectada." };
  }
  const result = await syncDriveConfig(config.id);
  revalidatePath("/biblioteca");
  const summary = `${result.created} criados, ${result.updated} atualizados, ${result.deleted} removidos, ${result.skipped} sem mudanca.`;
  if (result.errors.length) {
    return {
      ok: false,
      error: `${summary} Erros: ${result.errors.slice(0, 2).join(" | ")}`,
    };
  }
  return { ok: true, message: summary };
}

export async function disconnectDriveAction(): Promise<DriveActionResult> {
  await requireUserId();
  await prisma.driveSyncConfig.deleteMany({});
  await prisma.libraryItem.deleteMany({ where: { source: "DRIVE" } });
  revalidatePath("/biblioteca");
  return { ok: true, message: "Pasta desconectada e itens DRIVE removidos." };
}
