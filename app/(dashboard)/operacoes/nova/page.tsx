import Link from "next/link";
import { PageHeader } from "@/components/squad/page-header";
import { buttonVariants } from "@/components/ui/button";
import { OperationForm } from "@/components/operacao/operation-form";
import { createOperationAction } from "@/lib/actions/operation";
import { listActiveProducts } from "@/lib/queries/product";
import {
  listActiveRecruitsLite,
  listSquadMembers,
} from "@/lib/queries/user";
import { IconUserPlus } from "@tabler/icons-react";

export const metadata = { title: "Mobilizar operação — Squad Five" };
export const dynamic = "force-dynamic";

type SearchParams = Promise<{ recruitId?: string }>;

export default async function NovaOperacaoPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const [recruits, products, squadMembers] = await Promise.all([
    listActiveRecruitsLite(),
    listActiveProducts(),
    listSquadMembers(),
  ]);

  if (recruits.length === 0) {
    return (
      <div className="flex flex-col gap-5 max-w-3xl mx-auto w-full">
        <PageHeader
          title="Mobilizar operação"
          subtitle="Toda operação precisa de um recruta."
        />
        <section className="surface-raised p-10 flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-surface-accent border border-border-strong flex items-center justify-center">
            <IconUserPlus
              size={26}
              stroke={1.5}
              className="text-bronze"
              aria-hidden
            />
          </div>
          <div className="flex flex-col gap-2 max-w-md">
            <h2 className="font-display text-[20px] font-medium leading-tight text-text-primary">
              Nenhum recruta ativo.
            </h2>
            <p className="text-text-secondary text-[13px]">
              Recrute primeiro um cliente. Depois você mobiliza a operação dele.
            </p>
          </div>
          <Link
            href="/recrutas/novo"
            className={buttonVariants({ variant: "primary", size: "md" })}
          >
            <IconUserPlus size={14} aria-hidden />
            Recrutar novo
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 max-w-3xl mx-auto w-full">
      <PageHeader
        title="Mobilizar operação"
        subtitle="Vincula um recruta a um produto e copia o template de etapas."
      />
      <OperationForm
        action={createOperationAction}
        recruits={recruits}
        products={products}
        squadMembers={squadMembers}
        defaults={{ recruitId: sp.recruitId }}
        submitLabel="Mobilizar operação"
        cancelHref="/operacoes"
      />
    </div>
  );
}
