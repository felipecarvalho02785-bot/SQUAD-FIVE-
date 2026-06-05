import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/config";

/*
  Proxy do Next.js 16 (antigo middleware).
  Roda no Edge runtime — por isso usa a config edge-safe (sem PrismaAdapter).
  A logica de autorizacao esta no callback `authorized` em lib/auth/config.ts.
*/

const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: [
    // Aplica em tudo exceto rotas internas do Next, api/auth, /login e /share/*
    "/((?!api/auth|_next/static|_next/image|favicon.ico|login|share).*)",
  ],
};
