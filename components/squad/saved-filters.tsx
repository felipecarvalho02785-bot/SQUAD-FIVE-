"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SavedFilterScope } from "@prisma/client";
import {
  IconBookmark,
  IconBookmarkPlus,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import { toast } from "sonner";
import {
  saveFilterAction,
  deleteFilterAction,
} from "@/lib/actions/saved-filter";
import { normalizeFilterParams } from "@/lib/saved-filter-utils";
import { Input } from "@/components/form/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/*
  SavedFilters — chips dos filtros salvos do usuário + botão "salvar atual".
  - Clique no chip aplica o filtro (navega para ?<params>)
  - Click no X remove o filtro
  - Botão "+ Salvar" abre um pequeno popover com input pro nome
*/

export interface SavedFilterItem {
  id: string;
  name: string;
  params: string;
}

interface SavedFiltersProps {
  scope: SavedFilterScope;
  items: SavedFilterItem[];
  ignoreParams?: string[];
}

export function SavedFilters({
  scope,
  items,
  ignoreParams = [],
}: SavedFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [showInput, setShowInput] = useState(false);

  const currentNormalized = buildNormalized(searchParams, ignoreParams);
  const hasFilter = currentNormalized.length > 0;
  const matchedSaved = items.find(
    (item) => normalizeFilterParams(item.params) === currentNormalized,
  );

  function applyFilter(params: string) {
    const qs = params ? `?${params}` : "";
    router.push(`${pathname}${qs}`);
  }

  function handleSave() {
    if (!name.trim()) {
      toast.error("Dê um nome ao filtro.");
      return;
    }
    startTransition(async () => {
      const result = await saveFilterAction(scope, name, currentNormalized);
      if (result.ok) {
        toast.success(`Filtro "${name}" salvo.`);
        setName("");
        setShowInput(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleDelete(id: string, label: string) {
    startTransition(async () => {
      const result = await deleteFilterAction(id);
      if (result.ok) {
        toast.success(`Filtro "${label}" removido.`);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  const showSavePrompt = hasFilter && !matchedSaved;

  if (items.length === 0 && !showSavePrompt) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="flex items-center gap-1 text-text-dim text-[10px] label-display">
        <IconBookmark size={11} stroke={1.5} aria-hidden />
        Salvos
      </span>

      {items.map((item) => {
        const isActive =
          normalizeFilterParams(item.params) === currentNormalized;
        return (
          <span
            key={item.id}
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full border text-[11px] font-medium transition-colors",
              isActive
                ? "bg-surface-accent text-text-primary border-border-strong"
                : "bg-surface-deep text-text-secondary border-border-default hover:text-text-primary",
            )}
          >
            <button
              type="button"
              onClick={() => applyFilter(item.params)}
              className="inline-flex items-center gap-1 pl-3 pr-1.5 py-1 min-h-9 lg:min-h-7"
              aria-label={`Aplicar filtro ${item.name}`}
            >
              {isActive ? (
                <IconCheck
                  size={11}
                  stroke={2}
                  className="text-bronze"
                  aria-hidden
                />
              ) : null}
              {item.name}
            </button>
            <button
              type="button"
              onClick={() => handleDelete(item.id, item.name)}
              disabled={pending}
              className="px-1.5 py-1 text-text-dim hover:text-status-critical-text disabled:opacity-50"
              aria-label={`Remover filtro ${item.name}`}
            >
              <IconX size={10} stroke={2} aria-hidden />
            </button>
          </span>
        );
      })}

      {showSavePrompt ? (
        showInput ? (
          <div className="inline-flex items-center gap-1 bg-surface-deep border border-border-strong rounded-full pl-2 pr-1 py-0.5">
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do filtro"
              maxLength={40}
              className="h-7 min-w-[140px] text-[11px] bg-transparent border-0 px-1 focus:ring-0"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSave();
                }
                if (e.key === "Escape") {
                  setShowInput(false);
                  setName("");
                }
              }}
            />
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={pending}
            >
              <IconCheck size={11} aria-hidden />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowInput(false);
                setName("");
              }}
              disabled={pending}
            >
              <IconX size={11} aria-hidden />
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowInput(true)}
            className={cn(
              "inline-flex items-center gap-1 px-3 py-1 rounded-full",
              "bg-surface-deep border border-dashed border-border-default text-text-secondary text-[11px] min-h-9 lg:min-h-7",
              "hover:text-text-primary hover:border-border-strong transition-colors",
            )}
          >
            <IconBookmarkPlus size={11} stroke={1.5} aria-hidden />
            Salvar filtro atual
          </button>
        )
      ) : null}
    </div>
  );
}

function buildNormalized(
  searchParams: URLSearchParams,
  ignore: string[],
): string {
  const filtered = new URLSearchParams();
  for (const [k, v] of searchParams.entries()) {
    if (ignore.includes(k)) continue;
    filtered.append(k, v);
  }
  return normalizeFilterParams(filtered.toString());
}
