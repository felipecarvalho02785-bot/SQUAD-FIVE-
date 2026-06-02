import Link from "next/link";
import { redirect } from "next/navigation";
import { IconCheckbox } from "@tabler/icons-react";
import { auth } from "@/lib/auth";
import { PageHeader } from "@/components/squad/page-header";
import { OrderListItem } from "@/components/ordem/order-list-item";
import { FeedbackBanner } from "@/components/squad/feedback-banner";
import { listMyOrders } from "@/lib/queries/order";

export const metadata = { title: "Minhas Ordens — Squad Five" };
export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const JUST_MESSAGES: Record<string, string> = {
  "order-created": "Ordem cadastrada no rol.",
  "order-deleted": "Ordem removida.",
};

function bucketByDueDate(
  orders: Awaited<ReturnType<typeof listMyOrders>>,
): {
  overdue: typeof orders;
  today: typeof orders;
  upcoming: typeof orders;
} {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);
  const nowMs = now.getTime();
  const startMs = startOfDay.getTime();
  const endMs = endOfDay.getTime();

  const overdue = orders.filter(
    (o) => o.dueDate !== null && o.dueDate.getTime() < nowMs,
  );
  const today = orders.filter(
    (o) =>
      o.dueDate !== null &&
      o.dueDate.getTime() >= startMs &&
      o.dueDate.getTime() < endMs,
  );
  const upcoming = orders.filter(
    (o) =>
      o.dueDate === null ||
      (o.dueDate.getTime() >= nowMs && !today.find((t) => t.id === o.id)),
  );
  return { overdue, today, upcoming };
}

export default async function OrdensPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const sp = await searchParams;
  const justKey = Array.isArray(sp.just) ? sp.just[0] : sp.just;
  const justMessage = justKey ? JUST_MESSAGES[justKey] : undefined;

  const orders = await listMyOrders(session.user.id);
  const { overdue, today, upcoming } = bucketByDueDate(orders);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Minhas Ordens"
        subtitle={
          orders.length === 0
            ? "Sem ordens no seu rol. Setor calmo."
            : `${orders.length} ordem${orders.length === 1 ? "" : "s"} pendente${orders.length === 1 ? "" : "s"}.`
        }
      />

      {justMessage ? <FeedbackBanner message={justMessage} /> : null}

      {orders.length === 0 ? (
        <section className="surface-raised p-10 flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-surface-accent border border-border-strong flex items-center justify-center">
            <IconCheckbox
              size={26}
              stroke={1.5}
              className="text-status-ok"
              aria-hidden
            />
          </div>
          <div className="flex flex-col gap-2 max-w-md">
            <h2 className="font-display text-[20px] font-medium leading-tight text-text-primary">
              Setor calmo.
            </h2>
            <p className="text-text-secondary text-[13px]">
              Nenhuma ordem do dia atribuída a você. Briefings e novas
              operações vão jogar ordens aqui automaticamente.
            </p>
          </div>
        </section>
      ) : (
        <>
          {overdue.length > 0 ? (
            <OrderSection
              title="Atrasadas"
              tone="critical"
              count={overdue.length}
              orders={overdue}
            />
          ) : null}
          {today.length > 0 ? (
            <OrderSection
              title="Hoje"
              tone="warn"
              count={today.length}
              orders={today}
            />
          ) : null}
          <OrderSection
            title="Próximas"
            tone="neutral"
            count={upcoming.length}
            orders={upcoming}
            emptyLabel="Sem ordens futuras pendentes."
          />
        </>
      )}

      <p className="text-text-dim text-[11px] mt-2">
        Para criar uma ordem, abra uma{" "}
        <Link
          href="/operacoes"
          className="text-accent-hover hover:underline underline-offset-2"
        >
          operação
        </Link>
        {" "}ou vá pras{" "}
        <Link
          href="/squad-tasks"
          className="text-accent-hover hover:underline underline-offset-2"
        >
          tarefas internas do squad
        </Link>
        .
      </p>
    </div>
  );
}

function OrderSection({
  title,
  tone,
  count,
  orders,
  emptyLabel,
}: {
  title: string;
  tone: "critical" | "warn" | "neutral";
  count: number;
  orders: Awaited<ReturnType<typeof listMyOrders>>;
  emptyLabel?: string;
}) {
  const toneClass =
    tone === "critical"
      ? "text-status-critical-text"
      : tone === "warn"
        ? "text-status-warn-text"
        : "text-text-secondary";

  return (
    <section className="surface-raised p-4 flex flex-col gap-3">
      <header className="flex items-center gap-2">
        <h2 className="label-display text-[11px] text-text-primary">
          {title}
        </h2>
        <span className={`font-mono text-[11px] ${toneClass}`}>{count}</span>
      </header>
      {orders.length === 0 ? (
        <p className="py-4 text-center text-text-dim text-[12px]">
          {emptyLabel ?? "Nada por aqui."}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {orders.map((order) => (
            <li key={order.id}>
              <OrderListItem order={order} redirectTo="/ordens" />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
