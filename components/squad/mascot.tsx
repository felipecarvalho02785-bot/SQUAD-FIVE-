import Image from "next/image";
import { cn } from "@/lib/utils";

/*
  Mascote Squad 5 — escudo com gorila berrando.

  Implementacao em 2 modos:

  1) Se existir public/brand/squad-5-shield.png o componente usa o asset real.
  2) Caso contrario, renderiza um placeholder SVG do escudo com texto
     "SQUAD 5" em cobre sobre verde-selva — pra a UI nao ficar quebrada
     enquanto o asset oficial nao chega.

  Pra "ativar" o asset real basta:
    - colocar squad-5-shield.png em public/brand/
    - passar useAsset prop true (ou ajustar o default no codigo)

  Tamanhos sugeridos:
    - 24-32px: topbar, avatar pequeno
    - 56-72px: header de login
    - 120-200px: tela 404, comemoracoes
*/

interface MascotProps {
  size?: number;
  /** Tenta usar o PNG real em /brand/. Quando false, sempre renderiza o SVG placeholder. */
  useAsset?: boolean;
  /** Anima respiracao (Tier 1). */
  breathing?: boolean;
  className?: string;
  priority?: boolean;
  alt?: string;
}

export function Mascot({
  size = 64,
  useAsset = false,
  breathing = false,
  className,
  priority = false,
  alt = "Brasão Squad Five",
}: MascotProps) {
  if (useAsset) {
    return (
      <div
        className={cn(breathing && "animate-breathe", className)}
        style={{ width: size, height: size }}
      >
        <Image
          src="/brand/squad-5-shield.png"
          alt={alt}
          width={size * 2}
          height={size * 2}
          priority={priority}
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(breathing && "animate-breathe", className)}
      style={{ width: size, height: size }}
      aria-label={alt}
      role="img"
    >
      <ShieldPlaceholder />
    </div>
  );
}

/*
  SVG do escudo placeholder.
  Replica visual aproximada do logo enviado pelo usuario enquanto o asset
  oficial nao esta na pasta public/brand/.
*/
function ShieldPlaceholder() {
  return (
    <svg
      viewBox="0 0 100 110"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <defs>
        <linearGradient id="shield-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3d6038" />
          <stop offset="100%" stopColor="#1f3320" />
        </linearGradient>
        <linearGradient id="copper-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#d78a5c" />
          <stop offset="100%" stopColor="#a85a3a" />
        </linearGradient>
        <filter id="emboss" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="0.6" />
        </filter>
      </defs>

      {/* Borda externa do escudo (cobre) */}
      <path
        d="M50 4 L92 12 L92 60 Q92 84 50 104 Q8 84 8 60 L8 12 Z"
        fill="url(#copper-grad)"
        stroke="#5a2e1d"
        strokeWidth="1"
      />

      {/* Interior do escudo (verde) */}
      <path
        d="M50 9 L87 16 L87 60 Q87 80 50 98 Q13 80 13 60 L13 16 Z"
        fill="url(#shield-grad)"
        stroke="#4a6b45"
        strokeWidth="0.5"
      />

      {/* Texto SQUAD */}
      <text
        x="50"
        y="32"
        textAnchor="middle"
        fontFamily="Oswald, Impact, sans-serif"
        fontSize="14"
        fontWeight="700"
        fill="url(#copper-grad)"
        stroke="#5a2e1d"
        strokeWidth="0.6"
        letterSpacing="1"
      >
        SQUAD
      </text>

      {/* Silhueta gorila (simplificada) */}
      <g transform="translate(50, 58)" filter="url(#emboss)">
        <ellipse cx="0" cy="-2" rx="14" ry="11" fill="#2a3625" />
        <circle cx="-6" cy="-4" r="1.3" fill="#d78a5c" />
        <circle cx="6" cy="-4" r="1.3" fill="#d78a5c" />
        <path
          d="M-5 2 Q0 6 5 2 L4 4 Q0 6 -4 4 Z"
          fill="#7a2020"
          stroke="#2a0a0a"
          strokeWidth="0.3"
        />
        {/* "Ombros" */}
        <path
          d="M-13 6 Q-11 14 -8 14 L8 14 Q11 14 13 6 Z"
          fill="#2a3625"
        />
      </g>

      {/* Numero 5 */}
      <text
        x="50"
        y="92"
        textAnchor="middle"
        fontFamily="Oswald, Impact, sans-serif"
        fontSize="20"
        fontWeight="700"
        fill="url(#copper-grad)"
        stroke="#5a2e1d"
        strokeWidth="0.8"
      >
        5
      </text>
    </svg>
  );
}
