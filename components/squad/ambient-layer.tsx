/*
  AmbientLayer — camada decorativa de fundo (Tier 1) usada nas telas
  imersivas (Login, 404). Folhas balançando + partículas drifting + glow
  radial. Posicionado absoluto, pointer-events: none.

  Tokens: usa CSS vars (--color-jungle, --color-patrol, etc.) diretamente
  em fill SVG e backgroundColor inline, alinhado com a regra de "zero
  hex hardcoded fora do @theme".
*/

import { cn } from "@/lib/utils";

interface AmbientLayerProps {
  particles?: number;
  intensity?: "subtle" | "strong";
  className?: string;
}

export function AmbientLayer({
  particles = 8,
  intensity = "subtle",
  className,
}: AmbientLayerProps) {
  const particleArray = Array.from({ length: particles }, (_, i) => i);

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
    >
      <div
        className={cn(
          "absolute inset-0",
          intensity === "strong"
            ? "bg-[radial-gradient(circle_at_50%_45%,rgba(168,90,58,0.22)_0%,transparent_55%)]"
            : "bg-[radial-gradient(circle_at_50%_50%,rgba(47,74,44,0.18)_0%,transparent_60%)]",
        )}
      />

      <svg
        className="absolute top-[10%] left-[8%] w-32 h-32 animate-sway opacity-30"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M50 10 Q70 30 50 70 Q30 30 50 10 Z"
          fill="var(--color-jungle)"
          opacity="0.6"
        />
      </svg>

      <svg
        className="absolute bottom-[14%] right-[10%] w-40 h-40 animate-sway opacity-25"
        style={{ animationDelay: "1.5s", animationDuration: "9s" }}
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M50 10 Q75 35 50 85 Q25 35 50 10 Z"
          fill="var(--color-patrol)"
          opacity="0.5"
        />
      </svg>

      <svg
        className="absolute top-[55%] left-[12%] w-24 h-24 animate-sway opacity-20"
        style={{ animationDelay: "3s", animationDuration: "11s" }}
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M50 15 Q65 40 50 75 Q35 40 50 15 Z"
          fill="var(--color-jungle-glow)"
          opacity="0.4"
        />
      </svg>

      {particleArray.map((i) => {
        const left = 8 + ((i * 13) % 84);
        const delay = (i * 1.6) % 14;
        const sizePx = 2 + (i % 3);
        const isCopper = i % 3 === 0;
        return (
          <span
            key={i}
            className="absolute bottom-0 rounded-full animate-drift-up"
            style={{
              left: `${left}%`,
              width: `${sizePx}px`,
              height: `${sizePx}px`,
              backgroundColor: isCopper
                ? "var(--color-bronze)"
                : "var(--color-patrol)",
              animationDelay: `${delay}s`,
              opacity: 0.45,
            }}
          />
        );
      })}
    </div>
  );
}
