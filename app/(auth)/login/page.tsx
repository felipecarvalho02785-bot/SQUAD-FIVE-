import { IconShield, IconBrandGoogleFilled } from "@tabler/icons-react";
import { signIn } from "@/lib/auth";

/*
  Tela de acesso (login).
  Tier 1 (imersivo) — versao basica do MVP. Sera refinada na Sprint 8.
  Copy oficial: docs/02_MANUAL_VOZ_E_TOM.md secao "Tela de acesso".
*/

export const metadata = {
  title: "Acesso — Squad Five",
};

async function loginWithGoogle() {
  "use server";
  await signIn("google", { redirectTo: "/comando" });
}

export default function LoginPage() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-6 py-12 bg-combat text-cream">
      <div className="w-full max-w-sm flex flex-col items-center gap-10">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-full bg-jungle border border-patrol flex items-center justify-center">
            <IconShield size={28} stroke={1.5} className="text-bronze" />
          </div>
          <h1 className="font-display text-[28px] font-medium leading-tight">
            Pronto pra operação?
          </h1>
          <p className="text-cream-muted text-[13px] max-w-[28ch]">
            Acesse com seu e-mail da E3 e mobilize sua próxima operação.
          </p>
        </div>

        <form action={loginWithGoogle} className="w-full">
          <button
            type="submit"
            className="w-full h-11 rounded-input bg-copper text-combat font-display uppercase tracking-[0.05em] text-[13px] font-medium flex items-center justify-center gap-2 hover:bg-bronze active:scale-[0.98] transition-all"
          >
            <IconBrandGoogleFilled size={16} stroke={1.5} />
            Entrar com e-mail da E3
          </button>
        </form>

        <p className="font-display uppercase tracking-[0.15em] text-[10px] text-cream-dim">
          Sistema operacional · Squad 5
        </p>
      </div>
    </main>
  );
}
