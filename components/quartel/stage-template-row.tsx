"use client";

import { useActionState, useState, useTransition } from "react";
import {
  IconEdit,
  IconCheck,
  IconX,
  IconTrash,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/form/input";
import {
  updateStageTemplateAction,
  deleteStageTemplateAction,
  type ActionResult,
} from "@/lib/actions/template";

interface StageTemplateRowProps {
  template: {
    id: string;
    name: string;
    order: number;
    slaDays: number;
  };
  canDelete: boolean;
}

export function StageTemplateRow({ template, canDelete }: StageTemplateRowProps) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState<
    ActionResult | undefined,
    FormData
  >(updateStageTemplateAction, undefined);
  const [deletePending, startDeleteTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (editing) {
    return (
      <li>
        <form
          action={formAction}
          className="flex items-end gap-2 p-3 rounded-card bg-surface-deep border border-border-strong"
        >
          <input type="hidden" name="id" value={template.id} />
          <span className="label-display text-[10px] text-text-label pb-2 shrink-0">
            {template.order}.
          </span>
          <div className="flex-1 min-w-0 flex flex-col gap-1">
            <label
              htmlFor={`name-${template.id}`}
              className="label-display text-[9px] text-text-secondary"
            >
              Nome
            </label>
            <Input
              id={`name-${template.id}`}
              name="name"
              defaultValue={template.name}
              required
            />
          </div>
          <div className="w-24 flex flex-col gap-1">
            <label
              htmlFor={`sla-${template.id}`}
              className="label-display text-[9px] text-text-secondary"
            >
              SLA (dias)
            </label>
            <Input
              id={`sla-${template.id}`}
              name="slaDays"
              type="number"
              min="1"
              max="365"
              defaultValue={template.slaDays}
              required
            />
          </div>
          <Button type="submit" size="sm" disabled={pending}>
            <IconCheck size={12} aria-hidden />
            {pending ? "..." : "Salvar"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setEditing(false)}
            disabled={pending}
          >
            <IconX size={12} aria-hidden />
          </Button>
          {state && !state.ok ? (
            <span className="text-status-critical-text text-[11px] ml-2">
              {state.error}
            </span>
          ) : null}
        </form>
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between gap-3 p-3 rounded-card bg-surface-deep border border-border-default/60">
      <div className="flex items-center gap-3 min-w-0">
        <span className="label-display text-[10px] text-text-label shrink-0">
          {template.order}.
        </span>
        <span className="text-text-primary text-[13px] truncate">
          {template.name}
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="font-mono text-text-secondary text-[11px] tabular-nums">
          {template.slaDays}d
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setEditing(true)}
          aria-label="Editar etapa"
        >
          <IconEdit size={12} aria-hidden />
        </Button>
        {canDelete ? (
          confirmDelete ? (
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={deletePending}
                onClick={() =>
                  startDeleteTransition(async () => {
                    await deleteStageTemplateAction(template.id);
                  })
                }
              >
                <IconTrash size={12} aria-hidden />
                Confirmar
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setConfirmDelete(false)}
              >
                <IconX size={12} aria-hidden />
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setConfirmDelete(true)}
              aria-label="Remover etapa"
            >
              <IconTrash size={12} aria-hidden />
            </Button>
          )
        ) : null}
      </div>
    </li>
  );
}
