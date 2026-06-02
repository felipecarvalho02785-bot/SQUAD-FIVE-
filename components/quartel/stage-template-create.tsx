"use client";

import { useActionState } from "react";
import { IconPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/form/input";
import {
  createStageTemplateAction,
  type ActionResult,
} from "@/lib/actions/template";

interface StageTemplateCreateProps {
  productId: string;
}

export function StageTemplateCreate({ productId }: StageTemplateCreateProps) {
  const [state, formAction, pending] = useActionState<
    ActionResult | undefined,
    FormData
  >(createStageTemplateAction, undefined);

  return (
    <form
      action={formAction}
      className="flex items-end gap-2 p-3 rounded-card bg-surface-base/40 border border-dashed border-border-default"
    >
      <input type="hidden" name="productId" value={productId} />
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <label
          htmlFor={`new-name-${productId}`}
          className="label-display text-[9px] text-text-secondary"
        >
          Nova etapa
        </label>
        <Input
          id={`new-name-${productId}`}
          name="name"
          placeholder="Ex: Validação técnica"
          required
        />
      </div>
      <div className="w-24 flex flex-col gap-1">
        <label
          htmlFor={`new-sla-${productId}`}
          className="label-display text-[9px] text-text-secondary"
        >
          SLA (dias)
        </label>
        <Input
          id={`new-sla-${productId}`}
          name="slaDays"
          type="number"
          min="1"
          max="365"
          defaultValue={7}
          required
        />
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        <IconPlus size={12} aria-hidden />
        {pending ? "..." : "Adicionar"}
      </Button>
      {state && !state.ok ? (
        <span className="text-status-critical-text text-[11px] ml-2">
          {state.error}
        </span>
      ) : null}
    </form>
  );
}
