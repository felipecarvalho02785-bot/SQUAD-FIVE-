"use client";

import { useState, useTransition } from "react";
import { GapSource, GapStatus } from "@prisma/client";
import {
  IconAlertTriangle,
  IconPlus,
  IconCheck,
  IconClock,
  IconX,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/form/textarea";
import {
  createManualGapAction,
  resolveGapAction,
  setGapInTreatmentAction,
} from "@/lib/actions/gap";
import { cn } from "@/lib/utils";

interface GapSectionProps {
  operationId: string;
  gaps: Array<{
    id: string;
    description: string;
    source: GapSource;
    status: GapStatus;
    type: string;
    createdAt: Date;
  }>;
}

export function GapSection({ operationId, gaps }: GapSectionProps) {
  const [adding, setAdding] = useState(false);
  const [description, setDescription] = useState("");
  const [pending, startTransition] = useTransition();

  function handleCreate() {
    startTransition(async () => {
      const result = await createManualGapAction(operationId, description);
      if (result.ok) {
        toast.success("Gap registrado");
        setDescription("");
        setAdding(false);
      } else {
        toast.error(result.error ?? "Erro ao registrar gap.");
      }
    });
  }

  function handleResolve(gapId: string) {
    startTransition(async () => {
      const result = await resolveGapAction(gapId, operationId);
      if (result.ok) toast.success("Gap resolvido");
    });
  }

  function handleInTreatment(gapId: string) {
    startTransition(async () => {
      const result = await setGapInTreatmentAction(gapId, operationId);
      if (result.ok) toast.success("Gap marcado em tratamento");
    });
  }

  return (
    <section className="surface-raised p-5 flex flex-col gap-3">
      <header className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <IconAlertTriangle
            size={14}
            className={
              gaps.length > 0 ? "text-status-warn-text" : "text-text-dim"
            }
            stroke={1.5}
            aria-hidden
          />
          <h2 className="label-display text-[11px] text-text-secondary">
            Gaps
          </h2>
          <span className="font-mono text-[11px] text-text-dim">
            {gaps.length}
          </span>
        </div>
        {!adding ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAdding(true)}
            aria-label="Registrar gap manual"
          >
            <IconPlus size={12} aria-hidden />
            Registrar
          </Button>
        ) : null}
      </header>

      {adding ? (
        <div className="flex flex-col gap-2 p-3 rounded-card bg-surface-deep border border-border-default/60">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Ex: Cliente não respondeu sobre BM bloqueada há 3 dias."
            aria-label="Descrição do gap"
            autoFocus
          />
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setAdding(false);
                setDescription("");
              }}
              disabled={pending}
            >
              <IconX size={12} aria-hidden />
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreate}
              disabled={pending || description.trim().length < 5}
            >
              <IconCheck size={12} aria-hidden />
              Registrar gap
            </Button>
          </div>
        </div>
      ) : null}

      {gaps.length === 0 && !adding ? (
        <p className="py-4 text-center text-text-secondary text-[12px]">
          Nenhum gap em aberto.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {gaps.map((gap) => (
            <li
              key={gap.id}
              className={cn(
                "p-3 rounded-card border flex flex-col gap-2",
                gap.status === GapStatus.RESOLVIDO
                  ? "bg-surface-deep border-border-default/40 opacity-60"
                  : "bg-status-warn/10 border-status-warn/30",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-display uppercase tracking-[0.08em] text-[9px] text-text-label">
                      {gap.source === GapSource.AUTOMATIC ? "Automático" : "Manual"} ·{" "}
                      {gap.type.replace(/_/g, " ").toLowerCase()}
                    </span>
                  </div>
                  <p className="text-text-primary text-[12px] leading-relaxed">
                    {gap.description}
                  </p>
                </div>
              </div>
              {gap.status !== GapStatus.RESOLVIDO ? (
                <div className="flex items-center justify-end gap-2">
                  {gap.status === GapStatus.ABERTO ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleInTreatment(gap.id)}
                      disabled={pending}
                    >
                      <IconClock size={12} aria-hidden />
                      Em tratamento
                    </Button>
                  ) : null}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleResolve(gap.id)}
                    disabled={pending}
                  >
                    <IconCheck size={12} aria-hidden />
                    Resolver
                  </Button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
