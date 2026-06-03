"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  IconSearch,
  IconCommand,
  IconUserPlus,
  IconTarget,
  IconChecks,
  IconBooks,
  IconCalendar,
  IconTargetArrow,
  IconPlus,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { searchEverything, type SearchResult } from "@/lib/actions/search";

const QUICK_ACTIONS: Array<{
  triggers: string[];
  label: string;
  href: string;
  Icon: typeof IconUserPlus;
  hint: string;
}> = [
  {
    triggers: ["novo recruta", "recrutar", "alistar", "criar cliente"],
    label: "Recrutar novo recruta",
    href: "/recrutas/novo",
    Icon: IconUserPlus,
    hint: "Cria ficha de recruta",
  },
  {
    triggers: ["mobilizar", "nova operacao", "nova operação", "criar operacao"],
    label: "Mobilizar nova operação",
    href: "/operacoes/nova",
    Icon: IconTargetArrow,
    hint: "Vincula recruta a um produto",
  },
  {
    triggers: ["registrar briefing", "novo briefing", "briefing"],
    label: "Registrar briefing",
    href: "/briefings/novo",
    Icon: IconCalendar,
    hint: "Anota reunião com recruta",
  },
  {
    triggers: ["nova tarefa", "tarefa squad", "criar tarefa"],
    label: "Nova tarefa do squad",
    href: "/squad-tasks",
    Icon: IconPlus,
    hint: "Tarefa interna do squad",
  },
];

const ICON_BY_TYPE = {
  recruta: IconUserPlus,
  operacao: IconTarget,
  ordem: IconChecks,
  biblioteca: IconBooks,
};

const LABEL_BY_TYPE = {
  recruta: "Recruta",
  operacao: "Operação",
  ordem: "Ordem",
  biblioteca: "Biblioteca",
};

export function CommandPaletteTrigger() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
        setResults([]);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function handleClose() {
    setOpen(false);
    setQuery("");
    setResults([]);
  }

  useEffect(() => {
    if (query.trim().length < 2) {
      return;
    }
    const handler = setTimeout(() => {
      startTransition(async () => {
        const res = await searchEverything(query, 6);
        setResults(res);
      });
    }, 180);
    return () => clearTimeout(handler);
  }, [query]);

  function handleSelect(href: string) {
    handleClose();
    router.push(href);
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    if (value.trim().length < 2) {
      setResults([]);
    }
  }

  const grouped = results.reduce<Record<string, SearchResult[]>>(
    (acc, r) => {
      const key = r.type;
      if (!acc[key]) acc[key] = [];
      acc[key].push(r);
      return acc;
    },
    {},
  );

  const matchingQuickActions = QUICK_ACTIONS.filter((qa) => {
    if (!query.trim()) return false;
    const q = query.toLowerCase().trim();
    return qa.triggers.some((t) => t.includes(q) || q.includes(t));
  });

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Buscar (Ctrl + K)"
        className="hidden md:flex items-center gap-2 h-9 px-3 rounded-full bg-surface-deep border border-border-default text-text-dim hover:text-text-primary hover:border-border-strong transition-all"
      >
        <IconSearch size={14} stroke={1.5} aria-hidden />
        <span className="text-[11px]">Buscar</span>
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-surface-base border border-border-default text-[10px] font-mono text-text-dim">
          <IconCommand size={9} stroke={1.5} aria-hidden />K
        </span>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-command bg-surface-base/60 backdrop-blur-sm flex items-start justify-center p-4 pt-[15vh]"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <Command
            label="Busca global"
            className="surface-raised w-full max-w-xl flex flex-col overflow-hidden shadow-2xl"
            shouldFilter={false}
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border-default">
              <IconSearch
                size={16}
                stroke={1.5}
                className="text-text-dim shrink-0"
                aria-hidden
              />
              <Command.Input
                value={query}
                onValueChange={handleQueryChange}
                placeholder="Buscar recrutas, operações, ordens, biblioteca..."
                className="flex-1 bg-transparent outline-none text-text-primary text-[14px] placeholder:text-text-dim"
                autoFocus
              />
              <kbd className="font-mono text-[10px] text-text-dim px-1.5 py-0.5 rounded bg-surface-deep border border-border-default">
                ESC
              </kbd>
            </div>

            <Command.List className="max-h-[60vh] overflow-y-auto p-2">
              <Command.Empty className="py-8 text-center text-text-secondary text-[12px]">
                {query.trim().length < 2
                  ? "Digite ao menos 2 caracteres..."
                  : pending
                    ? "Buscando..."
                    : "Nada encontrado por essa busca."}
              </Command.Empty>

              {matchingQuickActions.length > 0 ? (
                <Command.Group
                  heading="Ações rápidas"
                  className="text-[10px] text-bronze label-display px-2 py-1.5"
                >
                  {matchingQuickActions.map((qa) => {
                    const { Icon } = qa;
                    return (
                      <Command.Item
                        key={qa.href}
                        value={`action-${qa.label}`}
                        onSelect={() => handleSelect(qa.href)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-card cursor-pointer",
                          "text-text-primary text-[13px]",
                          "data-[selected=true]:bg-accent/20 data-[selected=true]:text-text-primary",
                          "hover:bg-surface-deep",
                        )}
                      >
                        <Icon
                          size={14}
                          stroke={1.5}
                          className="text-accent shrink-0"
                          aria-hidden
                        />
                        <div className="flex-1 min-w-0">
                          <div className="truncate">{qa.label}</div>
                          <div className="text-text-dim text-[11px] truncate">
                            {qa.hint}
                          </div>
                        </div>
                      </Command.Item>
                    );
                  })}
                </Command.Group>
              ) : null}

              {Object.entries(grouped).map(([type, items]) => {
                const Icon =
                  ICON_BY_TYPE[type as keyof typeof ICON_BY_TYPE] ?? IconSearch;
                const groupLabel =
                  LABEL_BY_TYPE[type as keyof typeof LABEL_BY_TYPE] ?? type;
                return (
                  <Command.Group
                    key={type}
                    heading={groupLabel}
                    className="text-[10px] text-text-label label-display px-2 py-1.5"
                  >
                    {items.map((item) => (
                      <Command.Item
                        key={`${type}-${item.id}`}
                        value={`${type}-${item.id}-${item.title}`}
                        onSelect={() => handleSelect(item.href)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-card cursor-pointer",
                          "text-text-primary text-[13px]",
                          "data-[selected=true]:bg-surface-accent data-[selected=true]:text-text-primary",
                          "hover:bg-surface-deep",
                        )}
                      >
                        <Icon
                          size={14}
                          stroke={1.5}
                          className="text-bronze shrink-0"
                          aria-hidden
                        />
                        <div className="flex-1 min-w-0">
                          <div className="truncate">{item.title}</div>
                          {item.subtitle ? (
                            <div className="text-text-dim text-[11px] truncate">
                              {item.subtitle}
                            </div>
                          ) : null}
                        </div>
                      </Command.Item>
                    ))}
                  </Command.Group>
                );
              })}
            </Command.List>
          </Command>
        </div>
      ) : null}
    </>
  );
}
