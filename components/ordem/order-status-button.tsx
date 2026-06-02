"use client";

import { useTransition } from "react";
import { OrderStatus } from "@prisma/client";
import { IconCheck, IconCircle, IconClock } from "@tabler/icons-react";
import { updateOrderStatusAction } from "@/lib/actions/order";
import { cn } from "@/lib/utils";

/*
  OrderStatusButton — botao circular que cicla A_FAZER -> EM_ANDAMENTO
  -> CUMPRIDA -> A_FAZER. Usa Server Action por baixo.
*/

const NEXT: Record<OrderStatus, OrderStatus> = {
  A_FAZER: OrderStatus.EM_ANDAMENTO,
  EM_ANDAMENTO: OrderStatus.CUMPRIDA,
  CUMPRIDA: OrderStatus.A_FAZER,
};

const LABEL: Record<OrderStatus, string> = {
  A_FAZER: "A fazer — clique para iniciar",
  EM_ANDAMENTO: "Em andamento — clique para cumprir",
  CUMPRIDA: "Cumprida — clique para reabrir",
};

interface OrderStatusButtonProps {
  orderId: string;
  status: OrderStatus;
  redirectTo: string;
  size?: "sm" | "md";
  className?: string;
}

export function OrderStatusButton({
  orderId,
  status,
  redirectTo,
  size = "md",
  className,
}: OrderStatusButtonProps) {
  const [pending, startTransition] = useTransition();

  const Icon =
    status === OrderStatus.CUMPRIDA
      ? IconCheck
      : status === OrderStatus.EM_ANDAMENTO
        ? IconClock
        : IconCircle;

  return (
    <button
      type="button"
      aria-label={LABEL[status]}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await updateOrderStatusAction(orderId, NEXT[status], redirectTo);
        })
      }
      className={cn(
        "shrink-0 inline-flex items-center justify-center rounded-full border transition-all",
        "min-h-11 min-w-11 lg:min-h-9 lg:min-w-9",
        size === "sm" ? "w-7 h-7" : "w-8 h-8",
        status === OrderStatus.CUMPRIDA &&
          "bg-status-ok border-status-ok text-accent-cta-fg",
        status === OrderStatus.EM_ANDAMENTO &&
          "bg-surface-accent border-border-strong text-bronze",
        status === OrderStatus.A_FAZER &&
          "bg-surface-deep border-border-default text-text-dim hover:border-border-strong hover:text-text-primary",
        pending && "opacity-60 cursor-wait",
        className,
      )}
    >
      <Icon
        size={size === "sm" ? 12 : 14}
        stroke={status === OrderStatus.CUMPRIDA ? 2.5 : 1.5}
        aria-hidden
      />
    </button>
  );
}
