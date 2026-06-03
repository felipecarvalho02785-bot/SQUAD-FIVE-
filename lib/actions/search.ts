"use server";

import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth";

export interface SearchResult {
  type: "recruta" | "operacao" | "ordem" | "biblioteca";
  id: string;
  title: string;
  subtitle?: string;
  href: string;
}

export async function searchEverything(
  q: string,
  limit = 8,
): Promise<SearchResult[]> {
  const session = await auth();
  if (!session?.user) return [];

  const query = q.trim();
  if (query.length < 2) return [];

  const filter = { contains: query, mode: "insensitive" as const };

  const [recrutas, operacoes, ordens, biblioteca] = await Promise.all([
    prisma.recruit.findMany({
      where: {
        OR: [
          { name: filter },
          { contactName: filter },
          { contactEmail: filter },
        ],
      },
      take: limit,
      select: { id: true, name: true, segment: true, status: true },
      orderBy: { name: "asc" },
    }),
    prisma.operation.findMany({
      where: {
        OR: [{ codeName: filter }, { recruit: { name: filter } }],
      },
      take: limit,
      select: {
        id: true,
        codeName: true,
        status: true,
        recruit: { select: { name: true } },
        product: { select: { name: true } },
      },
      orderBy: { startedAt: "desc" },
    }),
    prisma.order.findMany({
      where: { title: filter, status: { not: "CUMPRIDA" } },
      take: limit,
      select: {
        id: true,
        title: true,
        squadTask: true,
        stage: {
          select: { operation: { select: { id: true, codeName: true } } },
        },
      },
      orderBy: { dueDate: "asc" },
    }),
    prisma.libraryItem.findMany({
      where: {
        OR: [
          { title: filter },
          { content: filter },
          { tags: { has: query.toLowerCase() } },
        ],
      },
      take: limit,
      select: { id: true, title: true, category: true },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const results: SearchResult[] = [];

  for (const r of recrutas) {
    results.push({
      type: "recruta",
      id: r.id,
      title: r.name,
      subtitle: r.segment ?? r.status.toLowerCase(),
      href: `/recrutas/${r.id}`,
    });
  }
  for (const op of operacoes) {
    results.push({
      type: "operacao",
      id: op.id,
      title: op.codeName,
      subtitle: `${op.recruit.name} · ${op.product.name}`,
      href: `/operacoes/${op.id}`,
    });
  }
  for (const o of ordens) {
    results.push({
      type: "ordem",
      id: o.id,
      title: o.title,
      subtitle: o.squadTask
        ? "Tarefa interna do squad"
        : (o.stage?.operation.codeName ?? "Sem operação"),
      href: o.stage?.operation.id
        ? `/operacoes/${o.stage.operation.id}`
        : "/squad-tasks",
    });
  }
  for (const b of biblioteca) {
    results.push({
      type: "biblioteca",
      id: b.id,
      title: b.title,
      subtitle: b.category.toLowerCase(),
      href: `/biblioteca/${b.id}`,
    });
  }

  return results;
}
