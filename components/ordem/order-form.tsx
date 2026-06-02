"use client";

import { useActionState } from "react";
import Link from "next/link";
import { IconChecks, IconX } from "@tabler/icons-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field } from "@/components/form/field";
import { Input } from "@/components/form/input";
import { Textarea } from "@/components/form/textarea";
import { Select } from "@/components/form/select";
import type { ActionResult } from "@/lib/actions/order";

interface OrderFormProps {
  action: (
    prev: ActionResult | undefined,
    formData: FormData,
  ) => Promise<ActionResult>;
  squadMembers: Array<{ id: string; name: string | null; email: string }>;
  /** Etapas pra escolher quando NAO e squad task. */
  stages?: Array<{ id: string; label: string }>;
  /** Forca esta ordem como squad task (oculta o select de etapa). */
  fixedSquadTask?: boolean;
  /** Pre-seleciona uma etapa especifica e oculta o select. */
  fixedStageId?: string;
  cancelHref: string;
}

export function OrderForm({
  action,
  squadMembers,
  stages = [],
  fixedSquadTask = false,
  fixedStageId,
  cancelHref,
}: OrderFormProps) {
  const [state, formAction, pending] = useActionState<
    ActionResult | undefined,
    FormData
  >(action, undefined);
  const errors = state && !state.ok ? state.fieldErrors ?? {} : {};

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {fixedSquadTask ? (
        <input type="hidden" name="squadTask" value="true" />
      ) : null}
      {fixedStageId ? (
        <input type="hidden" name="operationStageId" value={fixedStageId} />
      ) : null}

      <Field label="Título da ordem" name="title" required error={errors.title}>
        <Input
          id="title"
          name="title"
          required
          placeholder="Ex: Revisar copy do anúncio principal"
          autoFocus
        />
      </Field>

      <Field label="Descrição" name="description" error={errors.description}>
        <Textarea
          id="description"
          name="description"
          rows={3}
          placeholder="Detalhe o que precisa ser feito (opcional)"
        />
      </Field>

      {!fixedSquadTask && !fixedStageId && stages.length > 0 ? (
        <Field
          label="Vincular a etapa"
          name="operationStageId"
          error={errors.operationStageId}
          hint="Ou marque como tarefa interna do squad"
        >
          <Select id="operationStageId" name="operationStageId">
            <option value="">Selecione uma etapa...</option>
            {stages.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </Select>
        </Field>
      ) : null}

      {!fixedSquadTask && stages.length === 0 && !fixedStageId ? (
        <Field
          label="Tarefa interna do squad"
          name="squadTask"
          hint="Sem operação vinculada, vira tarefa do squad"
        >
          <label className="inline-flex items-center gap-2 text-text-secondary text-[12px]">
            <input
              type="checkbox"
              name="squadTask"
              value="true"
              defaultChecked
              className="w-4 h-4 accent-bronze"
            />
            Marcar como tarefa do squad
          </label>
        </Field>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="Responsável (squad)"
          name="assigneeId"
          error={errors.assigneeId}
        >
          <Select id="assigneeId" name="assigneeId">
            <option value="">Ninguém atribuído</option>
            {squadMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name ?? m.email}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="D-day"
          name="dueDate"
          hint="Em branco para sem prazo"
          error={errors.dueDate}
        >
          <Input id="dueDate" name="dueDate" type="date" />
        </Field>
      </div>

      <Field
        label="Executor externo (opcional)"
        name="externalAssignee"
        hint="Se a entrega é com fornecedor fora do squad"
        error={errors.externalAssignee}
      >
        <Input
          id="externalAssignee"
          name="externalAssignee"
          placeholder="Ex: Studio Tropos · Designer freelance"
        />
      </Field>

      {state && !state.ok ? (
        <div className="surface-raised border border-status-critical/40 px-4 py-3 text-status-critical-text text-[12px]">
          {state.error}
        </div>
      ) : null}

      <footer className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
        <Link
          href={cancelHref}
          className={buttonVariants({ variant: "secondary", size: "md" })}
        >
          <IconX size={14} aria-hidden />
          Cancelar
        </Link>
        <Button type="submit" variant="primary" size="md" disabled={pending}>
          <IconChecks size={14} aria-hidden />
          {pending ? "Criando..." : "Criar ordem"}
        </Button>
      </footer>
    </form>
  );
}
