"use client";

import { usePathname } from "next/navigation";

/*
  PageTransition — fade-in via CSS animation triggered by key change.
  Sem useState/useEffect — o React re-monta o filho quando pathname muda
  e a animação CSS dispara naturalmente.
*/

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="animate-page-in">
      {children}
    </div>
  );
}
