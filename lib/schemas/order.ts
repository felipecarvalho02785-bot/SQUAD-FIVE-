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
  })
  .superRefine((data, ctx) => {
    if (!data.squadTask && !data.operationStageId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["operationStageId"],
        message: "Vincule a uma etapa ou marque como tarefa interna do squad",
      });
    }
  });

export type OrderInput = z.infer<typeof orderInputSchema>;

export const orderStatusUpdateSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});
