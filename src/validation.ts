import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : undefined));

export const leadInput = z.object({
  brand: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]{2,30}$/),
  name: z.string().trim().min(2).max(120),
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/\D/g, ""))
    .pipe(z.string().min(8).max(15)),
  email: z.email().max(160).optional(),
  service: optionalText(120),
  message: optionalText(2000),
  page: z.url().max(500).optional(),
  consent: z.literal(true, { error: "É necessário aceitar a política de privacidade." }),
  turnstileToken: z.string().min(1).max(2048),
});

export type LeadInput = z.infer<typeof leadInput>;
