import { cn } from "@/lib/utils";

/*
  Field — wrapper de campo de formulario com label + hint + erro.
  Wrapper agnostico de input — funciona com <Input>, <Textarea>, <Select>,
  ou qualquer elemento focavel custom.
*/

interface FieldProps {
  /** Texto do label (sentence case, em PT-BR — ver docs/02 §"Labels") */
  label: string;
  /** Nome do campo no form (usado por htmlFor e como key de validacao) */
  name: string;
  /** Texto pequeno de instrucao abaixo do input */
  hint?: string;
  /** Mensagem de erro de validacao (cor casualty) */
  error?: string;
  /** Indica obrigatoriedade visual com asterisco */
  required?: boolean;
  /** O proprio input/textarea/select */
  children: React.ReactNode;
  className?: string;
}

export function Field({
  label,
  name,
  hint,
  error,
  required = false,
  children,
  className,
}: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label
        htmlFor={name}
        className="label-display text-[10px] text-text-secondary flex items-center gap-1"
      >
        {label}
        {required ? (
          <span
            className="text-status-critical-text"
            aria-label="obrigatório"
          >
            *
          </span>
        ) : null}
      </label>
      {children}
      {error ? (
        <span
          id={`${name}-error`}
          role="alert"
          className="text-[11px] text-status-critical-text"
        >
          {error}
        </span>
      ) : hint ? (
        <span id={`${name}-hint`} className="text-[11px] text-text-dim">
          {hint}
        </span>
      ) : null}
    </div>
  );
}
