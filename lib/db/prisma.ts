import { PrismaClient } from "@prisma/client";

/*
  Singleton do Prisma Client.
  Em dev, o Next.js faz hot-reload e cada reload criaria uma nova instancia
  (esgotando conexoes do Postgres). Guardar no globalThis previne isso.
*/

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
