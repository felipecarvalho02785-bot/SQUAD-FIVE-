"use client";

import { useSyncExternalStore } from "react";
import { IconSun, IconMoon } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

type Theme = "dark" | "light";

function subscribe(callback: () => void) {
  if (typeof document === "undefined") return () => {};
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

function getSnapshot(): Theme {
  if (typeof document === "undefined") return "dark";
  const attr = document.documentElement.getAttribute("data-theme");
  return attr === "light" ? "light" : "dark";
}

function getServerSnapshot(): Theme {
  return "dark";
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("squad-theme", next);
    } catch {
      // SSR/Privacy mode
    }
  }

  const Icon = theme === "dark" ? IconSun : IconMoon;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Trocar para tema ${theme === "dark" ? "claro" : "escuro"}`}
      className={cn(
        "min-w-11 min-h-11 lg:min-w-9 lg:min-h-9 w-9 h-9 rounded-full",
        "flex items-center justify-center text-text-dim hover:text-text-primary hover:bg-surface-deep transition-colors",
      )}
    >
      <Icon size={16} stroke={1.5} aria-hidden />
    </button>
  );
}
