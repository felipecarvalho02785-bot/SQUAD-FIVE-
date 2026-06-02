"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { IconChecks, IconArrowLeft } from "@tabler/icons-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field } from "@/components/form/field";
import { Input } from "@/components/form/input";
import { Select } from "@/components/form/select";
import { FormSection } from "@/components/form/form-section";
import type { ActionResult } from "@/lib/actions/operation";

interface OperationFormProps {
  action: (
    prev: ActionResult | undefined,
    formData: FormData,
  ) => Promise<ActionResult>;
  recruits: Array<{ id: string; name: string }>;
  products: Array<{
    id: string;
    name: string;
    archetype: "PROJECT" | "RETAINER";
    typicalDurationDays: number | null;
    _count: { stageTemplates: number };
  }>;
  squadMembers: Array<{ id: string; name: string | null; email: string }>;
  defaults?: {
    recruitId?: string;
    productId?: string;
    codeName?: string;
    ownerId?: string;
  };
  submitLabel: string;
  cancelHref: string;
}

function todayIso(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function OperationForm({
  action,
  recruits,
  products,
  squadMembers,
  defaults,
  submitLabel,
  cancelHref,
}: OperationFormProps) {
  const [state, formAction, pending] = useActionState<
    ActionResult | undefined,
    FormData
  >(action, undefined);
  const errors = state && !state.ok ? state.fieldErrors ?? {} : {};

  const [productId, setProductId] = useState(defaults?.productId ?? "");
  const selectedProduct = products.find((p) => p.id === productId);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <FormSection
        title="Mobilização"
        description="Identifica o recruta, o produto e quem comanda."
      >
        <Field
          label="Recruta"
          name="recruitId"
          required
          error={errors.recruitId}
        >
          <Select
            id="recruitId"
            name="recruitId"
            defaultValue={defaults?.recruitId ?? ""}
            required
            aria-invalid={Boolean(errors.recruitId)}
          >
            <option value="">Selecione um recruta...</option>
            {recruits.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Produto"
          name="productId"
          required
          error={errors.productId}
          hint={
            selectedProduct
              ? `${selectedProduct.archetype === "PROJECT" ? "Projeto" : "Retainer"} · ${selectedProduct._count.stageTemplates} etapa${selectedProduct._count.stageTemplates === 1 ? "" : "s"}${
                  selectedProduct.typicalDurationDays
                    ? ` · ~${selectedProduct.typicalDurationDays} dias`
                    : ""
                }`
              : undefined
          }
        >
          <Select
            id="productId"
            name="productId"
            value={productId}
            onChange={(e) => setProductId(e.currentTarget.value)}
            required
            aria-invalid={Boolean(errors.productId)}
          >
            <option value="">Selecione um produto...</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Nome de código"
          name="codeName"
          required
          hint="Como o squad vai chamar essa operação no dia a dia."
          error={errors.codeName}
        >
          <Input
            id="codeName"
            name="codeName"
            defaultValue={defaults?.codeName ?? ""}
            placeholder="Ex: Operação Maternidade Vida"
            required
            aria-invalid={Boolean(errors.codeName)}
          />
        </Field>

        <Field
          label="Responsável (squad)"
          name="ownerId"
          error={errors.ownerId}
        >
          <Select
            id="ownerId"
            name="ownerId"
            defaultValue={defaults?.ownerId ?? ""}
          >
            <option value="">Ninguém atribuído</option>
            {squadMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name ?? m.email}
              </option>
            ))}
          </Select>
        </Field>
      </FormSection>

      <FormSection
        title="Cronograma"
        description="Data de início e meta de encerramento (opcional)."
      >
        <Field label="Início" name="startedAt" error={errors.startedAt}>
          <Input
            id="startedAt"
            name="startedAt"
            type="date"
            defaultValue={todayIso()}
            aria-invalid={Boolean(errors.startedAt)}
          />
        </Field>

        <Field
          label="Meta de encerramento"
          name="targetEndAt"
          hint="Em branco para operações contínuas (retainers)."
          error={errors.targetEndAt}
        >
          <Input
            id="targetEndAt"
            name="targetEndAt"
            type="date"
            aria-invalid={Boolean(errors.targetEndAt)}
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
          {pending ? "Mobilizando..." : submitLabel}
        </Button>
      </footer>
    </form>
  );
}
