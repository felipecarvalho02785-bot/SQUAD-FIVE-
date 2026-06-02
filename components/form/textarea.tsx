import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, rows = 4, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={cn(
          "px-3 py-2.5 rounded-input",
          "bg-surface-deep border border-border-default text-text-primary text-[13px] leading-relaxed",
          "placeholder:text-text-disabled",
          "focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "resize-y",
          className,
        )}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";
