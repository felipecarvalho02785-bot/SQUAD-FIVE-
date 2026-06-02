import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/*
  Button — primitivo de acao da brand.
  Variantes alinhadas com docs/03_SISTEMA_DESIGN.md secao 5.3-5.4 e
  ampliadas (ghost, destructive) para suportar Server Actions de CRUD.
*/

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2",
    "font-display uppercase tracking-[0.06em] font-medium",
    "transition-all active:scale-[0.98]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring/50",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
  ].join(" "),
  {
    variants: {
      variant: {
        primary:
          "bg-accent-cta text-accent-cta-fg hover:bg-accent-hover shadow-[0_0_18px_-8px_rgba(168,90,58,0.5)]",
        secondary:
          "bg-transparent text-text-secondary border border-border-default hover:bg-surface-deep hover:border-border-strong hover:text-text-primary",
        destructive:
          "bg-status-critical text-text-primary hover:bg-status-critical/85",
        ghost:
          "text-text-secondary hover:text-text-primary hover:bg-surface-deep",
        link:
          "text-accent-hover hover:text-text-primary underline-offset-2 hover:underline px-0",
      },
      size: {
        sm: "h-9 px-3 text-[11px] rounded-input",
        md: "h-11 min-h-11 px-5 text-[12px] rounded-input",
        lg: "h-12 min-h-12 px-6 text-[13px] rounded-input",
        icon: "h-11 w-11 min-h-11 min-w-11 lg:h-9 lg:w-9 lg:min-h-9 lg:min-w-9 rounded-full",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
