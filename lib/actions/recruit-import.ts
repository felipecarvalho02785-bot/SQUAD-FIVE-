"use server";

import { revalidatePath } from "next/cache";
import { Prisma, RecruitStatus, UserRole } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

/*
  Importador CSV de recrutas.
  Aceita texto CSV / TSV com primeira linha de header.
  Mapeia headers case-insensitive pra schema (sinonimos suportados).
  Permite dry-run (preview) antes de gravar.
*/

const HEADER_MAP: Record<string, keyof RecruitImportRow> = {
  // name
  name: "name",
  nome: "name",
  cliente: "name",
  recruta: "name",
  empresa: "name",
  // contact name
  contactname: "contactName",
  contato: "contactName",
  responsavel: "contactName",
  responsável: "contactName",
  // email
  email: "contactEmail",
  "e-mail": "contactEmail",
  contactemail: "contactEmail",
  // phone
  phone: "contactPhone",
  telefone: "contactPhone",
  contactphone: "contactPhone",
  whatsapp: "contactPhone",
  // segment
  segment: "segment",
  segmento: "segment",
  setor: "segment",
  nicho: "segment",
  // budget
  budget: "campaignBudget",
  orcamento: "campaignBudget",
  orçamento: "campaignBudget",
  campaignbudget: "campaignBudget",
  // theses
  theses: "theses",
  teses: "theses",
  melhorias: "theses",
  // notes
  notes: "notes",
  notas: "notes",
  observacoes: "notes",
  observações: "notes",
  // status
  status: "status",
};

interface RecruitImportRow {
  name?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  segment?: string;
  campaignBudget?: string;
  theses?: string;
  notes?: string;
  status?: string;
}

export interface ImportPreviewRow {
  index: number;
  raw: Record<string, string>;
  parsed: {
    name?: string;
    contactName?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
    segment?: string | null;
    campaignBudget?: number | null;
    theses?: string | null;
    notes?: string | null;
    status: RecruitStatus;
  };
  errors: string[];
}

export interface ImportResult {
  ok: true;
  dryRun: boolean;
  total: number;
  valid: number;
  invalid: number;
  imported: number;
  rows: ImportPreviewRow[];
}

export interface ImportError {
  ok: false;
  error: string;
}

function detectSeparator(line: string): string {
  if (line.includes("\t")) return "\t";
  if (line.includes(";") && !line.includes(",")) return ";";
  return ",";
}

