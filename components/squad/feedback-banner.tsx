import { IconCheck, IconInfoCircle } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

/*
  FeedbackBanner — exibe mensagem de sucesso/info derivada de ?just=
  na URL. Substitui toast por enquanto (uma pendencia da Sprint 8 e
  introduzir Sonner global).
*/

const KIND_STYLES = {
  success:
    "bg-status-ok/15 border border-status-ok/40 text-status-ok-text",
  info: "bg-surface-deep border border-border-default text-text-primary",
};

interface FeedbackBannerProps {
  message: string;
  kind?: "success" | "info";
  className?: string;
}

export function FeedbackBanner({
  message,
  kind = "success",
  className,
}: FeedbackBannerProps) {
  const Icon = kind === "success" ? IconCheck : IconInfoCircle;
  return (
    <div
      role="status"
      className={cn(
        "px-4 py-2.5 rounded-card text-[12px] flex items-center gap-2",
        KIND_STYLES[kind],
        className,
      )}
    >
      <Icon size={14} stroke={2} aria-hidden />
      {message}
    </div>
  );
}
