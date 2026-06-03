import { StageStatus } from "@prisma/client";

export interface ActivityEvent {
  type:
    | "operation-created"
    | "stage-completed"
    | "stage-started"
    | "briefing"
    | "gap-opened"
    | "gap-resolved"
    | "order-created"
    | "order-completed"
    | "operation-paused"
    | "operation-resumed"
    | "operation-extracted";
  at: Date;
  title: string;
  detail?: string;
  href?: string;
}

interface OperationLike {
  id: string;
  codeName: string;
  startedAt: Date;
  endedAt: Date | null;
  status: "ATIVA" | "PAUSADA" | "ENCERRADA";
  stages: Array<{
    id: string;
    name: string;
    order: number;
    status: StageStatus;
    startedAt: Date | null;
    completedAt: Date | null;
  }>;
  briefings: Array<{
    id: string;
    date: Date;
    npsScore: number | null;
    createdBy: { name: string | null } | null;
  }>;
  gaps: Array<{
    id: string;
    description: string;
    createdAt: Date;
    resolvedAt: Date | null;
    type: string;
  }>;
}

/*
  Deriva uma timeline de atividades da operação a partir dos dados existentes
  (sem tabela de audit log dedicada). Retorna eventos ordenados do mais
  recente pro mais antigo.
*/
export function buildActivityLog(op: OperationLike): ActivityEvent[] {
  const events: ActivityEvent[] = [];

  events.push({
    type: "operation-created",
    at: op.startedAt,
    title: "Operação mobilizada",
    detail: op.codeName,
  });

  for (const stage of op.stages) {
    if (stage.startedAt && stage.status !== StageStatus.PENDENTE) {
      if (stage.order > 1) {
        events.push({
          type: "stage-started",
          at: stage.startedAt,
          title: `Etapa ${stage.order} iniciada`,
          detail: stage.name,
        });
      }
    }
    if (stage.completedAt) {
      events.push({
        type: "stage-completed",
        at: stage.completedAt,
        title: `Etapa ${stage.order} cumprida`,
        detail: stage.name,
      });
    }
  }

  for (const b of op.briefings) {
    events.push({
      type: "briefing",
      at: b.date,
      title:
        b.npsScore !== null
          ? `Briefing registrado · NPS ${b.npsScore}`
          : "Briefing registrado",
      detail: b.createdBy?.name ? `por ${b.createdBy.name}` : undefined,
    });
  }

  for (const g of op.gaps) {
    events.push({
      type: "gap-opened",
      at: g.createdAt,
      title: `Gap detectado · ${g.type.replace(/_/g, " ")}`,
      detail: g.description,
    });
    if (g.resolvedAt) {
      events.push({
        type: "gap-resolved",
        at: g.resolvedAt,
        title: "Gap resolvido",
        detail: g.description,
      });
    }
  }

  if (op.endedAt) {
    events.push({
      type: "operation-extracted",
      at: op.endedAt,
      title: "Operação encerrada",
    });
  }

  return events.sort((a, b) => b.at.getTime() - a.at.getTime());
}
