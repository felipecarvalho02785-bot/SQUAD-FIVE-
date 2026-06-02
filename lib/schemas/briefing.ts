import { z } from "zod";

const emptyToUndef = z.literal("").transform(() => undefined);

function optionalString() {
  return z.union([z.string().trim().min(1), emptyToUndef]).optional();
}

export const briefingInputSchema = z.object({
  operationId: z.string().trim().min(1, "Operação é obrigatória"),
  date: z
    .string()
    .trim()
    .refine((s) => !Number.isNaN(Date.parse(s)), "Data inválida")
    .transform((s) => new Date(s)),
  durationMin: z
    .union([z.coerce.number().int().positive(), emptyToUndef])
    .optional(),
  attendees: optionalString(),
  notes: optionalString(),
  npsScore: z
    .union([
      z.coerce.number().int().min(0).max(10),
      emptyToUndef,
    ])
    .optional(),
});

export type BriefingInput = z.infer<typeof briefingInputSchema>;
