import { IconBrandGoogleFilled } from "@tabler/icons-react";
import { signIn } from "@/lib/auth";
import { Mascot } from "@/components/squad/mascot";
import { AmbientLayer } from "@/components/squad/ambient-layer";

/*
  Tela de acesso (login) — Tier 1 imersivo.
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
    <main className="relative min-h-dvh flex flex-col items-center justify-center px-6 py-12 overflow-hidden bg-surface-base">
      <AmbientLayer particles={10} intensity="strong" />

      <div className="relative z-content w-full max-w-sm flex flex-col items-center gap-10 text-center">
        <div className="flex flex-col items-center gap-5">
          <Mascot size={120} useAsset={true} breathing priority />

          <div className="flex flex-col items-center gap-2">
            <span className="font-display uppercase tracking-[0.4em] text-[10px] text-bronze">
              Squad Five
            </span>
            <h1 className="font-display text-[34px] sm:text-[40px] font-medium leading-[1.05] text-text-primary">
              Pronto pra operação?
            </h1>
            <p className="text-text-secondary text-[13px] max-w-[30ch] mt-1">
              Acesse com seu e-mail da E3 e mobilize sua próxima operação.
            </p>
          </div>
        </div>

        <form action={loginWithGoogle} className="w-full flex flex-col gap-3">
          <button
            type="submit"
            className="w-full min-h-12 h-12 rounded-input bg-accent-cta text-accent-cta-fg font-display uppercase tracking-[0.06em] text-[13px] font-medium flex items-center justify-center gap-2.5 hover:bg-accent-hover active:scale-[0.98] transition-all shadow-[0_0_24px_-8px_rgba(168,90,58,0.6)] lift-hover"
          >
            <IconBrandGoogleFilled size={16} aria-hidden />
            Entrar com e-mail da E3
          </button>
          <p className="text-text-dim text-[10px]">
            Acesso restrito ao squad. Solicite alistamento ao comandante.
          </p>
        </form>

        <footer className="flex items-center gap-2 mt-2">
          <span
            className="w-1 h-1 rounded-full bg-status-ok animate-pulse-status"
            aria-hidden
          />
          <span className="font-display uppercase tracking-[0.2em] text-[10px] text-text-dim">
            Sistema operacional · Squad 5
          </span>
        </footer>
      </div>
    </main>
  );
}
