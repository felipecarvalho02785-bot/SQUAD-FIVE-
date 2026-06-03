"use client";

import { useState } from "react";
import { IconCheckbox, IconSquare } from "@tabler/icons-react";
import type { OrderListItem as OrderItem } from "@/lib/queries/order";
import { OrderListItem } from "./order-list-item";
import { BulkActionsBar } from "./bulk-actions-bar";

interface OrdersBulkListProps {
  orders: OrderItem[];
  redirectTo: string;
  showContext?: boolean;
  emptyLabel?: string;
}

export function OrdersBulkList({
  orders,
  redirectTo,
  showContext = true,
  emptyLabel,
}: OrdersBulkListProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function selectAll() {
    setSelectedIds(new Set(orders.map((o) => o.id)));
  }

  function clear() {
    setSelectedIds(new Set());
  }

  if (orders.length === 0) {
    return (
      <p className="py-4 text-center text-text-dim text-[12px]">
        {emptyLabel ?? "Nada por aqui."}
      </p>
    );
  }

  const allSelected = selectedIds.size === orders.length;

  return (
    <div className="flex flex-col gap-3">
      <BulkActionsBar selectedIds={selectedIds} onClear={clear} />

      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={allSelected ? clear : selectAll}
          className="inline-flex items-center gap-1.5 text-[11px] text-text-dim hover:text-text-primary transition-colors"
        >
          {allSelected ? (
            <>
              <IconCheckbox size={12} stroke={1.5} aria-hidden />
              Desmarcar todas
            </>
          ) : (
            <>
              <IconSquare size={12} stroke={1.5} aria-hidden />
              Selecionar todas
            </>
          )}
        </button>
      </div>

      <ul className="flex flex-col gap-2">
        {orders.map((order) => (
          <li key={order.id}>
            <OrderListItem
              order={order}
              redirectTo={redirectTo}
              showContext={showContext}
              selectable
              selected={selectedIds.has(order.id)}
              onToggleSelect={toggleOne}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
