import * as Sentry from "@sentry/nextjs";

/*
  Wrapper que loga em dev e usa Sentry em produção.
  Sentry só inicializa se SENTRY_DSN estiver setado nas env vars.
*/

const SENTRY_ENABLED = Boolean(process.env.SENTRY_DSN);

if (SENTRY_ENABLED && typeof window !== "undefined") {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.1,
    enabled: process.env.NODE_ENV === "production",
  });
}

export function captureError(
  error: unknown,
  context?: Record<string, unknown>,
) {
  if (process.env.NODE_ENV !== "production") {
    console.error("[Squad5 error]", error, context);
    return;
  }
  if (SENTRY_ENABLED) {
    Sentry.captureException(error, { extra: context });
  }
}

export function captureMessage(
  message: string,
  level: "info" | "warning" | "error" = "info",
) {
  if (process.env.NODE_ENV !== "production") {
    console.log(`[Squad5 ${level}]`, message);
    return;
  }
  if (SENTRY_ENABLED) {
    Sentry.captureMessage(message, level);
  }
}
