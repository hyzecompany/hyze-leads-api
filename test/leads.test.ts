import { createExecutionContext, env, waitOnExecutionContext } from "cloudflare:test";
import { afterEach, describe, expect, it, vi } from "vitest";
import { app } from "../src/index";
import { isAllowedOrigin } from "../src/services";

const ORIGIN = "https://sites.hyzecompany.com.br";

const validLead = {
  brand: "sites",
  name: "Maria Silva",
  phone: "(66) 99999-1234",
  email: "maria@example.com",
  service: "Landing page",
  message: "Quero um site para minha loja",
  consent: true,
  turnstileToken: "token-de-teste",
  page: "https://sites.hyzecompany.com.br/",
};

function mockTurnstile(success: boolean) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json({ success }));
}

async function post(body: unknown, origin = ORIGIN) {
  const ctx = createExecutionContext();
  const res = await app.request(
    "/v1/leads",
    {
      method: "POST",
      headers: { "content-type": "application/json", origin },
      body: JSON.stringify(body),
    },
    env,
    ctx,
  );
  await waitOnExecutionContext(ctx);
  return res;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("POST /v1/leads", () => {
  it("salva um lead válido e normaliza o telefone", async () => {
    mockTurnstile(true);
    const res = await post(validLead);
    expect(res.status).toBe(201);
    expect(res.headers.get("access-control-allow-origin")).toBe(ORIGIN);

    const { id } = (await res.json()) as { id: string };
    const row = await env.DB.prepare("SELECT * FROM leads WHERE id = ?").bind(id).first();
    expect(row).toMatchObject({ brand: "sites", phone: "66999991234", status: "novo" });
    expect(row?.consent_at).toBeTruthy();
  });

  it("rejeita quando o Turnstile falha", async () => {
    mockTurnstile(false);
    const res = await post(validLead);
    expect(res.status).toBe(403);
  });

  it("rejeita sem consentimento LGPD", async () => {
    const fetchSpy = mockTurnstile(true);
    const res = await post({ ...validLead, consent: false });
    expect(res.status).toBe(400);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("rejeita dados inválidos", async () => {
    mockTurnstile(true);
    const res = await post({ ...validLead, phone: "123", email: "nao-e-email" });
    expect(res.status).toBe(400);
    const body = (await res.json()) as { issues: string[] };
    expect(body.issues).toEqual(expect.arrayContaining(["phone", "email"]));
  });

  it("não libera CORS para outros domínios", async () => {
    mockTurnstile(true);
    const res = await post(validLead, "https://site-malicioso.com");
    expect(res.headers.get("access-control-allow-origin")).toBeNull();
  });
});

describe("isAllowedOrigin", () => {
  it.each([
    ["https://hyzecompany.com.br", true],
    ["https://sites.hyzecompany.com.br", true],
    ["http://sites.hyzecompany.com.br", false],
    ["https://hyzecompany.com.br.evil.com", false],
    ["https://evilhyzecompany.com.br", false],
    ["http://localhost:4321", false],
  ])("%s → %s", (origin, expected) => {
    expect(isAllowedOrigin(origin, "hyzecompany.com.br", false)).toBe(expected);
  });

  it("aceita localhost só quando habilitado", () => {
    expect(isAllowedOrigin("http://localhost:4321", "hyzecompany.com.br", true)).toBe(true);
  });
});

describe("GET /health", () => {
  it("responde ok", async () => {
    const res = await app.request("/health", {}, env);
    expect(await res.json()).toEqual({ ok: true });
  });
});
