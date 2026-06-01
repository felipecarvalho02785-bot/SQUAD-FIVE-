import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import type { UserRole } from "@prisma/client";

/*
  Config edge-safe do Auth.js v5 (sem PrismaAdapter, para uso no middleware).
  A configuracao completa — com adapter de banco — vive em lib/auth/index.ts.
*/

const PROTECTED_PREFIXES = [
  "/comando",
  "/recrutas",
  "/operacoes",
  "/pelotao",
  "/briefings",
  "/ordens",
  "/squad-tasks",
  "/quartel",
];

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [Google],
  callbacks: {
    async signIn({ profile }) {
      const allowedDomain = process.env.AUTH_ALLOWED_DOMAIN;
      if (!allowedDomain) {
        return true;
      }
      const email = profile?.email;
      if (typeof email !== "string") {
        return false;
      }
      return email.toLowerCase().endsWith(`@${allowedDomain.toLowerCase()}`);
    },
    authorized({ auth, request }) {
      const isLoggedIn = Boolean(auth?.user);
      const path = request.nextUrl.pathname;
      const isProtected = PROTECTED_PREFIXES.some(
        (prefix) => path === prefix || path.startsWith(`${prefix}/`),
      );
      if (path === "/") {
        return isLoggedIn;
      }
      if (isProtected) {
        return isLoggedIn;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        if (typeof user.id === "string") {
          token.id = user.id;
        }
        const role = (user as { role?: UserRole }).role;
        if (role) {
          token.role = role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        if (typeof token.id === "string") {
          session.user.id = token.id;
        }
        const role = token.role as UserRole | undefined;
        if (role) {
          session.user.role = role;
        }
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
