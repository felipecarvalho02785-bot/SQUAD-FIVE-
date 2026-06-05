"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import { OperationStatus } from "@prisma/client";
import {
  IconTarget,
  IconPlayerPlay,
  IconPlayerPause,
  IconLogout2,
} from "@tabler/icons-react";
import { toast } from "sonner";
import {
  pauseOperationAction,
  resumeOperationAction,
  extractOperationAction,
} from "@/lib/actions/operation";
import { cn } from "@/lib/utils";

interface KanbanOp {
  id: string;
  codeName: string;
  status: OperationStatus;
  recruit: { name: string };
  product: { name: string };
  stages: Array<{ status: string; name: string; order: number }>;
}

interface DraggableKanbanProps {
  operations: KanbanOp[];
}

const COLUMNS: Array<{
  status: OperationStatus;
  label: string;
  headerClass: string;
  countClass: string;
  description: string;
}> = [
  {
    status: OperationStatus.ATIVA,
    label: "Ativas",
    headerClass: "border-status-ok",
    countClass: "text-status-ok-text",
    description: "Em execução",
  },
  {
    status: OperationStatus.PAUSADA,
    label: "Pausadas",
    headerClass: "border-status-warn",
    countClass: "text-status-warn-text",
    description: "Freeze temporário",
  },
  {
    status: OperationStatus.ENCERRADA,
    label: "Encerradas",
    headerClass: "border-border-default",
    countClass: "text-text-secondary",
    description: "Operações finalizadas",
  },
];

function OpCard({
  op,
  dragging = false,
}: {
  op: KanbanOp;
  dragging?: boolean;
}) {
  const totalStages = op.stages.length || 1;
  const doneStages = op.stages.filter((s) => s.status === "CUMPRIDA").length;
  const progress = Math.round((doneStages / totalStages) * 100);
  const current = op.stages.find((s) => s.status === "EM_ANDAMENTO");

  return (
    <div
      className={cn(
        "surface-raised p-3 flex flex-col gap-2 group select-none",
        dragging && "ring-2 ring-bronze/60 shadow-lg",
      )}
    >
      <header className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <IconTarget
            size={12}
            stroke={1.5}
            className="text-bronze shrink-0"
            aria-hidden
          />
          <span className="text-text-primary text-[12px] font-medium truncate">
            {op.codeName}
          </span>
        </div>
      </header>
      <p className="text-text-dim text-[10px] truncate">{op.recruit.name}</p>
      {current ? (
        <p className="text-text-secondary text-[10px] truncate">
          {current.order}. {current.name}
        </p>
      ) : null}
      <div className="h-1 rounded-full bg-surface-base/60 overflow-hidden ring-1 ring-border-default/40">
        <div
          className="h-full bar-gradient-warm"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function DraggableCard({ op }: { op: KanbanOp }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: op.id,
    data: { op },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{ opacity: isDragging ? 0.3 : 1 }}
      className="cursor-grab active:cursor-grabbing"
    >
      <Link
        href={`/operacoes/${op.id}`}
        onClick={(e) => {
          if (isDragging) e.preventDefault();
        }}
        className="block"
      >
        <OpCard op={op} />
      </Link>
    </div>
  );
}

function DroppableColumn({
  status,
  label,
  description,
  headerClass,
  countClass,
  ops,
  Icon,
}: {
  status: OperationStatus;
  label: string;
  description: string;
  headerClass: string;
  countClass: string;
  ops: KanbanOp[];
  Icon: typeof IconPlayerPlay;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <section
      ref={setNodeRef}
      className={cn(
        "surface-deep border-t-2 rounded-card flex flex-col min-h-[300px] transition-colors",
        headerClass,
        isOver && "bg-surface-accent/30 ring-2 ring-accent/40",
      )}
      aria-label={label}
    >
      <header className="px-4 py-3 flex items-center justify-between border-b border-border-default/60">
        <div className="flex items-center gap-2">
          <Icon
            size={14}
            stroke={1.5}
            className="text-text-secondary"
            aria-hidden
          />
          <h2 className="label-display text-[11px] text-text-primary">
            {label}
          </h2>
        </div>
        <span className={cn("font-mono text-[12px]", countClass)}>
          {ops.length}
        </span>
      </header>
      <p className="px-4 py-1 text-text-dim text-[10px]">{description}</p>

      <div className="p-2 flex flex-col gap-2 flex-1">
        {ops.length === 0 ? (
          <p className="text-center text-text-dim text-[11px] py-8">
            {isOver ? "Solte aqui" : "Vazio"}
          </p>
        ) : (
          ops.map((op) => <DraggableCard key={op.id} op={op} />)
        )}
      </div>
    </section>
  );
}

const ICON_BY_STATUS: Record<OperationStatus, typeof IconPlayerPlay> = {
  ATIVA: IconPlayerPlay,
  PAUSADA: IconPlayerPause,
  ENCERRADA: IconLogout2,
};

export function DraggableKanban({ operations }: DraggableKanbanProps) {
  const [items, setItems] = useState(operations);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    }),
  );

  const grouped: Record<OperationStatus, KanbanOp[]> = {
    ATIVA: [],
    PAUSADA: [],
    ENCERRADA: [],
  };
  for (const op of items) {
    grouped[op.status].push(op);
  }

  function handleDragStart(event: DragStartEvent) {
    setDraggingId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setDraggingId(null);
    const { active, over } = event;
    if (!over) return;
    const op = items.find((o) => o.id === active.id);
    if (!op) return;
    const newStatus = over.id as OperationStatus;
    if (op.status === newStatus) return;

    // Otimistic update
    setItems((prev) =>
      prev.map((o) => (o.id === op.id ? { ...o, status: newStatus } : o)),
    );

    startTransition(async () => {
      try {
        if (newStatus === OperationStatus.PAUSADA) {
          await pauseOperationAction(op.id);
        } else if (newStatus === OperationStatus.ATIVA) {
          await resumeOperationAction(op.id);
        } else if (newStatus === OperationStatus.ENCERRADA) {
          await extractOperationAction(op.id);
        }
        toast.success(`${op.codeName} → ${newStatus.toLowerCase()}`);
      } catch (err) {
        // Reverte
        setItems((prev) =>
          prev.map((o) => (o.id === op.id ? { ...o, status: op.status } : o)),
        );
        toast.error(`Falha ao mover: ${(err as Error).message}`);
      }
    });
  }

  const draggingOp = draggingId
    ? items.find((o) => o.id === draggingId)
    : null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {COLUMNS.map((col) => (
          <DroppableColumn
            key={col.status}
            status={col.status}
            label={col.label}
            description={col.description}
            headerClass={col.headerClass}
            countClass={col.countClass}
            ops={grouped[col.status]}
            Icon={ICON_BY_STATUS[col.status]}
          />
        ))}
      </div>
      <DragOverlay>
        {draggingOp ? <OpCard op={draggingOp} dragging /> : null}
      </DragOverlay>
      {pending ? (
        <p className="fixed bottom-24 left-1/2 -translate-x-1/2 z-toast surface-raised px-4 py-2 text-[11px] text-text-secondary">
          Sincronizando...
        </p>
      ) : null}
    </DndContext>
  );
}
