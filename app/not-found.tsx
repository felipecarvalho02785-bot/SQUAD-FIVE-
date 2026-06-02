import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";
import { Mascot } from "@/components/squad/mascot";
import { AmbientLayer } from "@/components/squad/ambient-layer";

/*
  404 — Tier 1 imersivo.
  Copy oficial: docs/02_MANUAL_VOZ_E_TOM.md secao "Tela 404".
*/

export const metadata = {
  title: "Setor desconhecido — Squad Five",
};

export default function NotFoundPage() {
  return (
    <main className="relative min-h-dvh flex flex-col items-center justify-center px-6 py-12 overflow-hidden bg-combat">
      <AmbientLayer particles={6} intensity="subtle" />

      <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-8 text-center">
        <Mascot size={140} useAsset={true} breathing />

        <div className="flex flex-col items-center gap-2">
          <span className="font-display uppercase tracking-[0.4em] text-[10px] text-bronze">
            Erro 404
          </span>
          <h1 className="font-display text-[28px] sm:text-[32px] font-medium leading-tight text-cream">
            Esse setor não consta no mapa.
          </h1>
          <p className="text-cream-muted text-[13px] max-w-[34ch] mt-1">
            A página que você procurou não existe ou foi extraída.
          </p>
        </div>

        <Link
          href="/comando"
          className="inline-flex items-center gap-2 h-11 px-6 rounded-input bg-copper text-combat font-display uppercase tracking-[0.06em] text-[13px] font-medium hover:bg-bronze active:scale-[0.98] transition-all lift-hover"
        >
          <IconArrowLeft size={16} />
          Voltar ao Comando Central
        </Link>
      </div>
    </main>
  );
}
