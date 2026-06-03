import { IconHistory } from "@tabler/icons-react";
import type { ActivityEventWithRelations } from "@/lib/domain/activity-logger";

interface RecruitActivitySectionProps {
  events: ActivityEventWithRelations[];
}

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

const TYPE_LABEL: Record<string, string> = {
  RECRUIT_CREATED: "Recruta alistado",
  RECRUIT_UPDATED: "Ficha atualizada",
  OPERATION_MOBILIZED: "Operação mobilizada",
  OPERATION_PAUSED: "Operação pausada",
  OPERATION_RESUMED: "Operação retomada",
  OPERATION_EXTRACTED: "Operação encerrada",
  STAGE_ADVANCED: "Etapa avançada",
  BRIEFING_REGISTERED: "Briefing registrado",
  ORDER_CREATED: "Ordem criada",
  ORDER_COMPLETED: "Ordem cumprida",
  GAP_CREATED: "Gap detectado",
  GAP_RESOLVED: "Gap resolvido",
};

export function RecruitActivitySection({
  events,
}: RecruitActivitySectionProps) {
  if (events.length === 0) {
    return (
      <section className="surface-raised p-5 flex flex-col gap-3">
        <header className="flex items-center gap-2">
          <IconHistory
            size={14}
            className="text-bronze"
            stroke={1.5}
            aria-hidden
          />
          <h2 className="label-display text-[11px] text-text-secondary">
            Atividade
          </h2>
        </header>
        <p className="text-text-dim text-[12px] py-4 text-center">
          Sem eventos registrados ainda. Mudanças no recruta e nas operações
          dele aparecem aqui.
        </p>
      </section>
    );
  }

  return (
    <section className="surface-raised p-5 flex flex-col gap-3">
      <header className="flex items-center gap-2">
        <IconHistory
          size={14}
          className="text-bronze"
          stroke={1.5}
          aria-hidden
        />
        <h2 className="label-display text-[11px] text-text-secondary">
          Atividade
        </h2>
        <span className="font-mono text-[11px] text-text-dim">
          {events.length}
        </span>
      </header>
      <ul className="flex flex-col gap-1.5 max-h-[400px] overflow-y-auto">
        {events.map((event) => (
          <li
            key={event.id}
            className="flex items-baseline justify-between gap-3 text-[12px] py-1 border-b border-border-default/40 last:border-0"
          >
            <div className="flex-1 min-w-0">
              <p className="text-text-primary truncate">
                {event.description ?? TYPE_LABEL[event.type] ?? event.type}
              </p>
              {event.actor ? (
                <p className="text-text-dim text-[10px]">
                  por {event.actor.name ?? event.actor.email}
                  {event.operation
                    ? ` · ${event.operation.codeName}`
                    : null}
                </p>
              ) : null}
            </div>
            <span className="font-mono text-[10px] text-text-dim shrink-0">
              {formatDateTime(event.createdAt)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
