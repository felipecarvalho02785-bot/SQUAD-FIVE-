import { z } from "zod";
import { LibraryCategory } from "@prisma/client";

const emptyToUndef = z.literal("").transform(() => undefined);

function optionalString() {
  return z.union([z.string().trim().min(1), emptyToUndef]).optional();
}

export const libraryInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Título precisa ter no mínimo 3 caracteres")
    .max(160, "Título longo demais"),
  category: z.nativeEnum(LibraryCategory).default(LibraryCategory.OUTRO),
  content: z
    .string()
    .trim()
    .min(1, "Conteúdo não pode ficar vazio")
    .max(50_000, "Conteúdo muito longo (limite 50k caracteres)"),
  tags: optionalString(),
});

export type LibraryInput = z.infer<typeof libraryInputSchema>;

export const libraryFilterSchema = z.object({
  q: z.string().trim().optional(),
  category: z
    .union([z.nativeEnum(LibraryCategory), z.literal("all")])
    .optional()
    .default("all"),
});

export type LibraryFilter = z.infer<typeof libraryFilterSchema>;
