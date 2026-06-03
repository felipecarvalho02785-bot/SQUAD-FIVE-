import Link from "next/link";
import { IconUser, IconChevronRight, IconRepeat } from "@tabler/icons-react";
import type { OrderListItem as OrderItem } from "@/lib/queries/order";
import { OrderStatusButton } from "./order-status-button";
import { DDayBadge } from "./dday-badge";
import {
  FREQUENCY_LABELS,
  type RecurrenceFrequency,
} from "@/lib/schemas/order";
import { cn } from "@/lib/utils";

function getRecurrenceLabel(recurring: unknown): string | null {
  if (!recurring || typeof recurring !== "object") return null;
  const r = recurring as { frequency?: string };
  if (!r.frequency) return null;
  return FREQUENCY_LABELS[r.frequency as RecurrenceFrequency] ?? null;
}

interface OrderListItemProps {
  order: OrderItem;
  redirectTo: string;
  showContext?: boolean;
  /** Checkbox de seleção para bulk actions. */
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: (orderId: string) => void;
  className?: string;
}

export function OrderListItem({
  order,
  redirectTo,
  showContext = true,
  selectable = false,
  selected = false,
  onToggleSelect,
  className,
}: OrderListItemProps) {
  const isDone = order.status === "CUMPRIDA";
  const responsible =
    order.assignee?.name ??
    order.assignee?.email ??
    order.externalAssignee ??
    null;
  const recurrenceLabel = getRecurrenceLabel(
    (order as { recurring?: unknown }).recurring,
  );

  return (
    <article
      className={cn(
        "flex items-center gap-3 p-3 rounded-card bg-surface-deep border border-border-default/60",
        "lift-hover",
        selected && "ring-2 ring-accent/60 bg-surface-accent/20",
        className,
      )}
    >
      {selectable ? (
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect?.(order.id)}
          aria-label={`Selecionar ordem ${order.title}`}
          className="w-4 h-4 accent-bronze shrink-0"
        />
      ) : null}

      <OrderStatusButton
        orderId={order.id}
        status={order.status}
        redirectTo={redirectTo}
        size="sm"
      />

      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={cn(
              "text-[13px] truncate",
              isDone ? "text-text-dim line-through" : "text-text-primary",
            )}
          >
            {order.title}
          </span>
          {recurrenceLabel ? (
            <span
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-accent/15 text-accent text-[9px] font-display uppercase tracking-[0.06em] shrink-0"
              title={`Recorrência ${recurrenceLabel}`}
            >
              <IconRepeat size={9} stroke={2} aria-hidden />
              {recurrenceLabel}
            </span>
          ) : null}
        </div>
        {showContext && order.stage ? (
          <Link
            href={`/operacoes/${order.stage.operation.id}`}
            className="text-text-dim text-[11px] truncate hover:text-text-secondary inline-flex items-center gap-1 group/op"
          >
            {order.stage.operation.codeName}
            <IconChevronRight size={10} aria-hidden />
            {order.stage.name}
          </Link>
        ) : null}
        {showContext && order.squadTask ? (
          <span className="text-text-dim text-[11px] italic">
            Tarefa interna do squad
          </span>
        ) : null}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {responsible ? (
          <span
            className="hidden sm:inline-flex items-center gap-1 text-[11px] text-text-dim"
            title={responsible}
          >
            <IconUser size={11} stroke={1.5} aria-hidden />
            <span className="max-w-[100px] truncate">{responsible}</span>
          </span>
        ) : null}
        <DDayBadge dueDate={order.dueDate} completed={isDone} />
      </div>
    </article>
  );
}
