import { forwardRef, type SelectHTMLAttributes } from "react";
import { IconChevronDown } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            "appearance-none w-full h-9 lg:h-9 min-h-11 lg:min-h-9 pl-3 pr-9 rounded-input",
            "bg-surface-deep border border-border-default text-text-primary text-[13px]",
            "focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <IconChevronDown
          size={14}
          stroke={1.5}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim pointer-events-none"
          aria-hidden
        />
      </div>
    );
  },
);
Select.displayName = "Select";