/*
  Tokenizer CSV stateful — processa a string inteira char-a-char,
  trackeando estado de aspas mesmo entre linhas (RFC 4180).
  Retorna array de linhas, cada linha é array de campos.
*/
function tokenizeCsv(csv: string, sep: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < csv.length; i++) {
    const ch = csv[i];

    if (inQuotes) {
      if (ch === '"') {
        if (csv[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === sep) {
      row.push(cur.trim());
      cur = "";
      continue;
    }
    if (ch === "\n" || ch === "\r") {
      // Considera fim de linha — finaliza row
      if (ch === "\r" && csv[i + 1] === "\n") i++;
      row.push(cur.trim());
      // só salva linhas com algum conteúdo
      if (row.some((c) => c.length > 0)) {
        rows.push(row);
      }
      row = [];
      cur = "";
      continue;
    }
    cur += ch;
  }

  // Última linha sem newline final
  if (cur.length > 0 || row.length > 0) {
    row.push(cur.trim());
    if (row.some((c) => c.length > 0)) {
      rows.push(row);
    }
  }
  return rows;
}

function normalizeHeader(h: string): keyof RecruitImportRow | null {
  const k = h.toLowerCase().trim();
  return HEADER_MAP[k] ?? null;
}

function parseStatus(value: string | undefined): RecruitStatus {
  if (!value) return RecruitStatus.ATIVO;
  const v = value.toUpperCase().trim();
  // Aliases EN (sistemas antigos)
  if (v === "ACTIVE") return RecruitStatus.ATIVO;
  if (v === "PAUSED" || v === "PAUSADA" || v === "PAUSADO")
    return RecruitStatus.PAUSADO;
  if (v === "COMPLETED" || v === "CLOSED" || v === "ENCERRADO" || v === "BAIXA")
    return RecruitStatus.BAIXA;
  return RecruitStatus.ATIVO;
}

function parseBudget(value: string | undefined): number | null {
  if (!value) return null;
  const cleaned = value.replace(/[R$\s.]/g, "").replace(",", ".");
  const num = Number(cleaned);
  if (Number.isNaN(num) || num < 0) return null;
  return num;
}

function buildPreview(csv: string): ImportPreviewRow[] {
  if (!csv.trim()) return [];

  // Pega só primeira linha pra detectar separador
  const firstLineEnd = csv.search(/\r?\n/);
  const firstLine = firstLineEnd > 0 ? csv.slice(0, firstLineEnd) : csv;
  const sep = detectSeparator(firstLine);

  const allRows = tokenizeCsv(csv, sep);
  if (allRows.length === 0) return [];

  const headersRaw = allRows[0];
  const headerMap: Array<keyof RecruitImportRow | null> =
    headersRaw.map(normalizeHeader);

  const rows: ImportPreviewRow[] = [];
  for (let i = 1; i < allRows.length; i++) {
    const cells = allRows[i];
    const raw: Record<string, string> = {};
    const row: RecruitImportRow = {};
    const notesAccum: string[] = [];

    headersRaw.forEach((h, idx) => {
      raw[h] = cells[idx] ?? "";
      const key = headerMap[idx];
      const v = (cells[idx] ?? "").trim();
      if (key && v.length > 0) {
        // Para `notes`, concatena observações + melhorias (se ambas existem)
        if (key === "notes" && row.notes) {
          notesAccum.push(row.notes, v);
          row.notes = notesAccum.join("\n\n");
        } else {
          row[key] = v;
        }
      }
    });

    const errors: string[] = [];
    if (!row.name || row.name.length < 2) {
      errors.push("Nome ausente ou muito curto");
    }
    if (
      row.contactEmail &&
      !row.contactEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    ) {
      errors.push("E-mail inválido");
    }
    const budget = parseBudget(row.campaignBudget);
    if (row.campaignBudget && budget === null) {
      errors.push("Orçamento inválido");
    }

    rows.push({
      index: i,
      raw,
      parsed: {
        name: row.name,
        contactName: row.contactName ?? null,
        contactEmail: row.contactEmail ?? null,
        contactPhone: row.contactPhone ?? null,
        segment: row.segment ?? null,
        campaignBudget: budget,
        theses: row.theses ?? null,
        notes: row.notes ?? null,
        status: parseStatus(row.status),
      },
      errors,
    });
  }
  return rows;
}

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Não autorizado");
  if (session.user.role !== UserRole.ADMIN) {
    throw new Error("Apenas comandantes podem importar recrutas.");
  }
  return session;
}

export async function importRecruitsAction(
  _prev: ImportResult | ImportError | undefined,
  formData: FormData,
): Promise<ImportResult | ImportError> {
  await requireAdmin();
  const csv = String(formData.get("csv") ?? "").trim();
  const mode = String(formData.get("mode") ?? "preview");

  if (!csv) {
    return { ok: false, error: "Cole o CSV no campo abaixo." };
  }

  const rows = buildPreview(csv);
  if (rows.length === 0) {
    return {
      ok: false,
      error: "Nenhuma linha de dados detectada. O cabeçalho está na primeira linha?",
    };
  }

  const valid = rows.filter((r) => r.errors.length === 0);
  const invalid = rows.length - valid.length;

  if (mode === "preview") {
    return {
      ok: true,
      dryRun: true,
      total: rows.length,
      valid: valid.length,
      invalid,
      imported: 0,
      rows,
    };
  }

  let imported = 0;
  if (valid.length > 0) {
    const result = await prisma.recruit.createMany({
      data: valid.map((r) => ({
        name: r.parsed.name!,
        contactName: r.parsed.contactName,
        contactEmail: r.parsed.contactEmail,
        contactPhone: r.parsed.contactPhone,
        segment: r.parsed.segment,
        campaignBudget:
          typeof r.parsed.campaignBudget === "number"
            ? new Prisma.Decimal(r.parsed.campaignBudget)
            : null,
        theses: r.parsed.theses,
        notes: r.parsed.notes,
        status: r.parsed.status,
      })),
    });
    imported = result.count;
  }

  revalidatePath("/recrutas");
  revalidatePath("/comando");

  return {
    ok: true,
    dryRun: false,
    total: rows.length,
    valid: valid.length,
    invalid,
    imported,
    rows,
  };
}
