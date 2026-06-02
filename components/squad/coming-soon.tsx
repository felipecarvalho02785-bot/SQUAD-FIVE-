import { IconBuildingFortress, IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import { PageHeader } from "@/components/squad/page-header";

interface ComingSoonProps {
  title: string;
  subtitle: string;
  sprint: string;
  description: string;
}

export function ComingSoon({
  title,
  subtitle,
  sprint,
  description,
}: ComingSoonProps) {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title={title} subtitle={subtitle} />

      <section className="surface-raised p-10 flex flex-col items-center text-center gap-4">
        <div className="w-14 h-14 rounded-full bg-surface-accent border border-border-strong flex items-center justify-center">
          <IconBuildingFortress
            size={26}
            stroke={1.5}
            className="text-bronze"
            aria-hidden
          />
        </div>
        <div className="flex flex-col gap-2 max-w-md">
          <span className="label-display text-[10px] text-bronze">
            {sprint}
          </span>
          <h2 className="font-display text-[20px] font-medium leading-tight text-text-primary">
            Setor em construção.
          </h2>
          <p className="text-text-secondary text-[13px]">{description}</p>
        </div>
        <Link
          href="/comando"
          className="inline-flex items-center gap-2 min-h-11 h-11 px-5 rounded-input bg-accent-cta text-accent-cta-fg font-display uppercase tracking-[0.05em] text-[12px] font-medium hover:bg-accent-hover active:scale-[0.98] transition-all"
        >
          <IconArrowLeft size={14} aria-hidden />
          Voltar ao Comando Central
        </Link>
      </section>
    </div>
  );
}
