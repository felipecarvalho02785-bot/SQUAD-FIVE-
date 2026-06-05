"use client";

import { useRouter } from "next/navigation";
import { useActionState, useState, useTransition } from "react";
import {
  IconBrandGoogleDrive,
  IconRefresh,
  IconExternalLink,
  IconUnlink,
  IconAlertTriangle,
  IconCheck,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/form/input";
import {
  connectDriveFolderAction,
  runDriveSyncNowAction,
  disconnectDriveAction,
  type DriveActionResult,
} from "@/lib/actions/drive-sync";

interface DriveSyncCardProps {
  config: {
    folderId: string;
    folderName: string | null;
    folderUrl: string | null;
    lastSyncAt: Date | null;
    lastError: string | null;
    itemsSynced: number;
    syncedBy: { name: string | null; email: string } | null;
  } | null;
}

function formatWhen(date: Date | null): string {
  if (!date) return "nunca";
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `há ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `há ${hours}h`;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function DriveSyncCard({ config }: DriveSyncCardProps) {
  const [connectState, connectAction, connecting] = useActionState<
    DriveActionResult | undefined,
    FormData
  >(connectDriveFolderAction, undefined);

  const router = useRouter();
  const [syncResult, setSyncResult] = useState<DriveActionResult | null>(null);
  const [syncing, startSync] = useTransition();
  const [disconnecting, startDisconnect] = useTransition();

  if (!config) {
    return (
      <section className="surface-raised p-4 flex flex-col gap-3">
        <header className="flex items-center gap-2">
          <IconBrandGoogleDrive
            size={16}
            stroke={1.5}
            className="text-bronze"
            aria-hidden
          />
          <h2 className="font-display text-[13px] uppercase tracking-[0.06em] text-text-primary">
            Conectar Google Drive
          </h2>
        </header>
        <p className="text-[12px] text-text-secondary leading-relaxed">
          Cole a URL de uma pasta do seu Drive. O CRM vai puxar Docs, Sheets e
          textos como itens da biblioteca, sincronizando automaticamente todo
          dia às 08h. Itens removidos da pasta saem da biblioteca também.
        </p>
        <form action={connectAction} className="flex flex-col sm:flex-row gap-2">
          <Input
            type="url"
            name="folder"
            placeholder="https://drive.google.com/drive/folders/..."
            required
            disabled={connecting}
            className="flex-1"
            aria-label="URL da pasta no Drive"
          />
          <Button type="submit" variant="primary" size="md" disabled={connecting}>
            {connecting ? "Conectando..." : "Conectar pasta"}
          </Button>
        </form>
        {connectState && !connectState.ok ? (
          <p className="text-[12px] text-danger-fg flex items-start gap-1.5">
            <IconAlertTriangle size={12} aria-hidden className="mt-0.5 shrink-0" />
            {connectState.error}
          </p>
        ) : null}
      </section>
    );
  }

  const lastSync = config.lastSyncAt;
  const hasError = Boolean(config.lastError);

  return (
    <section className="surface-raised p-4 flex flex-col gap-3">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2 min-w-0">
          <IconBrandGoogleDrive
            size={16}
            stroke={1.5}
            className="text-bronze shrink-0 mt-0.5"
            aria-hidden
          />
          <div className="flex flex-col gap-0.5 min-w-0">
            <h2 className="font-display text-[13px] uppercase tracking-[0.06em] text-text-primary truncate">
              {config.folderName ?? "Pasta sincronizada"}
            </h2>
            <p className="text-[11px] text-text-dim flex items-center gap-2 flex-wrap">
              <span>
                Último sync: <span className="font-mono">{formatWhen(lastSync)}</span>
              </span>
              <span className="text-text-dim/50">•</span>
              <span>
                <span className="font-mono tabular-nums">{config.itemsSynced}</span> items
              </span>
              {config.syncedBy ? (
                <>
                  <span className="text-text-dim/50">•</span>
                  <span>por {config.syncedBy.name ?? config.syncedBy.email}</span>
                </>
              ) : null}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {config.folderUrl ? (
            <a
              href={config.folderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-dim hover:text-text-primary p-1.5"
              aria-label="Abrir pasta no Drive"
              title="Abrir no Drive"
            >
              <IconExternalLink size={14} stroke={1.5} aria-hidden />
            </a>
          ) : null}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={syncing}
            onClick={() =>
              startSync(async () => {
                const r = await runDriveSyncNowAction();
                setSyncResult(r);
                router.refresh();
              })
            }
          >
            <IconRefresh
              size={12}
              aria-hidden
              className={syncing ? "animate-spin" : undefined}
            />
            {syncing ? "Sincronizando..." : "Sincronizar agora"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disconnecting}
            onClick={() => {
              if (
                !confirm(
                  "Desconectar Drive vai apagar todos os itens importados (manuais permanecem). Continuar?",
                )
              ) {
                return;
              }
              startDisconnect(async () => {
                await disconnectDriveAction();
                router.refresh();
              });
            }}
            aria-label="Desconectar pasta do Drive"
            title="Desconectar"
          >
            <IconUnlink size={12} aria-hidden />
          </Button>
        </div>
      </header>

      {syncResult ? (
        <p
          className={`text-[12px] flex items-start gap-1.5 ${
            syncResult.ok ? "text-success-fg" : "text-danger-fg"
          }`}
        >
          {syncResult.ok ? (
            <IconCheck size={12} aria-hidden className="mt-0.5 shrink-0" />
          ) : (
            <IconAlertTriangle size={12} aria-hidden className="mt-0.5 shrink-0" />
          )}
          {syncResult.ok ? syncResult.message ?? "Sync ok." : syncResult.error}
        </p>
      ) : hasError ? (
        <p className="text-[12px] text-danger-fg flex items-start gap-1.5">
          <IconAlertTriangle size={12} aria-hidden className="mt-0.5 shrink-0" />
          Último sync com erro: {config.lastError}
        </p>
      ) : null}
    </section>
  );
}
