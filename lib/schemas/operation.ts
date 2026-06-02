import { z } from "zod";
import { OperationStatus } from "@prisma/client";

const emptyStringToUndefined = z.literal("").transform(() => undefined);

function optionalString() {
  return z.union([z.string().trim().min(1), emptyStringToUndefined]).optional();
}

function optionalDate() {
  return z
    .union([
      z
        .string()
        .trim()
        .refine((s) => !Number.isNaN(Date.parse(s)), "Data inválida")
        .transform((s) => new Date(s)),
      emptyStringToUndefined,
    ])
    .optional();
}

export const operationInputSchema = z.object({
  recruitId: z.string().trim().min(1, "Recruta é obrigatório"),
  productId: z.string().trim().min(1, "Produto é obrigatório"),
  codeName: z
    .string()
    .trim()
    .min(3, "Nome de código precisa ter no mínimo 3 caracteres")
    .max(120, "Nome longo demais"),
  ownerId: optionalString(),
  startedAt: optionalDate(),
  targetEndAt: optionalDate(),
});

export type OperationInput = z.infer<typeof operationInputSchema>;

export const operationFilterSchema = z.object({
  status: z
    .union([z.nativeEnum(OperationStatus), z.literal("all")])
    .optional()
    .default("all"),
  productId: z.string().optional(),
  health: z
    .union([
      z.literal("em_campo"),
      z.literal("atencao"),
      z.literal("baixa_iminente"),
      z.literal("extracao"),
      z.literal("all"),
    ])
    .optional()
    .default("all"),
});

export type OperationFilter = z.infer<typeof operationFilterSchema>;
