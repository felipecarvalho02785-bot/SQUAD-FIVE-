import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Não autorizado", { status: 401 });
  }

  const recruits = await prisma.recruit.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { operations: true } },
    },
  });

  const headers = [
    "Nome",
    "Contato",
    "Email",
    "Telefone",
    "Segmento",
    "Orcamento (BRL)",
    "Status",
    "Operacoes",
    "Alistado em",
    "Observacoes",
  ];

  const rows = recruits.map((r) =>
    [
      csvEscape(r.name),
      csvEscape(r.contactName),
      csvEscape(r.contactEmail),
      csvEscape(r.contactPhone),
      csvEscape(r.segment),
      csvEscape(r.campaignBudget?.toString() ?? ""),
      csvEscape(r.status),
      csvEscape(r._count.operations),
      csvEscape(formatDate(r.createdAt)),
      csvEscape(r.notes ?? ""),
    ].join(","),
  );

  const csv = "﻿" + [headers.join(","), ...rows].join("\r\n");
  const today = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="squad-five-recrutas-${today}.csv"`,
    },
  });
}
