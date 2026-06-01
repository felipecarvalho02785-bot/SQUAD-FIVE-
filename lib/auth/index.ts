import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db/prisma";
import { authConfig } from "./config";

/*
  Auth.js v5 — configuracao completa server-side.
  Usa JWT como estrategia de sessao (necessario para o middleware no Edge),
  mas mantem o PrismaAdapter para sincronizar usuarios na tabela `users`.
*/

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  ...authConfig,
});
