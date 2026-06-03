import { Resend } from "resend";

const RESEND_ENABLED = Boolean(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL ?? "Squad Five <no-reply@e3digital.com>";

let client: Resend | null = null;
function getClient(): Resend | null {
  if (!RESEND_ENABLED) return null;
  if (!client) {
    client = new Resend(process.env.RESEND_API_KEY!);
  }
  return client;
}

interface SendEmailParams {
  to: string | string[];
  subject: string;
  /** Markdown ou HTML simples. Convertemos linhas em <p> se for texto puro. */
  body: string;
}

export async function sendEmail({ to, subject, body }: SendEmailParams) {
  if (process.env.NODE_ENV !== "production") {
    console.log(`[Squad5 email] to=${to} subject="${subject}"`, body);
    return { ok: true, dryRun: true };
  }
  const c = getClient();
  if (!c) {
    console.warn("RESEND_API_KEY ausente — email não enviado:", subject);
    return { ok: false, error: "Resend não configurado" };
  }

  const html = body
    .split("\n\n")
    .map((p) => `<p style="margin: 0 0 12px;">${p.replace(/\n/g, "<br/>")}</p>`)
    .join("");

  try {
    const result = await c.emails.send({
      from: FROM,
      to,
      subject,
      html: `
        <div style="font-family: Inter, system-ui, sans-serif; color: #1a1816; max-width: 560px; margin: 0 auto; padding: 24px;">
          <div style="border-bottom: 2px solid #2f4a2c; padding-bottom: 12px; margin-bottom: 18px;">
            <div style="font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: #6b665d;">
              Squad Five · E3 Digital
            </div>
            <div style="font-size: 18px; font-weight: bold; margin-top: 4px;">${subject}</div>
          </div>
          ${html}
          <div style="margin-top: 24px; padding-top: 12px; border-top: 1px solid #d8d3c4; font-size: 10px; color: #6b665d;">
            Sistema operacional do Squad 5
          </div>
        </div>
      `,
    });
    return { ok: true, id: result.data?.id };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

export const EMAIL_TEMPLATES = {
  orderAssigned: (params: {
    title: string;
    operation?: string;
    dueDate?: string;
  }) => ({
    subject: `Nova ordem do dia: ${params.title}`,
    body: `Você foi atribuído a uma nova ordem do dia.\n\n**${params.title}**\n\n${params.operation ? `Operação: ${params.operation}` : "Tarefa interna do squad"}\n${params.dueDate ? `D-day: ${params.dueDate}` : "Sem prazo definido"}\n\nAcesse o Squad Five pra cumprir.`,
  }),
  briefingSoon: (params: { operation: string; date: string }) => ({
    subject: `Briefing em breve: ${params.operation}`,
    body: `Há um briefing programado.\n\nOperação: ${params.operation}\nData: ${params.date}\n\nAcesse o Squad Five pros detalhes.`,
  }),
  operationRisk: (params: { operation: string; reason: string }) => ({
    subject: `Operação em risco: ${params.operation}`,
    body: `Uma operação que você comanda mudou de estado.\n\nOperação: ${params.operation}\nMotivo: ${params.reason}\n\nAcesse o Squad Five pra ação.`,
  }),
};
