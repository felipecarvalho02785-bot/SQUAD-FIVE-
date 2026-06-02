import { LibraryCategory } from "@prisma/client";

export const CATEGORY_LABEL: Record<LibraryCategory, string> = {
  COPY: "Copy",
  ROTEIRO: "Roteiro",
  PROMPT: "Prompt IA",
  PROCESSO: "Processo",
  ANUNCIO: "Anúncio",
  EMAIL: "E-mail",
  WHATSAPP: "WhatsApp",
  OUTRO: "Outro",
};

export const CATEGORY_TONE: Record<LibraryCategory, string> = {
  COPY: "bg-bronze/20 text-bronze border-bronze/40",
  ROTEIRO: "bg-status-ok/15 text-status-ok-text border-status-ok/40",
  PROMPT: "bg-accent/20 text-accent border-accent/40",
  PROCESSO: "bg-surface-accent text-text-primary border-border-strong",
  ANUNCIO: "bg-status-warn/15 text-status-warn-text border-status-warn/40",
  EMAIL: "bg-status-critical/15 text-status-critical-text border-status-critical/40",
  WHATSAPP: "bg-status-ok/10 text-status-ok-text border-status-ok/30",
  OUTRO: "bg-surface-deep text-text-secondary border-border-default",
};

export const CATEGORIES_ORDER: LibraryCategory[] = [
  LibraryCategory.COPY,
  LibraryCategory.ROTEIRO,
  LibraryCategory.PROMPT,
  LibraryCategory.PROCESSO,
  LibraryCategory.ANUNCIO,
  LibraryCategory.EMAIL,
  LibraryCategory.WHATSAPP,
  LibraryCategory.OUTRO,
];
