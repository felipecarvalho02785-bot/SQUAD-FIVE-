/*
  Calculo de saude da operacao.
  Regra de negocio critica — referencia: docs/01_ESBOCO_PROJETO_V2.md secao 10.1
  e docs/04_CLAUDE_CODE_BRIEFING.md secao "Regra de negocio critica".

  Esta implementacao trabalha com tipos do dominio puros (sem Prisma) para
  poder ser testada isoladamente. As funcoes de adapter ficam em lib/db.
*/

export type HealthStatus =
  | "em_campo"
  | "atencao"
  | "baixa_iminente"
  | "extracao";

export type OperationStatus = "ativa" | "pausada" | "encerrada";

export interface HealthOrder {
  due_date: Date | null;
  status: "a_fazer" | "em_andamento" | "cumprida";
}

export interface HealthStage {
  sla_days: number;
  started_at: Date | null;
}

export interface HealthOperationInput {
  status: OperationStatus;
  orders: HealthOrder[];
  currentStage: HealthStage | null;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function daysUntil(target: Date | null, now: Date = new Date()): number {
  if (!target) return Number.POSITIVE_INFINITY;
  return Math.floor(
    (startOfDay(target).getTime() - startOfDay(now).getTime()) / MS_PER_DAY,
  );
}

export function daysInStage(
  stage: HealthStage,
  now: Date = new Date(),
): number {
  if (!stage.started_at) return 0;
  return Math.floor(
    (startOfDay(now).getTime() - startOfDay(stage.started_at).getTime()) /
      MS_PER_DAY,
  );
}

export function calculateHealth(
  op: HealthOperationInput,
  now: Date = new Date(),
): HealthStatus {
  if (op.status === "pausada" || op.status === "encerrada") {
    return "extracao";
  }

  const hasOverdueOrder = op.orders.some(
    (o) =>
      o.status !== "cumprida" &&
      o.due_date !== null &&
      daysUntil(o.due_date, now) < 0,
  );

  const slaExceeded =
    op.currentStage !== null &&
    daysInStage(op.currentStage, now) > op.currentStage.sla_days;

  if (hasOverdueOrder || slaExceeded) {
    return "baixa_iminente";
  }

  const orderNearDue = op.orders.some(
    (o) =>
      o.status !== "cumprida" &&
      o.due_date !== null &&
      daysUntil(o.due_date, now) <= 2,
  );

  const slaNearLimit =
    op.currentStage !== null &&
    op.currentStage.sla_days - daysInStage(op.currentStage, now) <= 2;

  if (orderNearDue || slaNearLimit) {
    return "atencao";
  }

  return "em_campo";
}
