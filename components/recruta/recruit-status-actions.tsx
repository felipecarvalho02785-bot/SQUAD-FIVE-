"use client";

import { useState, useTransition } from "react";
import { IconAlertOctagon, IconReload, IconX } from "@tabler/icons-react";
import { RecruitStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
  markRecruitBaixaAction,
  reactivateRecruitAction,
} from "@/lib/actions/recruit";

/*
  Acoes destrutivas/reversiveis no detalhe do recruta.
  Inline confirmation — nao usa modal (segue a regra do briefing).
*/

interface RecruitStatusActionsProps {
  id: string;
  status: RecruitStatus;
}

export function RecruitStatusActions({
  id,
  status,
}: RecruitStatusActionsProps) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (status === RecruitStatus.BAIXA) {
    return (
      <Button
        variant="secondary"
        size="md"
        disabled={pending}
        onClick={() => {
          startTransition(async () => {
            await reactivateRecruitAction(id);
          });
        }}
      >
        <IconReload size={14} aria-hidden />
        {pending ? "Reativando..." : "Reativar recruta"}
      </Button>
    );
  }

  if (!confirming) {
    return (
      <Button
        variant="ghost"
        size="md"
        onClick={() => setConfirming(true)}
        aria-haspopup="dialog"
      >
        <IconAlertOctagon size={14} aria-hidden />
        Marcar baixa
      </Button>
    );
  }

  return (
    <div
      role="alertdialog"
      aria-labelledby="confirm-baixa-title"
      className="surface-raised border border-status-critical/40 px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3"
    >
      <p
        id="confirm-baixa-title"
        className="text-text-primary text-[12px] flex-1"
      >
        Confirmar baixa do recruta? Essa ação encerra todas as operações dele.
      </p>
      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setConfirming(false)}
          disabled={pending}
        >
          <IconX size={12} aria-hidden />
          Cancelar
        </Button>
        <Button
          variant="destructive"
          size="sm"
          disabled={pending}
          onClick={() => {
            startTransition(async () => {
              await markRecruitBaixaAction(id);
            });
          }}
        >
          <IconAlertOctagon size={12} aria-hidden />
          {pending ? "Encerrando..." : "Confirmar baixa"}
        </Button>
      </div>
    </div>
  );
}
