import Link from "next/link";
import { notFound } from "next/navigation";
import {
  IconArrowLeft,
  IconBrandGoogleDrive,
  IconEdit,
  IconExternalLink,
  IconUser,
} from "@tabler/icons-react";
import { PageHeader } from "@/components/squad/page-header";
import { FeedbackBanner } from "@/components/squad/feedback-banner";
import { buttonVariants } from "@/components/ui/button";
import { CopyButton } from "@/components/biblioteca/copy-button";
import { getLibraryItemById } from "@/lib/queries/library";
import { CATEGORY_LABEL, CATEGORY_TONE } from "@/lib/library-meta";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const JUST_MESSAGES: Record<string, string> = {
  created: "Item adicionado à biblioteca.",
  updated: "Item atualizado.",
};

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(date);
}

export async function generateMetadata({ params }: { params: Params }) {
  const { id } = await params;
  const item = await getLibraryItemById(id);
  return {
    title: item ? `${item.title} — Biblioteca` : "Biblioteca — Squad Five",
  };
}

export default async function LibraryItemPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const item = await getLibraryItemById(id);
  if (!item) notFound();

  const justKey = Array.isArray(sp.just) ? sp.just[0] : sp.just;
  const justMessage = justKey ? JUST_MESSAGES[justKey] : undefined;

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/biblioteca"
        className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary text-[12px] transition-colors w-fit"
      >
        <IconArrowLeft size={14} aria-hidden />
        Voltar para Biblioteca
      </Link>

      {justMessage ? <FeedbackBanner message={justMessage} /> : null}

      <PageHeader
        title={item.title}
        subtitle={
          <span className="flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-display uppercase tracking-[0.08em] border",
                CATEGORY_TONE[item.category],
              )}
            >
              {CATEGORY_LABEL[item.category]}
            </span>
            {item.source === "DRIVE" ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-display uppercase tracking-[0.08em] border border-border-default bg-surface-deep text-text-dim">
                <IconBrandGoogleDrive size={10} stroke={1.5} aria-hidden />
                Drive
              </span>
            ) : null}
            <span className="text-text-dim text-[11px]">
              Atualizado em {formatDateTime(item.updatedAt)}
            </span>
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <CopyButton text={item.content} />
            {item.source === "DRIVE" && item.driveUrl ? (
              <a
                href={item.driveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: "secondary", size: "md" })}
              >
                <IconBrandGoogleDrive size={14} aria-hidden />
                Abrir no Drive
                <IconExternalLink size={11} aria-hidden />
              </a>
            ) : (
              <Link
                href={`/biblioteca/${item.id}/editar`}
                className={buttonVariants({ variant: "secondary", size: "md" })}
              >
                <IconEdit size={14} aria-hidden />
                Editar
              </Link>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        <article className="lg:col-span-3 surface-raised p-5 flex flex-col gap-3">
          <header className="flex items-center justify-between">
            <h2 className="label-display text-[11px] text-text-secondary">
              Conteúdo
            </h2>
            <span className="font-mono text-[10px] text-text-dim">
              {item.content.length} caracteres
            </span>
          </header>
          <pre className="font-mono text-[12px] text-text-primary whitespace-pre-wrap leading-relaxed bg-surface-deep border border-border-default/60 rounded-card p-4 overflow-x-auto">
            {item.content}
          </pre>
        </article>

        <aside className="flex flex-col gap-3">
          <section className="surface-jungle p-4 flex flex-col gap-3">
            <h2 className="label-display text-[11px] text-text-primary">
              Metadados
            </h2>
            {item.createdBy ? (
              <div className="flex items-center justify-between">
                <span className="text-text-secondary text-[12px] flex items-center gap-1.5">
                  <IconUser size={11} stroke={1.5} aria-hidden />
                  Autor
                </span>
                <span className="text-text-primary text-[12px]">
                  {item.createdBy.name ?? item.createdBy.email}
                </span>
              </div>
            ) : null}
            <div className="flex items-center justify-between">
              <span className="text-text-secondary text-[12px]">Criado</span>
              <span className="font-mono text-text-primary text-[11px]">
                {formatDateTime(item.createdAt)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary text-[12px]">Atualizado</span>
              <span className="font-mono text-text-primary text-[11px]">
                {formatDateTime(item.updatedAt)}
              </span>
            </div>
          </section>

          {item.tags.length > 0 ? (
            <section className="surface-raised p-4 flex flex-col gap-2">
              <h2 className="label-display text-[11px] text-text-secondary">
                Tags
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {item.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/biblioteca?q=${encodeURIComponent(tag)}`}
                    className="font-mono text-[11px] text-text-secondary bg-surface-deep border border-border-default/60 px-2 py-0.5 rounded hover:text-text-primary hover:border-border-strong transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
