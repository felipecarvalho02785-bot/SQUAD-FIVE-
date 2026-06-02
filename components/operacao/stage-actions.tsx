"use client";

import { useState, useTransition } from "react";
import {
  IconArrowRight,
  IconCheck,
  IconX,
  IconPlayerPause,
  IconPlayerPlay,
  IconLogout2,
} from "@tabler/icons-react";
import { OperationStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
  advanceStageAction,
  pauseOperationAction,
  resumeOperationAction,
  extractOperationAction,
} from "@/lib/actions/operation";

interface StageActionsProps {
  operationId: string;
  operationStatus: OperationStatus;
  currentStage: {
    id: string;
    name: string;
    order: number;
  } | null;
  isLastStage: boolean;
}

export function StageActions({
  operationId,
  operationStatus,
  currentStage,
  isLastStage,
}: StageActionsProps) {
  const [pending, startTransition] = useTransition();
  const [confirmAdvance, setConfirmAdvance] = useState(false);
  const [confirmExtract, setConfirmExtract] = useState(false);

  if (operationStatus === OperationStatus.ENCERRADA) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-text-secondary text-[12px]">
          Operação encerrada. Histórico preservado.
        </p>
      </div>
    );
  }

  if (operationStatus === OperationStatus.PAUSADA) {
    return (
      <Button
        variant="primary"
        size="md"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await resumeOperationAction(operationId);
          })
        }
      >
        <IconPlayerPlay size={14} aria-hidden />
        {pending ? "Retomando..." : "Retomar operação"}
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {currentStage && !confirmAdvance ? (
        <Button
          variant="primary"
          size="md"
          onClick={() => setConfirmAdvance(true)}
        >
          <IconArrowRight size={14} aria-hidden />
          Avançar etapa
        </Button>
      ) : currentStage && confirmAdvance ? (
        <div
          role="alertdialog"
          aria-labelledby="confirm-advance-title"
          className="surface-raised border border-bronze/40 px-4 py-3 flex flex-col gap-3"
        >
          <p
            id="confirm-advance-title"
            className="text-text-primary text-[12px]"
          >
            {isLastStage
              ? "Marcar última etapa como cumprida? A operação será encerrada."
              : `Marcar "${currentStage.name}" como cumprida? A próxima etapa começará agora.`}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setConfirmAdvance(false)}
              disabled={pending}
            >
              <IconX size={12} aria-hidden />
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await advanceStageAction(operationId, currentStage.id);
                })
              }
            >
              <IconCheck size={12} aria-hidden />
              {pending ? "Avançando..." : "Confirmar"}
            </Button>
          </div>
        </div>
      ) : null}

      <Button
        variant="ghost"
        size="md"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await pauseOperationAction(operationId);
          })
        }
      >
        <IconPlayerPause size={14} aria-hidden />
        Pausar operação
      </Button>

      {!confirmExtract ? (
        <Button
          variant="ghost"
          size="md"
          onClick={() => setConfirmExtract(true)}
        >
          <IconLogout2 size={14} aria-hidden />
          Extrair (encerrar)
        </Button>
      ) : (
        <div
          role="alertdialog"
          aria-labelledby="confirm-extract-title"
          className="surface-raised border border-status-critical/40 px-4 py-3 flex flex-col gap-3"
        >
          <p
            id="confirm-extract-title"
            className="text-text-primary text-[12px]"
          >
            Cancelar operação? Isso vai pro status &quot;extração&quot; e
            preserva o histórico.
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setConfirmExtract(false)}
              disabled={pending}
            >
              <IconX size={12} aria-hidden />
              Cancelar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await extractOperationAction(operationId);
                })
              }
            >
              <IconLogout2 size={12} aria-hidden />
              {pending ? "Encerrando..." : "Confirmar extração"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
