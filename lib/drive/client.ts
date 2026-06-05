import { prisma } from "@/lib/db/prisma";

/*
  Cliente do Google Drive API v3 sem dependencia da googleapis (pesada).
  Usa fetch direto + refresh manual do access_token via tabela accounts
  do Auth.js (PrismaAdapter ja persiste refresh_token e access_token).
*/

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const DRIVE_API = "https://www.googleapis.com/drive/v3";
const REFRESH_SKEW_SEC = 60;

export type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  webViewLink?: string;
  parents?: string[];
};

export class DriveAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DriveAuthError";
  }
}

async function getGoogleAccount(userId: string) {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "google" },
  });
  if (!account) {
    throw new DriveAuthError(
      "Usuario nao possui conta Google vinculada. Faca login com Google.",
    );
  }
  if (!account.refresh_token) {
    throw new DriveAuthError(
      "Refresh token ausente. Refaca login com Google para reautorizar acesso ao Drive.",
    );
  }
  return account;
}

async function refreshAccessToken(refreshToken: string) {
  const clientId = process.env.AUTH_GOOGLE_ID;
  const clientSecret = process.env.AUTH_GOOGLE_SECRET;
  if (!clientId || !clientSecret) {
    throw new DriveAuthError(
      "AUTH_GOOGLE_ID/AUTH_GOOGLE_SECRET nao configurados.",
    );
  }

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new DriveAuthError(
      `Falha ao renovar token Google (${res.status}): ${body.slice(0, 200)}`,
    );
  }

  const data = (await res.json()) as {
    access_token: string;
    expires_in: number;
    scope?: string;
    token_type?: string;
  };
  return {
    accessToken: data.access_token,
    expiresAt: Math.floor(Date.now() / 1000) + data.expires_in,
    scope: data.scope,
  };
}

export async function getDriveAccessToken(userId: string): Promise<string> {
  const account = await getGoogleAccount(userId);
  const now = Math.floor(Date.now() / 1000);

  if (
    account.access_token &&
    account.expires_at &&
    account.expires_at - REFRESH_SKEW_SEC > now
  ) {
    return account.access_token;
  }

  const refreshed = await refreshAccessToken(account.refresh_token!);
  await prisma.account.update({
    where: { id: account.id },
    data: {
      access_token: refreshed.accessToken,
      expires_at: refreshed.expiresAt,
      scope: refreshed.scope ?? account.scope,
    },
  });
  return refreshed.accessToken;
}

async function driveFetch(
  accessToken: string,
  path: string,
  init?: RequestInit,
) {
  const url = path.startsWith("http") ? path : `${DRIVE_API}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Drive API ${res.status} em ${path}: ${body.slice(0, 200)}`,
    );
  }
  return res;
}

export async function listFolderFiles(
  accessToken: string,
  folderId: string,
): Promise<DriveFile[]> {
  const files: DriveFile[] = [];
  let pageToken: string | undefined;
  do {
    const params = new URLSearchParams({
      q: `'${folderId}' in parents and trashed = false`,
      fields:
        "nextPageToken, files(id, name, mimeType, modifiedTime, webViewLink, parents)",
      pageSize: "200",
    });
    if (pageToken) params.set("pageToken", pageToken);
    const res = await driveFetch(accessToken, `/files?${params}`);
    const data = (await res.json()) as {
      files: DriveFile[];
      nextPageToken?: string;
    };
    files.push(...data.files);
    pageToken = data.nextPageToken;
  } while (pageToken);
  return files;
}

export async function getFolderMetadata(
  accessToken: string,
  folderId: string,
): Promise<{ id: string; name: string; webViewLink?: string }> {
  const params = new URLSearchParams({
    fields: "id, name, webViewLink, mimeType",
  });
  const res = await driveFetch(accessToken, `/files/${folderId}?${params}`);
  return (await res.json()) as {
    id: string;
    name: string;
    webViewLink?: string;
  };
}

const TEXTUAL_MIMES = new Set([
  "text/plain",
  "text/markdown",
  "text/html",
  "text/csv",
  "application/json",
]);

export async function fetchFileContent(
  accessToken: string,
  file: Pick<DriveFile, "id" | "mimeType">,
): Promise<string | null> {
  if (file.mimeType === "application/vnd.google-apps.document") {
    const res = await driveFetch(
      accessToken,
      `/files/${file.id}/export?mimeType=text/plain`,
    );
    return await res.text();
  }
  if (file.mimeType === "application/vnd.google-apps.spreadsheet") {
    const res = await driveFetch(
      accessToken,
      `/files/${file.id}/export?mimeType=text/csv`,
    );
    return await res.text();
  }
  if (file.mimeType === "application/vnd.google-apps.presentation") {
    const res = await driveFetch(
      accessToken,
      `/files/${file.id}/export?mimeType=text/plain`,
    );
    return await res.text();
  }
  if (TEXTUAL_MIMES.has(file.mimeType)) {
    const res = await driveFetch(accessToken, `/files/${file.id}?alt=media`);
    return await res.text();
  }
  return null;
}

export function extractFolderId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const folderMatch = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (folderMatch) return folderMatch[1];
  const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch) return idMatch[1];
  if (/^[a-zA-Z0-9_-]{10,}$/.test(trimmed)) return trimmed;
  return null;
}
