import { z } from "zod";
import { RecruitStatus } from "@prisma/client";

/*
  Schemas de validacao do Recruta.
  Toda entrada do usuario passa por aqui antes de chegar no Prisma.
*/

const emptyStringToUndefined = z.literal("").transform(() => undefined);

function optionalString() {
  return z.union([z.string().trim().min(1), emptyStringToUndefined]).optional();
}

function optionalEmail() {
  return z
    .union([
      z.string().trim().email("E-mail inválido"),
      emptyStringToUndefined,
    ])
    .optional();
}

function optionalDecimal() {
  return z
    .union([
      z.coerce.number().nonnegative("Valor não pode ser negativo"),
      emptyStringToUndefined,
    ])
    .optional();
}

export const recruitInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nome precisa ter no mínimo 2 caracteres")
    .max(120, "Nome longo demais"),
  contactName: optionalString(),
  contactEmail: optionalEmail(),
  contactPhone: optionalString(),
  segment: optionalString(),
  campaignBudget: optionalDecimal(),
  theses: optionalString(),
  notes: optionalString(),
  status: z.nativeEnum(RecruitStatus).default(RecruitStatus.ATIVO),
});

export type RecruitInput = z.infer<typeof recruitInputSchema>;

export const recruitFilterSchema = z.object({
  q: z.string().trim().optional(),
  status: z
    .union([z.nativeEnum(RecruitStatus), z.literal("all")])
    .optional()
    .default("all"),
});

export type RecruitFilter = z.infer<typeof recruitFilterSchema>;
