import { IconUsersGroup } from "@tabler/icons-react";
import { PageHeader } from "@/components/squad/page-header";
import { OrderListItem } from "@/components/ordem/order-list-item";
import { OrderForm } from "@/components/ordem/order-form";
import { FeedbackBanner } from "@/components/squad/feedback-banner";
import { listSquadTasks, listSquadTasksCompleted } from "@/lib/queries/order";
import { listSquadMembers } from "@/lib/queries/user";
import { createOrderAction } from "@/lib/actions/order";

export const metadata = { title: "Tarefas do Squad — Squad Five" };
export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const JUST_MESSAGES: Record<string, string> = {
  "order-created": "Tarefa do squad criada.",
  "order-deleted": "Tarefa removida.",
};

export default async function SquadTasksPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const justKey = Array.isArray(sp.just) ? sp.just[0] : sp.just;
  const justMessage = justKey ? JUST_MESSAGES[justKey] : undefined;

  const [pendentes, cumpridas, squadMembers] = await Promise.all([
    listSquadTasks(),
    listSquadTasksCompleted(10),
    listSquadMembers(),
  ]);

  const action = createOrderAction.bind(null, "/squad-tasks");

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Tarefas do Squad"
        subtitle={
          pendentes.length === 0
            ? "Nenhuma rotina interna pendente."
            : `${pendentes.length} tarefa${pendentes.length === 1 ? "" : "s"} interna${pendentes.length === 1 ? "" : "s"} pendente${pendentes.length === 1 ? "" : "s"}.`
        }
      />

      {justMessage ? <FeedbackBanner message={justMessage} /> : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 flex flex-col gap-3">
          <section className="surface-raised p-4 flex flex-col gap-3">
            <header className="flex items-center gap-2">
              <h2 className="label-display text-[11px] text-text-primary">
                Pendentes
              </h2>
              <span className="font-mono text-[11px] text-bronze">
                {pendentes.length}
              </span>
            </header>
            {pendentes.length === 0 ? (
              <div className="py-8 flex flex-col items-center text-center gap-2">
                <IconUsersGroup
                  size={26}
                  className="text-status-ok"
                  stroke={1.5}
                  aria-hidden
                />
                <p className="text-text-secondary text-[13px]">
                  Quartel limpo. Nenhuma rotina interna em aberto.
                </p>
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {pendentes.map((order) => (
                  <li key={order.id}>
                    <OrderListItem
                      order={order}
                      redirectTo="/squad-tasks"
                      showContext={false}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>

          {cumpridas.length > 0 ? (
            <section className="surface-raised p-4 flex flex-col gap-3">
              <header className="flex items-center gap-2">
                <h2 className="label-display text-[11px] text-text-secondary">
                  Cumpridas recentemente
                </h2>
                <span className="font-mono text-[11px] text-status-ok-text">
                  {cumpridas.length}
                </span>
              </header>
              <ul className="flex flex-col gap-2">
                {cumpridas.map((order) => (
                  <li key={order.id}>
                    <OrderListItem
                      order={order}
                      redirectTo="/squad-tasks"
                      showContext={false}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className="flex flex-col gap-3">
          <section className="surface-raised p-4 flex flex-col gap-3">
            <header className="flex items-center gap-2">
              <h2 className="label-display text-[11px] text-text-primary">
                Nova tarefa
              </h2>
            </header>
            <OrderForm
              action={action}
              squadMembers={squadMembers}
              fixedSquadTask
              cancelHref="/squad-tasks"
            />
          </section>
        </aside>
      </div>
    </div>
  );
}
