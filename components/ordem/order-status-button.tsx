"use client";

import { useOptimistic, useTransition } from "react";
import { OrderStatus } from "@prisma/client";
import { IconCheck, IconCircle, IconClock } from "@tabler/icons-react";
import { toast } from "sonner";
import { updateOrderStatusOnlyAction } from "@/lib/actions/order";
import { cn } from "@/lib/utils";

/*
  OrderStatusButton — cicla A_FAZER → EM_ANDAMENTO → CUMPRIDA → A_FAZER.
  useOptimistic atualiza visualmente na hora, Server Action sincroniza
  em background, toast confirma sucesso/erro.
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

const TOAST: Record<OrderStatus, string> = {
  A_FAZER: "Ordem reaberta",
  EM_ANDAMENTO: "Ordem em andamento",
  CUMPRIDA: "Missão cumprida.",
};

interface OrderStatusButtonProps {
  orderId: string;
  status: OrderStatus;
  /** Mantido por compatibilidade. Não é mais usado — não redireciona. */
  redirectTo?: string;
  size?: "sm" | "md";
  className?: string;
}

export function OrderStatusButton({
  orderId,
  status,
  size = "md",
  className,
}: OrderStatusButtonProps) {
  const [pending, startTransition] = useTransition();
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(
    status,
    (_prev: OrderStatus, next: OrderStatus) => next,
  );

  const Icon =
    optimisticStatus === OrderStatus.CUMPRIDA
      ? IconCheck
      : optimisticStatus === OrderStatus.EM_ANDAMENTO
        ? IconClock
        : IconCircle;

  function handleClick() {
    const next = NEXT[optimisticStatus];
    startTransition(async () => {
      setOptimisticStatus(next);
      const result = await updateOrderStatusOnlyAction(orderId, next);
      if (result.ok) {
        toast.success(TOAST[next]);
      } else {
        toast.error("Falha ao atualizar status.");
      }
    });
  }

  return (
    <button
      type="button"
      aria-label={LABEL[optimisticStatus]}
      disabled={pending}
      onClick={handleClick}
      className={cn(
        "shrink-0 inline-flex items-center justify-center rounded-full border transition-all",
        "min-h-11 min-w-11 lg:min-h-9 lg:min-w-9",
        size === "sm" ? "w-7 h-7" : "w-8 h-8",
        optimisticStatus === OrderStatus.CUMPRIDA &&
          "bg-status-ok border-status-ok text-accent-cta-fg",
        optimisticStatus === OrderStatus.EM_ANDAMENTO &&
          "bg-surface-accent border-border-strong text-bronze",
        optimisticStatus === OrderStatus.A_FAZER &&
          "bg-surface-deep border-border-default text-text-dim hover:border-border-strong hover:text-text-primary",
        pending && "opacity-70",
        className,
      )}
    >
      <Icon
        size={size === "sm" ? 12 : 14}
        stroke={optimisticStatus === OrderStatus.CUMPRIDA ? 2.5 : 1.5}
        aria-hidden
      />
    </button>
  );
}
