import { cn } from "@/lib/utils";

/*
  DDayBadge — pílula tipográfica mono com D-day relativo.
  Cores calibradas pela urgência: vencido > hoje > amanhã > futuro.
*/

interface DDayBadgeProps {
  dueDate: Date | null | undefined;
  completed?: boolean;
  className?: string;
}

const MS = 1000 * 60 * 60 * 24;

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function DDayBadge({ dueDate, completed = false, className }: DDayBadgeProps) {
  if (!dueDate) {
    return (
      <span
        className={cn(
          "inline-flex items-center font-mono text-[10px] text-text-dim px-1.5 py-0.5 rounded",
          className,
        )}
      >
        sem D-day
      </span>
    );
  }
  if (completed) {
    return (
      <span
        className={cn(
          "inline-flex items-center font-mono text-[10px] text-status-ok-text px-1.5 py-0.5 rounded bg-status-ok/10",
          className,
        )}
      >
        cumprida
      </span>
    );
  }

  const today = startOfDay(new Date()).getTime();
  const target = startOfDay(dueDate).getTime();
  const diff = Math.floor((target - today) / MS);

  let label: string;
  let tone: string;

  if (diff < 0) {
    label = `D+${Math.abs(diff)}`;
    tone = "text-status-critical-text bg-status-critical/15";
  } else if (diff === 0) {
    label = "D-0";
    tone = "text-status-warn-text bg-status-warn/15";
  } else if (diff <= 2) {
    label = `D-${diff}`;
    tone = "text-status-warn-text bg-status-warn/10";
  } else {
    label = `D-${diff}`;
    tone = "text-text-secondary bg-surface-deep border border-border-default/60";
  }

  return (
    <span
      className={cn(
        "inline-flex items-center font-mono text-[10px] px-1.5 py-0.5 rounded tabular-nums",
        tone,
        className,
      )}
    >
      {label}
    </span>
  );
}
