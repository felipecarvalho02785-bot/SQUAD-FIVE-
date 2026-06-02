"use client";

import Link from "next/link";
import { useActionState } from "react";
import { IconChecks, IconArrowLeft } from "@tabler/icons-react";
import { RecruitStatus } from "@prisma/client";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field } from "@/components/form/field";
import { Input } from "@/components/form/input";
import { Textarea } from "@/components/form/textarea";
import { Select } from "@/components/form/select";
import { FormSection } from "@/components/form/form-section";
import type { ActionResult } from "@/lib/actions/recruit";

/*
  Formulario unificado de criacao e edicao de Recruta.
  Recebe a server action correspondente (createRecruitAction ou
  updateRecruitAction.bind(null, id)) via prop `action`.
*/

export interface RecruitFormDefaults {
  name?: string;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  segment?: string | null;
  campaignBudget?: number | string | null;
  theses?: string | null;
  notes?: string | null;
  status?: RecruitStatus;
}

interface RecruitFormProps {
  action: (
    prev: ActionResult | undefined,
    formData: FormData,
  ) => Promise<ActionResult>;
  defaults?: RecruitFormDefaults;
  submitLabel: string;
  cancelHref: string;
}

function valueOrEmpty(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

export function RecruitForm({
  action,
  defaults,
  submitLabel,
  cancelHref,
}: RecruitFormProps) {
  const [state, formAction, pending] = useActionState<
    ActionResult | undefined,
    FormData
  >(action, undefined);

  const errors = state && !state.ok ? state.fieldErrors ?? {} : {};

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <FormSection
        title="Identidade"
        description="Como o recruta aparece no sistema."
      >
        <Field
          label="Nome do recruta"
          name="name"
          required
          error={errors.name}
        >
          <Input
            id="name"
            name="name"
            defaultValue={valueOrEmpty(defaults?.name)}
            placeholder="Ex: Maternidade Vida & Sorriso"
            required
            autoFocus
            aria-invalid={Boolean(errors.name)}
          />
        </Field>
        <Field
          label="Status"
          name="status"
          hint="Use Pausado para freeze temporário, Baixa para encerrado."
          error={errors.status}
        >
          <Select
            id="status"
            name="status"
            defaultValue={defaults?.status ?? RecruitStatus.ATIVO}
            aria-invalid={Boolean(errors.status)}
          >
            <option value={RecruitStatus.ATIVO}>Ativo</option>
            <option value={RecruitStatus.PAUSADO}>Pausado</option>
            <option value={RecruitStatus.BAIXA}>Baixa</option>
          </Select>
        </Field>
      </FormSection>

      <FormSection
        title="Contato"
        description="Quem o squad chama para briefings e ajustes."
      >
        <Field
          label="Nome do responsável"
          name="contactName"
          error={errors.contactName}
        >
          <Input
            id="contactName"
            name="contactName"
            defaultValue={valueOrEmpty(defaults?.contactName)}
            placeholder="Ex: Dra. Maria Souza"
          />
        </Field>
        <Field
          label="E-mail de contato"
          name="contactEmail"
          error={errors.contactEmail}
        >
          <Input
            id="contactEmail"
            name="contactEmail"
            type="email"
            defaultValue={valueOrEmpty(defaults?.contactEmail)}
            placeholder="contato@empresa.com.br"
            aria-invalid={Boolean(errors.contactEmail)}
          />
        </Field>
        <Field
          label="Telefone / WhatsApp"
          name="contactPhone"
          error={errors.contactPhone}
        >
          <Input
            id="contactPhone"
            name="contactPhone"
            defaultValue={valueOrEmpty(defaults?.contactPhone)}
            placeholder="(11) 91234-5678"
          />
        </Field>
        <Field label="Segmento" name="segment" error={errors.segment}>
          <Input
            id="segment"
            name="segment"
            defaultValue={valueOrEmpty(defaults?.segment)}
            placeholder="Ex: Saúde, Educação, E-commerce"
          />
        </Field>
      </FormSection>

      <FormSection
        title="Operacional"
        description="Recursos e teses que o squad vai mobilizar."
        columns={1}
      >
        <Field
          label="Orçamento de campanha (R$)"
          name="campaignBudget"
          hint="Valor mensal investido em mídia."
          error={errors.campaignBudget}
        >
          <Input
            id="campaignBudget"
            name="campaignBudget"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            defaultValue={valueOrEmpty(defaults?.campaignBudget)}
            placeholder="15000.00"
            aria-invalid={Boolean(errors.campaignBudget)}
          />
        </Field>
        <Field label="Teses do recruta" name="theses" error={errors.theses}>
          <Textarea
            id="theses"
            name="theses"
            defaultValue={valueOrEmpty(defaults?.theses)}
            rows={4}
            placeholder="Quais hipóteses esse recruta vai validar..."
          />
        </Field>
        <Field label="Observações" name="notes" error={errors.notes}>
          <Textarea
            id="notes"
            name="notes"
            defaultValue={valueOrEmpty(defaults?.notes)}
            rows={3}
            placeholder="Notas livres, contexto histórico, alertas..."
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
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={pending}
        >
          <IconChecks size={14} aria-hidden />
          {pending ? "Reunindo o pelotão..." : submitLabel}
        </Button>
      </footer>
    </form>
  );
}
