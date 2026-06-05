import Link from "next/link";
import { LibraryCategory } from "@prisma/client";
import { IconBooks, IconPlus, IconSearch } from "@tabler/icons-react";
import { PageHeader } from "@/components/squad/page-header";
import { FeedbackBanner } from "@/components/squad/feedback-banner";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/form/input";
import { LibraryCard } from "@/components/biblioteca/library-card";
import { DriveSyncCard } from "@/components/biblioteca/drive-sync-card";
import {
  listLibraryItems,
  countLibraryByCategory,
  getActiveDriveSyncConfig,
} from "@/lib/queries/library";
import { libraryFilterSchema } from "@/lib/schemas/library";
import {
  CATEGORIES_ORDER,
  CATEGORY_LABEL,
} from "@/lib/library-meta";
import { cn } from "@/lib/utils";

export const metadata = { title: "Biblioteca — Squad Five" };
export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function asString(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

const JUST_MESSAGES: Record<string, string> = {
  created: "Item adicionado à biblioteca.",
  updated: "Item atualizado.",
  deleted: "Item removido.",
};

function buildHref(category: string, q: string): string {
  const params = new URLSearchParams();
  if (category !== "all") params.set("category", category);
  if (q.trim()) params.set("q", q);
  const qs = params.toString();
  return `/biblioteca${qs ? `?${qs}` : ""}`;
}

export default async function BibliotecaPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const parsed = libraryFilterSchema.safeParse({
    q: asString(sp.q),
    category: asString(sp.category) || "all",
  });
  const filter = parsed.success
    ? parsed.data
    : { q: undefined, category: "all" as const };

  const justKey = Array.isArray(sp.just) ? sp.just[0] : sp.just;
  const justMessage = justKey ? JUST_MESSAGES[justKey] : undefined;

  const [items, byCategory, driveConfig] = await Promise.all([
    listLibraryItems(filter),
    countLibraryByCategory(),
    getActiveDriveSyncConfig(),
  ]);
  const total = Object.values(byCategory).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Biblioteca"
        subtitle={
          total === 0
            ? "Sua biblioteca de templates está vazia. Comece pelo primeiro."
            : `${total} item${total === 1 ? "" : "s"} no acervo do squad.`
        }
        actions={
          <Link
            href="/biblioteca/novo"
            className={buttonVariants({ variant: "primary", size: "md" })}
          >
            <IconPlus size={14} aria-hidden />
            Novo item
          </Link>
        }
      />

      {justMessage ? <FeedbackBanner message={justMessage} /> : null}

      <DriveSyncCard
        config={
          driveConfig
            ? {
                folderId: driveConfig.folderId,
                folderName: driveConfig.folderName,
                folderUrl: driveConfig.folderUrl,
                lastSyncAt: driveConfig.lastSyncAt,
                lastError: driveConfig.lastError,
                itemsSynced: driveConfig.itemsSynced,
                syncedBy: driveConfig.syncedBy,
              }
            : null
        }
      />

      <div className="flex flex-col gap-3">
        <form
          method="GET"
          action="/biblioteca"
          className="relative flex items-center gap-2"
        >
          {filter.category !== "all" ? (
            <input type="hidden" name="category" value={filter.category} />
          ) : null}
          <div className="relative flex-1">
            <IconSearch
              size={14}
              stroke={1.5}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim pointer-events-none"
              aria-hidden
            />
            <Input
              type="search"
              name="q"
              defaultValue={filter.q ?? ""}
              placeholder="Buscar por título, conteúdo ou tag..."
              className="pl-9"
              aria-label="Buscar na biblioteca"
            />
          </div>
        </form>

        <nav
          className="flex items-center gap-1 overflow-x-auto"
          aria-label="Filtro por categoria"
        >
          {(["all", ...CATEGORIES_ORDER] as Array<LibraryCategory | "all">).map(
            (cat) => {
              const isActive = cat === filter.category;
              const label = cat === "all" ? "Todos" : CATEGORY_LABEL[cat];
              const count =
                cat === "all"
                  ? total
                  : (byCategory[cat] ?? 0);
              return (
                <Link
                  key={cat}
                  href={buildHref(cat, filter.q ?? "")}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full",
                    "font-display uppercase tracking-[0.06em] text-[11px] font-medium min-h-9 transition-colors",
                    isActive
                      ? "bg-surface-accent text-text-primary border border-border-strong"
                      : "bg-surface-deep text-text-secondary border border-border-default hover:text-text-primary hover:border-border-strong",
                  )}
                >
                  {label}
                  {count > 0 ? (
                    <span className="font-mono text-[10px] tabular-nums opacity-70">
                      {count}
                    </span>
                  ) : null}
                </Link>
              );
            },
          )}
        </nav>
      </div>

      {items.length === 0 ? (
        <section className="surface-raised p-10 flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-surface-accent border border-border-strong flex items-center justify-center">
            <IconBooks
              size={26}
              stroke={1.5}
              className="text-bronze"
              aria-hidden
            />
          </div>
          <div className="flex flex-col gap-2 max-w-md">
            <h2 className="font-display text-[20px] font-medium leading-tight text-text-primary">
              {total === 0
                ? "Biblioteca vazia."
                : "Nada nesse filtro."}
            </h2>
            <p className="text-text-secondary text-[13px]">
              {total === 0
                ? "Comece adicionando templates de copy, roteiros de reunião, prompts de IA, e tudo que o squad reutiliza."
                : "Ajuste a busca ou a categoria para encontrar o que procura."}
            </p>
          </div>
          <Link
            href="/biblioteca/novo"
            className={buttonVariants({ variant: "primary", size: "md" })}
          >
            <IconPlus size={14} aria-hidden />
            Adicionar primeiro item
          </Link>
        </section>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((item) => (
            <li key={item.id}>
              <LibraryCard item={item} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
