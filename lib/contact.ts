// ===== lib/contact.ts — validación y utilidades del formulario de contacto (spec 03) =====

export type ContactPayload = {
  name: string;
  email: string;
  message: string;
  website?: string; // honeypot: oculto en el formulario, debe llegar vacío
};

export type ContactValidation =
  | { ok: true; data: { name: string; email: string; message: string } }
  | { ok: false; error: string };

export const CONTACT_LIMITS = {
  name: 80,
  email: 254,
  message: 2000,
} as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function validateContact(input: unknown): ContactValidation {
  const body = (input ?? {}) as Record<string, unknown>;
  const name = text(body.name);
  const email = text(body.email);
  const message = text(body.message);

  if (!name || name.length > CONTACT_LIMITS.name) {
    return { ok: false, error: `El nombre es obligatorio (máx. ${CONTACT_LIMITS.name} caracteres).` };
  }
  if (!email || email.length > CONTACT_LIMITS.email || !EMAIL_RE.test(email)) {
    return { ok: false, error: "El correo no es válido." };
  }
  if (!message || message.length > CONTACT_LIMITS.message) {
    return { ok: false, error: `El mensaje es obligatorio (máx. ${CONTACT_LIMITS.message} caracteres).` };
  }
  return { ok: true, data: { name, email, message } };
}

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch]);
}
