"use client";

import { useTransition } from "react";
import { OrderStatus } from "@prisma/client";
import {
  IconCheck,
  IconCircle,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  bulkUpdateOrdersStatusAction,
  bulkDeleteOrdersAction,
} from "@/lib/actions/order";
import { cn } from "@/lib/utils";

interface BulkActionsBarProps {
  selectedIds: Set<string>;
  onClear: () => void;
  className?: string;
}

export function BulkActionsBar({
  selectedIds,
  onClear,
  className,
}: BulkActionsBarProps) {
  const [pending, startTransition] = useTransition();
  const count = selectedIds.size;

  if (count === 0) return null;

  function handleBulkStatus(status: OrderStatus) {
    const ids = Array.from(selectedIds);
    startTransition(async () => {
      const result = await bulkUpdateOrdersStatusAction(ids, status);
      if (result.ok) {
        toast.success(
          status === OrderStatus.CUMPRIDA
            ? `${count} ordens cumpridas`
            : `${count} ordens atualizadas`,
        );
        onClear();
      } else {
        toast.error("Falha ao atualizar ordens");
      }
    });
  }

  function handleBulkDelete() {
    if (!confirm(`Remover ${count} ordens? Esta ação não pode ser desfeita.`))
      return;
    const ids = Array.from(selectedIds);
    startTransition(async () => {
      const result = await bulkDeleteOrdersAction(ids);
      if (result.ok) {
        toast.success(`${count} ordens removidas`);
        onClear();
      } else {
        toast.error("Falha ao remover ordens");
      }
    });
  }

  return (
    <div
      className={cn(
        "sticky top-[68px] z-sticky surface-raised flex items-center justify-between gap-3 px-4 py-3 border-2 border-accent/40",
        className,
      )}
      role="toolbar"
      aria-label="Ações em massa"
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onClear}
          aria-label="Limpar seleção"
          className="text-text-dim hover:text-text-primary"
        >
          <IconX size={14} stroke={1.5} aria-hidden />
        </button>
        <span className="text-text-primary text-[13px] font-medium">
          {count} {count === 1 ? "ordem selecionada" : "ordens selecionadas"}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="primary"
          size="sm"
          disabled={pending}
          onClick={() => handleBulkStatus(OrderStatus.CUMPRIDA)}
        >
          <IconCheck size={12} aria-hidden />
          Cumprir todas
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={pending}
          onClick={() => handleBulkStatus(OrderStatus.A_FAZER)}
        >
          <IconCircle size={12} aria-hidden />
          Reabrir
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={pending}
          onClick={handleBulkDelete}
        >
          <IconTrash size={12} aria-hidden />
          Remover
        </Button>
      </div>
    </div>
  );
}
