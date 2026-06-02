import Link from "next/link";
import { IconTargetArrow } from "@tabler/icons-react";
import { PageHeader } from "@/components/squad/page-header";
import { buttonVariants } from "@/components/ui/button";
import { BriefingForm } from "@/components/briefing/briefing-form";
import { createBriefingAction } from "@/lib/actions/briefing";
import { listOperations } from "@/lib/queries/operation";

export const metadata = { title: "Registrar briefing — Squad Five" };
export const dynamic = "force-dynamic";

type SearchParams = Promise<{ operationId?: string }>;

export default async function NovoBriefingPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const ops = await listOperations({ status: "all", health: "all" });
  const activeOps = ops.filter((op) => op.status === "ATIVA");

  if (activeOps.length === 0) {
    return (
      <div className="flex flex-col gap-5 max-w-3xl mx-auto w-full">
        <PageHeader
          title="Registrar briefing"
          subtitle="Briefings precisam de uma operação ativa."
        />
        <section className="surface-raised p-10 flex flex-col items-center text-center gap-4">
          <p className="text-text-secondary text-[13px] max-w-md">
            Nenhuma operação ativa. Mobilize uma primeiro — depois registre o
            briefing.
          </p>
          <Link
            href="/operacoes/nova"
            className={buttonVariants({ variant: "primary", size: "md" })}
          >
            <IconTargetArrow size={14} aria-hidden />
            Mobilizar operação
          </Link>
        </section>
      </div>
    );
  }

  const options = activeOps.map((op) => ({
    id: op.id,
    label: `${op.codeName} · ${op.recruit.name}`,
  }));

  return (
    <div className="flex flex-col gap-5 max-w-3xl mx-auto w-full">
      <PageHeader
        title="Registrar briefing"
        subtitle="Anote presentes, decisões e NPS pós-reunião."
      />
      <BriefingForm
        action={createBriefingAction}
        operations={options}
        fixedOperationId={sp.operationId}
        cancelHref="/briefings"
      />
    </div>
  );
}
