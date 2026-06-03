import { PostHog } from "posthog-node";

const POSTHOG_ENABLED = Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY);

let client: PostHog | null = null;
function getClient(): PostHog | null {
  if (!POSTHOG_ENABLED) return null;
  if (!client) {
    client = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
      flushAt: 1,
      flushInterval: 1000,
    });
  }
  return client;
}

interface TrackParams {
  event: string;
  userId?: string | null;
  properties?: Record<string, unknown>;
}

export function track({ event, userId, properties }: TrackParams) {
  if (process.env.NODE_ENV !== "production") {
    console.log(`[Squad5 track] ${event}`, { userId, properties });
    return;
  }
  const c = getClient();
  if (!c) return;
  c.capture({
    distinctId: userId ?? "anonymous",
    event,
    properties,
  });
}

export const EVENTS = {
  RECRUIT_CREATED: "recruit_created",
  RECRUIT_UPDATED: "recruit_updated",
  OPERATION_MOBILIZED: "operation_mobilized",
  STAGE_ADVANCED: "stage_advanced",
  OPERATION_COMPLETED: "operation_completed",
  BRIEFING_REGISTERED: "briefing_registered",
  ORDER_CREATED: "order_created",
  ORDER_COMPLETED: "order_completed",
  GAP_RESOLVED: "gap_resolved",
  LIBRARY_ITEM_CREATED: "library_item_created",
} as const;
