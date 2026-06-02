"use client";

import Link from "next/link";
import { useActionState } from "react";
import { LibraryCategory } from "@prisma/client";
import { IconChecks, IconArrowLeft } from "@tabler/icons-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field } from "@/components/form/field";
import { Input } from "@/components/form/input";
import { Textarea } from "@/components/form/textarea";
import { Select } from "@/components/form/select";
import type { ActionResult } from "@/lib/actions/library";
import { CATEGORIES_ORDER, CATEGORY_LABEL } from "@/lib/library-meta";

interface LibraryFormProps {
  action: (
    prev: ActionResult | undefined,
    formData: FormData,
  ) => Promise<ActionResult>;
  defaults?: {
    title?: string;
    category?: LibraryCategory;
    content?: string;
    tags?: string[];
  };
  submitLabel: string;
  cancelHref: string;
}

export function LibraryForm({
  action,
  defaults,
  submitLabel,
  cancelHref,
}: LibraryFormProps) {
  const [state, formAction, pending] = useActionState<
    ActionResult | undefined,
    FormData
  >(action, undefined);
  const errors = state && !state.ok ? state.fieldErrors ?? {} : {};

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <Field label="Título" name="title" required error={errors.title}>
            <Input
              id="title"
              name="title"
              required
              defaultValue={defaults?.title ?? ""}
              placeholder="Ex: Copy de WhatsApp pós-briefing — versão 3"
              autoFocus
            />
          </Field>
        </div>
        <Field label="Categoria" name="category" error={errors.category}>
          <Select
            id="category"
            name="category"
            defaultValue={defaults?.category ?? LibraryCategory.OUTRO}
          >
            {CATEGORIES_ORDER.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABEL[c]}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field
        label="Tags"
        name="tags"
        hint="Separe por vírgula. Ex: leadgen, advocacia, follow-up"
        error={errors.tags}
      >
        <Input
          id="tags"
          name="tags"
          defaultValue={defaults?.tags?.join(", ") ?? ""}
          placeholder="leadgen, advocacia, follow-up"
        />
      </Field>

      <Field
        label="Conteúdo"
        name="content"
        required
        hint="Markdown simples preservado. Quebras de linha mantidas."
        error={errors.content}
      >
        <Textarea
          id="content"
          name="content"
          required
          rows={14}
          defaultValue={defaults?.content ?? ""}
          placeholder={`Cole aqui o template completo...

Variáveis usuais entre {chaves}:
{nome_do_recruta}
{produto}
{etapa_atual}`}
          className="font-mono text-[12px]"
        />
      </Field>

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
          {pending ? "Salvando..." : submitLabel}
        </Button>
      </footer>
    </form>
  );
}
