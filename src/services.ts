import type { Env } from "./env";

const SITEVERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/** Valida o token do Cloudflare Turnstile no servidor (obrigatório — o widget sozinho não protege). */
export async function verifyTurnstile(
  token: string,
  secret: string,
  ip?: string,
): Promise<boolean> {
  const body = new FormData();
  body.append("secret", secret);
  body.append("response", token);
  if (ip) body.append("remoteip", ip);

  const res = await fetch(SITEVERIFY, { method: "POST", body });
  if (!res.ok) return false;
  const data = (await res.json()) as { success?: boolean };
  return data.success === true;
}

/** Aviso opcional de novo lead no Telegram (grátis, chega no celular na hora). */
export async function notifyTelegram(
  env: Pick<Env, "TELEGRAM_BOT_TOKEN" | "TELEGRAM_CHAT_ID">,
  text: string,
): Promise<void> {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return;
  await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text, disable_web_page_preview: true }),
  });
}

/** Aceita o domínio raiz, qualquer subdomínio dele e (opcionalmente) localhost. */
export function isAllowedOrigin(
  origin: string,
  rootDomain: string,
  allowLocalhost: boolean,
): boolean {
  let url: URL;
  try {
    url = new URL(origin);
  } catch {
    return false;
  }
  if (allowLocalhost && url.protocol === "http:" && url.hostname === "localhost") return true;
  if (url.protocol !== "https:") return false;
  return url.hostname === rootDomain || url.hostname.endsWith(`.${rootDomain}`);
}
