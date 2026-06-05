import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db/prisma";
import { authConfig } from "./config";

/*
  Auth.js v5 — configuracao completa server-side.
  Usa JWT como estrategia de sessao (necessario para o middleware no Edge),
  mas mantem o PrismaAdapter para sincronizar usuarios na tabela `users`.

  events.signIn: o PrismaAdapter cria a row em `accounts` so na PRIMEIRA
  vez que o usuario loga com um provider. Em re-logins (incluindo
  re-consentimento com novo escopo), tokens novos chegam mas NAO sao
  persistidos. Este evento faz o update manual pra capturar refresh_token
  e access_token frescos.
*/

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  ...authConfig,
  events: {
    async signIn({ account }) {
      if (!account || account.provider !== "google") return;
      if (!account.refresh_token && !account.access_token) return;
      try {
        await prisma.account.updateMany({
          where: {
            provider: account.provider,
            providerAccountId: account.providerAccountId,
          },
          data: {
            ...(account.refresh_token
              ? { refresh_token: account.refresh_token }
              : {}),
            access_token: account.access_token ?? null,
            expires_at:
              typeof account.expires_at === "number"
                ? account.expires_at
                : null,
            scope: account.scope ?? null,
            token_type: account.token_type ?? null,
            id_token: account.id_token ?? null,
          },
        });
      } catch (err) {
        console.error("[auth] failed to persist OAuth tokens:", err);
      }
    },
  },
});
