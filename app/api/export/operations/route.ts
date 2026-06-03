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

function formatDate(date: Date | null): string {
  if (!date) return "";
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

  const operations = await prisma.operation.findMany({
    orderBy: { startedAt: "desc" },
    include: {
      recruit: { select: { name: true } },
      product: { select: { name: true } },
      owner: { select: { name: true, email: true } },
      stages: {
        select: { status: true, name: true, order: true },
        orderBy: { order: "asc" },
      },
      _count: { select: { briefings: true, gaps: true } },
    },
  });

  const headers = [
    "Nome de codigo",
    "Recruta",
    "Produto",
    "Responsavel",
    "Status",
    "Etapa atual",
    "Etapas cumpridas",
    "Total etapas",
    "Briefings",
    "Gaps",
    "Iniciada em",
    "Encerrada em",
  ];

  const rows = operations.map((op) => {
    const current = op.stages.find((s) => s.status === "EM_ANDAMENTO");
    const done = op.stages.filter((s) => s.status === "CUMPRIDA").length;
    return [
      csvEscape(op.codeName),
      csvEscape(op.recruit.name),
      csvEscape(op.product.name),
      csvEscape(op.owner?.name ?? op.owner?.email ?? ""),
      csvEscape(op.status),
      csvEscape(current ? `${current.order}. ${current.name}` : "—"),
      csvEscape(done),
      csvEscape(op.stages.length),
      csvEscape(op._count.briefings),
      csvEscape(op._count.gaps),
      csvEscape(formatDate(op.startedAt)),
      csvEscape(formatDate(op.endedAt)),
    ].join(",");
  });

  const csv = "﻿" + [headers.join(","), ...rows].join("\r\n");
  const today = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="squad-five-operacoes-${today}.csv"`,
    },
  });
}
