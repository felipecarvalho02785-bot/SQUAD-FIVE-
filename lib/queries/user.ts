import { prisma } from "@/lib/db/prisma";

export async function listSquadMembers() {
  return prisma.user.findMany({
    orderBy: [{ role: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
    },
  });
}

export async function listActiveRecruitsLite() {
  return prisma.recruit.findMany({
    where: { status: "ATIVO" },
    orderBy: { name: "asc" },
    select: { id: true, name: true, segment: true },
  });
}
