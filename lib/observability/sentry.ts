/*
  Sentry stub. Para ativar:

  1. npm install @sentry/nextjs
  2. npx @sentry/wizard@latest -i nextjs
  3. Adicionar SENTRY_DSN no .env (e Vercel)

  Por enquanto este módulo expõe `captureError` que loga no console em
  dev — quando Sentry estiver instalado, esta função vira passthrough
  pra Sentry.captureException.
*/

export function captureError(error: unknown, context?: Record<string, unknown>) {
  if (process.env.NODE_ENV !== "production") {
    console.error("[Squad5 error]", error, context);
  }
  // Quando @sentry/nextjs estiver instalado:
  // Sentry.captureException(error, { extra: context });
}

export function captureMessage(message: string, level: "info" | "warning" | "error" = "info") {
  if (process.env.NODE_ENV !== "production") {
    console.log(`[Squad5 ${level}]`, message);
  }
  // Sentry.captureMessage(message, level);
}
