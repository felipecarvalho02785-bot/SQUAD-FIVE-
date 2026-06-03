/*
  PostHog stub. Para ativar:

  1. npm install posthog-js posthog-node
  2. Criar conta em https://posthog.com e pegar API key
  3. Adicionar NEXT_PUBLIC_POSTHOG_KEY e NEXT_PUBLIC_POSTHOG_HOST no .env

  Quando estiver ativo, chame `track` em ações chave (recruta criado,
  operação mobilizada, etapa avançada, briefing registrado).
*/

interface TrackParams {
  event: string;
  userId?: string | null;
  properties?: Record<string, unknown>;
}

export function track({ event, userId, properties }: TrackParams) {
  if (process.env.NODE_ENV !== "production") {
    console.log(`[Squad5 track] ${event}`, { userId, properties });
  }
  // Quando posthog-node estiver instalado:
  // const client = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, { host: ... });
  // client.capture({ distinctId: userId ?? 'anonymous', event, properties });
}

export const EVENTS = {
  RECRUIT_CREATED: "recruit_created",
  RECRUIT_UPDATED: "recruit_updated",
  OPERATION_MOBILIZED: "operation_mobilized",
  STAGE_ADVANCED: "stage_advanced",
  BRIEFING_REGISTERED: "briefing_registered",
  ORDER_CREATED: "order_created",
  ORDER_COMPLETED: "order_completed",
  GAP_RESOLVED: "gap_resolved",
  LIBRARY_ITEM_CREATED: "library_item_created",
} as const;
