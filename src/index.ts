import { zValidator } from "@hono/zod-validator";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { leads } from "./db/schema";
import type { Env } from "./env";
import { isAllowedOrigin, notifyTelegram, verifyTurnstile } from "./services";
import { leadInput } from "./validation";

export const app = new Hono<{ Bindings: Env }>();

app.use(secureHeaders());
app.use(
  "/v1/*",
  cors({
    origin: (origin, c) =>
      isAllowedOrigin(origin, c.env.ALLOWED_ROOT_DOMAIN, c.env.ALLOW_LOCALHOST === "true")
        ? origin
        : null,
    allowMethods: ["POST", "OPTIONS"],
    allowHeaders: ["content-type"],
    maxAge: 86400,
  }),
);

app.get("/health", (c) => c.json({ ok: true }));

app.post(
  "/v1/leads",
  bodyLimit({ maxSize: 16 * 1024, onError: (c) => c.json({ error: "payload_too_large" }, 413) }),
  zValidator("json", leadInput, (result, c) => {
    if (!result.success) {
      return c.json(
        { error: "invalid_input", issues: result.error.issues.map((i) => i.path.join(".")) },
        400,
      );
    }
  }),
  async (c) => {
    const input = c.req.valid("json");
    const ip = c.req.header("cf-connecting-ip");

    const human = await verifyTurnstile(input.turnstileToken, c.env.TURNSTILE_SECRET_KEY, ip);
    if (!human) return c.json({ error: "turnstile_failed" }, 403);

    const id = crypto.randomUUID();
    const country = (c.req.raw.cf?.country as string | undefined) ?? null;

    await drizzle(c.env.DB)
      .insert(leads)
      .values({
        id,
        brand: input.brand,
        name: input.name,
        phone: input.phone,
        email: input.email ?? null,
        service: input.service ?? null,
        message: input.message ?? null,
        page: input.page ?? null,
        consentAt: new Date().toISOString(),
        country,
      });

    // Notificação fora do caminho crítico: responde ao visitante sem esperar o Telegram.
    c.executionCtx.waitUntil(
      notifyTelegram(
        c.env,
        [
          `Novo lead — Hyze ${input.brand}`,
          `Nome: ${input.name}`,
          `WhatsApp: https://wa.me/${input.phone}`,
          input.email && `E-mail: ${input.email}`,
          input.service && `Serviço: ${input.service}`,
          input.message && `Mensagem: ${input.message}`,
        ]
          .filter(Boolean)
          .join("\n"),
      ).catch((err: unknown) => console.error("telegram_notify_failed", err)),
    );

    return c.json({ id }, 201);
  },
);

app.notFound((c) => c.json({ error: "not_found" }, 404));
app.onError((err, c) => {
  console.error("unhandled_error", err);
  return c.json({ error: "internal_error" }, 500);
});

export default app;
