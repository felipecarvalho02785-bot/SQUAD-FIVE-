import Link from "next/link";
import { IconUser, IconChevronRight } from "@tabler/icons-react";
import type { OrderListItem as OrderItem } from "@/lib/queries/order";
import { OrderStatusButton } from "./order-status-button";
import { DDayBadge } from "./dday-badge";
import { cn } from "@/lib/utils";

interface OrderListItemProps {
  order: OrderItem;
  redirectTo: string;
  showContext?: boolean;
  className?: string;
}

export function OrderListItem({
  order,
  redirectTo,
  showContext = true,
  className,
}: OrderListItemProps) {
  const isDone = order.status === "CUMPRIDA";
  const responsible =
    order.assignee?.name ??
    order.assignee?.email ??
    order.externalAssignee ??
    null;

  return (
    <article
      className={cn(
        "flex items-center gap-3 p-3 rounded-card bg-surface-deep border border-border-default/60",
        "lift-hover",
        className,
      )}
    >
      <OrderStatusButton
        orderId={order.id}
        status={order.status}
        redirectTo={redirectTo}
        size="sm"
      />

      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <span
          className={cn(
            "text-[13px] truncate",
            isDone ? "text-text-dim line-through" : "text-text-primary",
          )}
        >
          {order.title}
        </span>
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
