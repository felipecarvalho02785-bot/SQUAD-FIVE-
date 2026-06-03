import { z } from "zod";
import { OrderStatus } from "@prisma/client";

const emptyToUndef = z.literal("").transform(() => undefined);

function optionalString() {
  return z.union([z.string().trim().min(1), emptyToUndef]).optional();
}

function optionalDate() {
  return z
    .union([
      z
        .string()
        .trim()
        .refine((s) => !Number.isNaN(Date.parse(s)), "Data inválida")
        .transform((s) => new Date(s)),
      emptyToUndef,
    ])
    .optional();
}

export const RECURRENCE_FREQUENCIES = [
  "WEEKLY",
  "BIWEEKLY",
  "MONTHLY",
] as const;

export type RecurrenceFrequency = (typeof RECURRENCE_FREQUENCIES)[number];

export interface RecurrenceConfig {
  frequency: RecurrenceFrequency;
  /** 0=domingo, 1=segunda, ... 6=sábado. Aplicável a WEEKLY/BIWEEKLY. */
  dayOfWeek?: number;
  /** 1-31. Aplicável a MONTHLY. */
  dayOfMonth?: number;
}

export const orderInputSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Título precisa ter no mínimo 3 caracteres")
      .max(160, "Título longo demais"),
    description: optionalString(),
    operationStageId: optionalString(),
    squadTask: z
      .union([z.literal("true"), z.literal("false"), z.literal("on")])
      .optional()
      .transform((v) => v === "true" || v === "on"),
    assigneeId: optionalString(),
    externalAssignee: optionalString(),
    dueDate: optionalDate(),
    status: z.nativeEnum(OrderStatus).default(OrderStatus.A_FAZER),
    isRecurring: z
      .union([z.literal("true"), z.literal("false"), z.literal("on")])
      .optional()
      .transform((v) => v === "true" || v === "on"),
    recurringFrequency: z
      .union([z.enum(RECURRENCE_FREQUENCIES), emptyToUndef])
      .optional(),
    recurringDayOfWeek: z
      .union([z.coerce.number().int().min(0).max(6), emptyToUndef])
      .optional(),
    recurringDayOfMonth: z
      .union([z.coerce.number().int().min(1).max(31), emptyToUndef])
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.squadTask && !data.operationStageId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["operationStageId"],
        message: "Vincule a uma etapa ou marque como tarefa interna do squad",
      });
    }
    if (data.isRecurring && !data.recurringFrequency) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["recurringFrequency"],
        message: "Escolha a frequência da recorrência",
      });
    }
  });

export type OrderInput = z.infer<typeof orderInputSchema>;

export const orderStatusUpdateSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

export const FREQUENCY_LABELS: Record<RecurrenceFrequency, string> = {
  WEEKLY: "Semanal",
  BIWEEKLY: "Quinzenal",
  MONTHLY: "Mensal",
};

export const DAYS_OF_WEEK = [
  { value: 1, label: "Segunda" },
  { value: 2, label: "Terça" },
  { value: 3, label: "Quarta" },
  { value: 4, label: "Quinta" },
  { value: 5, label: "Sexta" },
  { value: 6, label: "Sábado" },
  { value: 0, label: "Domingo" },
] as const;
