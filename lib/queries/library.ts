import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { LibraryFilter } from "@/lib/schemas/library";

const LIBRARY_SELECT = {
  id: true,
  title: true,
  category: true,
  content: true,
  tags: true,
  createdAt: true,
  updatedAt: true,
  createdBy: { select: { id: true, name: true, email: true } },
} satisfies Prisma.LibraryItemSelect;

export type LibraryItemWithAuthor = Awaited<
  ReturnType<typeof listLibraryItems>
>[number];

export async function listLibraryItems(
  filter: LibraryFilter = { category: "all" },
) {
  const where: Prisma.LibraryItemWhereInput = {};

  if (filter.category && filter.category !== "all") {
    where.category = filter.category;
  }

  if (filter.q && filter.q.trim()) {
    where.OR = [
      { title: { contains: filter.q, mode: "insensitive" } },
      { content: { contains: filter.q, mode: "insensitive" } },
      { tags: { has: filter.q.toLowerCase() } },
    ];
  }

  return prisma.libraryItem.findMany({
    where,
    orderBy: [{ updatedAt: "desc" }],
    select: LIBRARY_SELECT,
  });
}

export async function getLibraryItemById(id: string) {
  return prisma.libraryItem.findUnique({
    where: { id },
    select: LIBRARY_SELECT,
  });
}

export async function countLibraryByCategory() {
  const grouped = await prisma.libraryItem.groupBy({
    by: ["category"],
    _count: { _all: true },
  });
  const map: Record<string, number> = {};
  for (const row of grouped) {
    map[row.category] = row._count._all;
  }
  return map;
}
