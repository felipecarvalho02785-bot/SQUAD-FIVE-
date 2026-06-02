import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/*
  Input — campo de texto basico da brand.
  Specs em docs/03_SISTEMA_DESIGN.md secao 5.8.
*/

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "h-9 lg:h-9 min-h-11 lg:min-h-9 px-3 rounded-input",
          "bg-surface-deep border border-border-default text-text-primary text-[13px]",
          "placeholder:text-text-disabled",
          "focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";
