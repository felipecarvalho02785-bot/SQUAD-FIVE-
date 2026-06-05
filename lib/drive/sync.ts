import { prisma } from "@/lib/db/prisma";
import { LibraryCategory, LibrarySource } from "@prisma/client";
import {
  fetchFileContent,
  getDriveAccessToken,
  listFolderFiles,
  type DriveFile,
} from "./client";

/*
  Engine de sync da pasta do Drive -> library_items.
  - Upsert por drive_file_id (criado/atualizado conforme modifiedTime).
  - Items DRIVE removidos da pasta sao APAGADOS do CRM (so MANUAL sobrevive).
  - Categoria inferida via heuristica simples no nome/mime.
*/

const NON_PREVIEWABLE_PLACEHOLDER =
  "[Arquivo binario — abra no Drive para visualizar.]";

function inferCategory(file: DriveFile): LibraryCategory {
  const name = file.name.toLowerCase();
  if (/copy|copywrite/.test(name)) return LibraryCategory.COPY;
  if (/roteiro|script/.test(name)) return LibraryCategory.ROTEIRO;
  if (/prompt/.test(name)) return LibraryCategory.PROMPT;
  if (/processo|sop|playbook/.test(name)) return LibraryCategory.PROCESSO;
  if (/anuncio|an[uú]ncio|ad[s]?/.test(name)) return LibraryCategory.ANUNCIO;
  if (/email|e-mail/.test(name)) return LibraryCategory.EMAIL;
  if (/whats|wpp|zap/.test(name)) return LibraryCategory.WHATSAPP;
  return LibraryCategory.OUTRO;
}

function deriveTags(file: DriveFile): string[] {
  const tags = new Set<string>(["drive"]);
  if (file.mimeType === "application/vnd.google-apps.document") tags.add("doc");
  else if (file.mimeType === "application/vnd.google-apps.spreadsheet")
    tags.add("sheet");
  else if (file.mimeType === "application/vnd.google-apps.presentation")
    tags.add("slides");
  else if (file.mimeType === "application/pdf") tags.add("pdf");
  return Array.from(tags);
}

export type SyncResult = {
  configId: string;
  fetched: number;
  created: number;
  updated: number;
  deleted: number;
  skipped: number;
  errors: string[];
};

export async function syncDriveConfig(configId: string): Promise<SyncResult> {
  const config = await prisma.driveSyncConfig.findUnique({
    where: { id: configId },
  });
  if (!config) throw new Error(`DriveSyncConfig ${configId} nao encontrada.`);
  if (!config.isActive) {
    return {
      configId,
      fetched: 0,
      created: 0,
      updated: 0,
      deleted: 0,
      skipped: 0,
      errors: ["Config inativa."],
    };
  }

  const result: SyncResult = {
    configId,
    fetched: 0,
    created: 0,
    updated: 0,
    deleted: 0,
    skipped: 0,
    errors: [],
  };

  try {
    const accessToken = await getDriveAccessToken(config.syncedById);
    const files = await listFolderFiles(accessToken, config.folderId);
    result.fetched = files.length;

    const seenDriveIds = new Set<string>();

    for (const file of files) {
      seenDriveIds.add(file.id);
      try {
        let content: string | null = null;
        try {
          content = await fetchFileContent(accessToken, file);
        } catch (err) {
          result.errors.push(
            `Conteudo de "${file.name}": ${(err as Error).message}`,
          );
        }

        const existing = await prisma.libraryItem.findUnique({
          where: { driveFileId: file.id },
          select: {
            id: true,
            driveModifiedAt: true,
            source: true,
          },
        });

        const driveModifiedAt = new Date(file.modifiedTime);

        if (existing) {
          if (
            existing.driveModifiedAt &&
            existing.driveModifiedAt.getTime() >= driveModifiedAt.getTime()
          ) {
            result.skipped++;
            continue;
          }
          await prisma.libraryItem.update({
            where: { id: existing.id },
            data: {
              title: file.name,
              category: inferCategory(file),
              content: content ?? NON_PREVIEWABLE_PLACEHOLDER,
              tags: deriveTags(file),
              source: LibrarySource.DRIVE,
              driveUrl: file.webViewLink ?? null,
              driveMimeType: file.mimeType,
              driveModifiedAt,
            },
          });
          result.updated++;
        } else {
          await prisma.libraryItem.create({
            data: {
              title: file.name,
              category: inferCategory(file),
              content: content ?? NON_PREVIEWABLE_PLACEHOLDER,
              tags: deriveTags(file),
              source: LibrarySource.DRIVE,
              driveFileId: file.id,
              driveUrl: file.webViewLink ?? null,
              driveMimeType: file.mimeType,
              driveModifiedAt,
              createdById: config.syncedById,
            },
          });
          result.created++;
        }
      } catch (err) {
        result.errors.push(`"${file.name}": ${(err as Error).message}`);
      }
    }

    const deleted = await prisma.libraryItem.deleteMany({
      where: {
        source: LibrarySource.DRIVE,
        driveFileId: { notIn: Array.from(seenDriveIds) },
      },
    });
    result.deleted = deleted.count;

    await prisma.driveSyncConfig.update({
      where: { id: configId },
      data: {
        lastSyncAt: new Date(),
        lastError: result.errors.length
          ? result.errors.slice(0, 3).join(" | ").slice(0, 500)
          : null,
        itemsSynced: result.created + result.updated,
      },
    });
  } catch (err) {
    const message = (err as Error).message;
    result.errors.push(message);
    await prisma.driveSyncConfig.update({
      where: { id: configId },
      data: {
        lastSyncAt: new Date(),
        lastError: message.slice(0, 500),
      },
    });
  }

  return result;
}

export async function syncAllActiveDriveConfigs(): Promise<SyncResult[]> {
  const configs = await prisma.driveSyncConfig.findMany({
    where: { isActive: true },
    select: { id: true },
  });
  const results: SyncResult[] = [];
  for (const c of configs) {
    results.push(await syncDriveConfig(c.id));
  }
  return results;
}
