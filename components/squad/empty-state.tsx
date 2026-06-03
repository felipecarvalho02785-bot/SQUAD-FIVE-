import Link from "next/link";
import { Mascot } from "@/components/squad/mascot";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/*
  EmptyState — bloco padronizado pra estados vazios.
  Mascote presente em todos. Mood opcional dá tom (calm = padrão,
  celebrating = vitória, alert = problema, sleepy = nada acontecendo).
*/

type Mood = "calm" | "celebrating" | "alert" | "sleepy";

interface EmptyStateProps {
  title: string;
  description?: string;
  /** Tom do mascote — afeta apenas o filtro visual e mensagem alt */
  mood?: Mood;
  /** Tamanho do mascote */
  mascotSize?: number;
  cta?: {
    href: string;
    label: string;
    icon?: React.ReactNode;
  };
  secondaryCta?: {
    href: string;
    label: string;
    icon?: React.ReactNode;
  };
  className?: string;
}

const MOOD_FILTER: Record<Mood, string> = {
  calm: "",
  celebrating: "drop-shadow-[0_0_28px_rgba(215,138,92,0.5)]",
  alert: "drop-shadow-[0_0_24px_rgba(200,74,74,0.4)]",
  sleepy: "opacity-70 saturate-50",
};

const MOOD_ALT: Record<Mood, string> = {
  calm: "Squad em prontidão",
  celebrating: "Squad em vitória",
  alert: "Squad em alerta",
  sleepy: "Squad em descanso",
};

export function EmptyState({
  title,
  description,
  mood = "calm",
  mascotSize = 96,
  cta,
  secondaryCta,
  className,
}: EmptyStateProps) {
  return (
    <section
      className={cn(
        "surface-raised p-10 flex flex-col items-center text-center gap-4",
        className,
      )}
    >
      <div className={cn("relative", MOOD_FILTER[mood])}>
        <Mascot
          size={mascotSize}
          useAsset
          alt={MOOD_ALT[mood]}
          breathing={mood === "calm" || mood === "celebrating"}
        />
      </div>
      <div className="flex flex-col gap-2 max-w-md">
        <h2 className="font-display text-[20px] font-medium leading-tight text-text-primary">
          {title}
        </h2>
        {description ? (
          <p className="text-text-secondary text-[13px]">{description}</p>
        ) : null}
      </div>
      {cta || secondaryCta ? (
        <div className="flex flex-col sm:flex-row gap-2">
          {cta ? (
            <Link
              href={cta.href}
              className={buttonVariants({ variant: "primary", size: "md" })}
            >
              {cta.icon}
              {cta.label}
            </Link>
          ) : null}
          {secondaryCta ? (
            <Link
              href={secondaryCta.href}
              className={buttonVariants({ variant: "secondary", size: "md" })}
            >
              {secondaryCta.icon}
              {secondaryCta.label}
            </Link>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
