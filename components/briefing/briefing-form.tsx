"use client";

import Link from "next/link";
import { useActionState } from "react";
import { IconChecks, IconArrowLeft } from "@tabler/icons-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field } from "@/components/form/field";
import { Input } from "@/components/form/input";
import { Textarea } from "@/components/form/textarea";
import { Select } from "@/components/form/select";
import { FormSection } from "@/components/form/form-section";
import type { ActionResult } from "@/lib/actions/briefing";

interface BriefingFormProps {
  action: (
    prev: ActionResult | undefined,
    formData: FormData,
  ) => Promise<ActionResult>;
  operations: Array<{ id: string; label: string }>;
  fixedOperationId?: string;
  cancelHref: string;
}

function nowLocalInputValue(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export function BriefingForm({
  action,
  operations,
  fixedOperationId,
  cancelHref,
}: BriefingFormProps) {
  const [state, formAction, pending] = useActionState<
    ActionResult | undefined,
    FormData
  >(action, undefined);
  const errors = state && !state.ok ? state.fieldErrors ?? {} : {};

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {fixedOperationId ? (
        <input type="hidden" name="operationId" value={fixedOperationId} />
      ) : null}

      <FormSection title="Briefing" description="Registro da reunião com o recruta.">
        {!fixedOperationId ? (
          <Field
            label="Operação"
            name="operationId"
            required
            error={errors.operationId}
          >
            <Select id="operationId" name="operationId" required>
              <option value="">Selecione a operação...</option>
              {operations.map((op) => (
                <option key={op.id} value={op.id}>
                  {op.label}
                </option>
              ))}
            </Select>
          </Field>
        ) : null}

        <Field
          label="Data e hora"
          name="date"
          required
          error={errors.date}
        >
          <Input
            id="date"
            name="date"
            type="datetime-local"
            required
            defaultValue={nowLocalInputValue()}
          />
        </Field>

        <Field
          label="Duração (min)"
          name="durationMin"
          hint="Tempo gasto na reunião."
          error={errors.durationMin}
        >
          <Input
            id="durationMin"
            name="durationMin"
            type="number"
            min="1"
            placeholder="30"
          />
        </Field>

        <Field
          label="NPS (0-10)"
          name="npsScore"
          required
          hint="Score pós-briefing reportado pelo recruta."
          error={errors.npsScore}
        >
          <Input
            id="npsScore"
            name="npsScore"
            type="number"
            min="0"
            max="10"
            step="1"
            placeholder="9"
          />
        </Field>
      </FormSection>

      <FormSection
        title="Conteúdo"
        description="Quem participou e o que se decidiu."
        columns={1}
      >
        <Field
          label="Presentes"
          name="attendees"
          hint="Lista livre — squad + nome do recruta."
          error={errors.attendees}
        >
          <Input
            id="attendees"
            name="attendees"
            placeholder="Ex: Felipe (PM), Dra. Maria (recruta), Pedro (account)"
          />
        </Field>
        <Field label="Anotações" name="notes" error={errors.notes}>
          <Textarea
            id="notes"
            name="notes"
            rows={6}
            placeholder="Pontos discutidos, decisões, próximos passos..."
          />
        </Field>
      </FormSection>

      {state && !state.ok ? (
        <div className="surface-raised border border-status-critical/40 px-4 py-3 text-status-critical-text text-[12px]">
          {state.error}
        </div>
      ) : null}

      <footer className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
        <Link
          href={cancelHref}
          className={buttonVariants({ variant: "secondary", size: "md" })}
        >
          <IconArrowLeft size={14} aria-hidden />
          Cancelar
        </Link>
        <Button type="submit" variant="primary" size="md" disabled={pending}>
          <IconChecks size={14} aria-hidden />
          {pending ? "Salvando..." : "Salvar briefing"}
        </Button>
      </footer>
    </form>
  );
}
