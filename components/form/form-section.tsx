import { cn } from "@/lib/utils";

/*
  FormSection — agrupador visual de campos relacionados num formulario.
  Header com titulo + descricao opcional, body com grid responsivo.
*/

interface FormSectionProps {
  title: string;
  description?: string;
  /** Numero de colunas no grid (desktop). Mobile sempre 1. Default 2. */
  columns?: 1 | 2;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({
  title,
  description,
  columns = 2,
  children,
  className,
}: FormSectionProps) {
  return (
    <section
      className={cn(
        "surface-raised p-5 sm:p-6 flex flex-col gap-5",
        className,
      )}
    >
      <header className="flex flex-col gap-1 border-b border-border-default/60 pb-3">
        <h2 className="font-display text-[14px] font-medium text-text-primary leading-none">
          {title}
        </h2>
        {description ? (
          <p className="text-text-dim text-[11px]">{description}</p>
        ) : null}
      </header>
      <div
        className={cn(
          "grid grid-cols-1 gap-4",
          columns === 2 && "sm:grid-cols-2",
        )}
      >
        {children}
      </div>
    </section>
  );
}
