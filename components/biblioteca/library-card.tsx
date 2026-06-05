import Link from "next/link";
import {
  IconArrowUpRight,
  IconBrandGoogleDrive,
  IconUser,
} from "@tabler/icons-react";
import type { LibraryItemWithAuthor } from "@/lib/queries/library";
import { CATEGORY_LABEL, CATEGORY_TONE } from "@/lib/library-meta";
import { cn } from "@/lib/utils";

interface LibraryCardProps {
  item: LibraryItemWithAuthor;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

export function LibraryCard({ item }: LibraryCardProps) {
  const preview = item.content
    .replace(/\s+/g, " ")
    .slice(0, 180);

  return (
    <Link
      href={`/biblioteca/${item.id}`}
      className="surface-raised lift-hover p-4 flex flex-col gap-3 group"
    >
      <header className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={cn(
                "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-display uppercase tracking-[0.08em] border",
                CATEGORY_TONE[item.category],
              )}
            >
              {CATEGORY_LABEL[item.category]}
            </span>
            {item.source === "DRIVE" ? (
              <span
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-display uppercase tracking-[0.08em] border border-border-default bg-surface-deep text-text-dim"
                title="Sincronizado do Google Drive"
              >
                <IconBrandGoogleDrive size={10} stroke={1.5} aria-hidden />
                Drive
              </span>
            ) : null}
          </div>
          <h3 className="text-text-primary text-[13px] font-medium truncate group-hover:text-accent-hover transition-colors">
            {item.title}
          </h3>
        </div>
        <IconArrowUpRight
          size={14}
          stroke={1.5}
          className="text-text-dim group-hover:text-accent-hover shrink-0 mt-1"
          aria-hidden
        />
      </header>

      <p className="text-text-secondary text-[12px] leading-relaxed line-clamp-3">
        {preview}
        {item.content.length > 180 ? "..." : ""}
      </p>

      {item.tags.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {item.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="font-mono text-[10px] text-text-dim bg-surface-deep border border-border-default/60 px-1.5 py-0.5 rounded"
            >
              #{tag}
            </span>
          ))}
          {item.tags.length > 4 ? (
            <span className="font-mono text-[10px] text-text-dim">
              +{item.tags.length - 4}
            </span>
          ) : null}
        </div>
      ) : null}

      <footer className="flex items-center justify-between text-[10px] text-text-dim mt-1">
        {item.createdBy ? (
          <span className="flex items-center gap-1">
            <IconUser size={10} stroke={1.5} aria-hidden />
            {item.createdBy.name ?? item.createdBy.email}
          </span>
        ) : (
          <span />
        )}
        <span className="font-mono tabular-nums">
          {formatDate(item.updatedAt)}
        </span>
      </footer>
    </Link>
  );
}
