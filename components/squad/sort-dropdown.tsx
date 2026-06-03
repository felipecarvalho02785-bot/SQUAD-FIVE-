"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { IconArrowsSort, IconCheck } from "@tabler/icons-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface SortOption {
  value: string;
  label: string;
}

interface SortDropdownProps {
  options: SortOption[];
  current: string;
  /** Nome do search param. Default "sort". */
  paramKey?: string;
  className?: string;
}

export function SortDropdown({
  options,
  current,
  paramKey = "sort",
  className,
}: SortDropdownProps) {
  const [open, setOpen] = useState(false);
  const searchParams = useSearchParams();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [open]);

  function buildHref(value: string): string {
    const next = new URLSearchParams(searchParams.toString());
    if (value === options[0]?.value) {
      next.delete(paramKey);
    } else {
      next.set(paramKey, value);
    }
    const qs = next.toString();
    return qs ? `?${qs}` : "?";
  }

  const currentLabel =
    options.find((o) => o.value === current)?.label ?? options[0]?.label;

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "inline-flex items-center gap-2 h-9 px-3 rounded-full",
          "bg-surface-deep border border-border-default text-text-secondary text-[11px]",
          "hover:text-text-primary hover:border-border-strong transition-colors",
        )}
      >
        <IconArrowsSort size={12} stroke={1.5} aria-hidden />
        <span>Ordenar: {currentLabel}</span>
      </button>

      {open ? (
        <div
          role="listbox"
          className={cn(
            "absolute right-0 top-full mt-2 z-dropdown",
            "min-w-[200px] surface-raised flex flex-col py-1 shadow-xl",
          )}
        >
          {options.map((opt) => {
            const isActive = opt.value === current;
            return (
              <Link
                key={opt.value}
                href={buildHref(opt.value)}
                onClick={() => setOpen(false)}
                role="option"
                aria-selected={isActive}
                className={cn(
                  "flex items-center justify-between px-3 py-2 text-[12px] transition-colors",
                  isActive
                    ? "text-text-primary bg-surface-accent/40"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-deep",
                )}
              >
                <span>{opt.label}</span>
                {isActive ? (
                  <IconCheck
                    size={12}
                    stroke={2}
                    className="text-bronze"
                    aria-hidden
                  />
                ) : null}
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
