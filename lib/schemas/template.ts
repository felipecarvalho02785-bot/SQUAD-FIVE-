import { z } from "zod";

export const stageTemplateUpdateSchema = z.object({
  id: z.string().trim().min(1),
  name: z
    .string()
    .trim()
    .min(2, "Nome precisa ter no mínimo 2 caracteres")
    .max(80, "Nome longo demais"),
  slaDays: z.coerce
    .number()
    .int("SLA em dias inteiros")
    .min(1, "Mínimo 1 dia")
    .max(365, "Máximo 365 dias"),
});

export type StageTemplateUpdate = z.infer<typeof stageTemplateUpdateSchema>;

export const stageTemplateCreateSchema = z.object({
  productId: z.string().trim().min(1),
  name: z.string().trim().min(2).max(80),
  slaDays: z.coerce.number().int().min(1).max(365),
});

export type StageTemplateCreate = z.infer<typeof stageTemplateCreateSchema>;
