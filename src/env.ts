export interface Env {
  DB: D1Database;
  ALLOWED_ROOT_DOMAIN: string;
  ALLOW_LOCALHOST: string;
  TURNSTILE_SECRET_KEY: string;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
}
