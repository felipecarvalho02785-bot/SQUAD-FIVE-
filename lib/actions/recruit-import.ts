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
  // budget
  budget: "campaignBudget",
  orcamento: "campaignBudget",
  orçamento: "campaignBudget",
  campaignbudget: "campaignBudget",
  // theses
  theses: "theses",
  teses: "theses",
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

function parseLine(line: string, sep: string): string[] {
  // Suporta campos entre aspas com vírgulas dentro.
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === sep && !inQuotes) {
      out.push(cur.trim());
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur.trim());
  return out;
}

function normalizeHeader(h: string): keyof RecruitImportRow | null {
  const k = h.toLowerCase().trim();
  return HEADER_MAP[k] ?? null;
}

function parseStatus(value: string | undefined): RecruitStatus {
  if (!value) return RecruitStatus.ATIVO;
  const v = value.toUpperCase().trim();
  if (v === "PAUSADO" || v === "PAUSADA") return RecruitStatus.PAUSADO;
  if (v === "BAIXA" || v === "ENCERRADO") return RecruitStatus.BAIXA;
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
  const lines = csv
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length === 0) return [];

  const sep = detectSeparator(lines[0]);
  const headersRaw = parseLine(lines[0], sep);
  const headerMap: Array<keyof RecruitImportRow | null> =
    headersRaw.map(normalizeHeader);

  const rows: ImportPreviewRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = parseLine(lines[i], sep);
    const raw: Record<string, string> = {};
    const row: RecruitImportRow = {};
    headersRaw.forEach((h, idx) => {
      raw[h] = cells[idx] ?? "";
      const key = headerMap[idx];
      if (key) {
        const v = cells[idx]?.trim() ?? "";
        if (v.length > 0) row[key] = v;
      }
    });

    const errors: string[] = [];
    if (!row.name || row.name.length < 2) {
      errors.push("Nome ausente ou muito curto");
    }
    if (row.contactEmail && !row.contactEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
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
