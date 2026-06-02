import Image from "next/image";
import { cn } from "@/lib/utils";

/*
  Mascote Squad 5 — escudo com gorila berrando.

  - Default (useAsset=true): renderiza public/brand/squad-5-shield.png.
  - Fallback (useAsset=false): SVG placeholder com tokens da paleta.
*/

interface MascotProps {
  size?: number;
  useAsset?: boolean;
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

function ShieldPlaceholder() {
  return (
    <svg
      viewBox="0 0 100 110"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <defs>
        <linearGradient id="shield-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="var(--color-jungle-glow)" />
          <stop offset="100%" stopColor="var(--color-jungle-deep)" />
        </linearGradient>
        <linearGradient id="copper-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="var(--color-bronze)" />
          <stop offset="100%" stopColor="var(--color-copper)" />
        </linearGradient>
        <filter id="emboss" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="0.6" />
        </filter>
      </defs>

      <path
        d="M50 4 L92 12 L92 60 Q92 84 50 104 Q8 84 8 60 L8 12 Z"
        fill="url(#copper-grad)"
        stroke="var(--color-copper-deep)"
        strokeWidth="1"
      />

      <path
        d="M50 9 L87 16 L87 60 Q87 80 50 98 Q13 80 13 60 L13 16 Z"
        fill="url(#shield-grad)"
        stroke="var(--color-patrol)"
        strokeWidth="0.5"
      />

      <text
        x="50"
        y="32"
        textAnchor="middle"
        fontFamily="Oswald, Impact, sans-serif"
        fontSize="14"
        fontWeight="700"
        fill="url(#copper-grad)"
        stroke="var(--color-copper-deep)"
        strokeWidth="0.6"
        letterSpacing="1"
      >
        SQUAD
      </text>

      <g transform="translate(50, 58)" filter="url(#emboss)">
        <ellipse cx="0" cy="-2" rx="14" ry="11" fill="var(--color-jungle-deep)" />
        <circle cx="-6" cy="-4" r="1.3" fill="var(--color-bronze)" />
        <circle cx="6" cy="-4" r="1.3" fill="var(--color-bronze)" />
        <path
          d="M-5 2 Q0 6 5 2 L4 4 Q0 6 -4 4 Z"
          fill="var(--color-casualty-deep)"
          stroke="var(--color-combat)"
          strokeWidth="0.3"
        />
        <path
          d="M-13 6 Q-11 14 -8 14 L8 14 Q11 14 13 6 Z"
          fill="var(--color-jungle-deep)"
        />
      </g>

      <text
        x="50"
        y="92"
        textAnchor="middle"
        fontFamily="Oswald, Impact, sans-serif"
        fontSize="20"
        fontWeight="700"
        fill="url(#copper-grad)"
        stroke="var(--color-copper-deep)"
        strokeWidth="0.8"
      >
        5
      </text>
    </svg>
  );
}
