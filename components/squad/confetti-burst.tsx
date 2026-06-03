"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";

/*
  ConfettiBurst — dispara confetti militar (folhas verdes + faíscas cobre)
  uma única vez quando o componente monta. Usado em comemorações de
  marcos: última etapa cumprida, recruta novo, etc.
  Respeita prefers-reduced-motion.
*/

interface ConfettiBurstProps {
  /** Quando true, dispara. Mudar pra false e voltar pra true re-dispara. */
  fire?: boolean;
  /** Intensidade do burst */
  intensity?: "subtle" | "full";
}

export function ConfettiBurst({
  fire = true,
  intensity = "full",
}: ConfettiBurstProps) {
  useEffect(() => {
    if (!fire) return;
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) return;

    const burst = intensity === "full" ? 120 : 60;
    const colors = ["#4a6b45", "#a85a3a", "#d78a5c", "#2f4a2c"];

    confetti({
      particleCount: burst,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.8 },
      colors,
      ticks: 220,
      shapes: ["square", "circle"],
    });
    confetti({
      particleCount: burst,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.8 },
      colors,
      ticks: 220,
      shapes: ["square", "circle"],
    });

    if (intensity === "full") {
      setTimeout(() => {
        confetti({
          particleCount: 80,
          spread: 100,
          origin: { x: 0.5, y: 0.5 },
          colors,
          ticks: 180,
          shapes: ["square"],
        });
      }, 250);
    }
  }, [fire, intensity]);

  return null;
}
