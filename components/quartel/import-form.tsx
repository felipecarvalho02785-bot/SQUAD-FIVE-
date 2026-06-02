"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  IconUpload,
  IconCheck,
  IconAlertTriangle,
  IconArrowLeft,
} from "@tabler/icons-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field } from "@/components/form/field";
import { Textarea } from "@/components/form/textarea";
import {
  importRecruitsAction,
  type ImportResult,
  type ImportError,
} from "@/lib/actions/recruit-import";

const EXAMPLE = `name,contactEmail,contactPhone,segment,campaignBudget,status
Maternidade Vida & Sorriso,maria@vidaesorriso.com.br,(11) 91234-5678,Saúde,15000,ATIVO
Studio Tropos,contato@tropos.studio,(21) 99876-5432,Design,8000,ATIVO
Cabide Verde,vendas@cabideverde.com,(31) 98765-4321,Moda,22000,ATIVO`;

export function ImportForm() {
  const [state, formAction, pending] = useActionState<
    ImportResult | ImportError | undefined,
    FormData
  >(importRecruitsAction, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field
        label="CSV / TSV"
        name="csv"
        required
        hint="Primeira linha = cabeçalhos. Aceita vírgula, ponto-e-vírgula ou tab. Cabeçalhos reconhecidos: name, contactName, contactEmail, contactPhone, segment, campaignBudget, theses, notes, status (e sinônimos em português)."
      >
        <Textarea
          id="csv"
          name="csv"
          required
          rows={10}
          placeholder={EXAMPLE}
          className="font-mono text-[12px]"
        />
      </Field>

      <div className="flex items-center gap-2">
        <Button type="submit" name="mode" value="preview" disabled={pending}>
          <IconCheck size={14} aria-hidden />
          {pending ? "Validando..." : "Validar (preview)"}
        </Button>
        <Button
          type="submit"
          variant="secondary"
          name="mode"
          value="import"
          disabled={pending}
        >
          <IconUpload size={14} aria-hidden />
          {pending ? "Importando..." : "Importar agora"}
        </Button>
        <Link
          href="/quartel"
          className={buttonVariants({ variant: "ghost", size: "md" })}
        >
          <IconArrowLeft size={14} aria-hidden />
          Voltar
        </Link>
      </div>

      {state && state.ok === false ? (
        <div className="surface-raised border border-status-critical/40 px-4 py-3 text-status-critical-text text-[12px]">
          {state.error}
        </div>
      ) : null}

      {state && state.ok ? <ResultPanel result={state} /> : null}
    </form>
  );
}

function ResultPanel({ result }: { result: ImportResult }) {
  return (
    <section className="surface-raised p-5 flex flex-col gap-3">
      <header className="flex items-center justify-between">
        <h2 className="label-display text-[11px] text-text-primary">
          {result.dryRun ? "Preview do import" : "Resultado da importação"}
        </h2>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-text-secondary">
            <span className="font-mono text-text-primary">{result.total}</span> linhas
          </span>
          <span className="text-status-ok-text">
            <span className="font-mono">{result.valid}</span> válidas
          </span>
          {result.invalid > 0 ? (
            <span className="text-status-critical-text">
              <span className="font-mono">{result.invalid}</span> com erro
            </span>
          ) : null}
          {!result.dryRun ? (
            <span className="text-bronze">
              <span className="font-mono">{result.imported}</span> importadas
            </span>
          ) : null}
        </div>
      </header>

      {!result.dryRun ? (
        <div className="surface-jungle px-4 py-3 text-text-primary text-[12px]">
          <Link
            href="/recrutas"
            className="underline-offset-2 hover:underline"
          >
            Recrutas →
          </Link>
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full text-[12px] text-text-primary">
          <thead>
            <tr className="text-text-label label-display text-[9px]">
              <th className="text-left py-2 pr-3">#</th>
              <th className="text-left py-2 pr-3">Nome</th>
              <th className="text-left py-2 pr-3">Email</th>
              <th className="text-left py-2 pr-3">Segmento</th>
              <th className="text-right py-2 pr-3">Budget</th>
              <th className="text-left py-2 pr-3">Status</th>
              <th className="text-left py-2 pr-3">Erros</th>
            </tr>
          </thead>
          <tbody>
            {result.rows.map((row) => (
              <tr
                key={row.index}
                className="border-t border-border-default/40"
              >
                <td className="py-2 pr-3 font-mono text-text-dim">
                  {row.index}
                </td>
                <td className="py-2 pr-3">
                  {row.parsed.name ?? (
                    <span className="text-text-dim italic">—</span>
                  )}
                </td>
                <td className="py-2 pr-3 font-mono text-[11px]">
                  {row.parsed.contactEmail ?? (
                    <span className="text-text-dim">—</span>
                  )}
                </td>
                <td className="py-2 pr-3">
                  {row.parsed.segment ?? (
                    <span className="text-text-dim">—</span>
                  )}
                </td>
                <td className="py-2 pr-3 font-mono text-right tabular-nums">
                  {typeof row.parsed.campaignBudget === "number"
                    ? new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                        maximumFractionDigits: 0,
                      }).format(row.parsed.campaignBudget)
                    : "—"}
                </td>
                <td className="py-2 pr-3 font-mono text-[10px]">
                  {row.parsed.status}
                </td>
                <td className="py-2 pr-3">
                  {row.errors.length > 0 ? (
                    <span className="inline-flex items-center gap-1 text-status-critical-text text-[11px]">
                      <IconAlertTriangle size={11} stroke={1.5} />
                      {row.errors.join("; ")}
                    </span>
                  ) : (
                    <IconCheck
                      size={12}
                      className="text-status-ok-text"
                      aria-hidden
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
