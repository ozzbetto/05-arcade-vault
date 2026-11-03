import { Resend } from "resend";
import { escapeHtml, validateContact } from "@/lib/contact";

const DEFAULT_FROM = "Arcade Vault <onboarding@resend.dev>";

function fail(status: number, error: string) {
  return Response.json({ ok: false, error }, { status });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "El cuerpo de la solicitud no es JSON válido.");
  }

  // Honeypot: un bot lo rellena; se responde éxito sin enviar nada.
  const website = (body as { website?: unknown } | null)?.website;
  if (typeof website === "string" && website.trim() !== "") {
    return Response.json({ ok: true });
  }

  const result = validateContact(body);
  if (!result.ok) return fail(400, result.error);

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !to) {
    console.error("[contact] Falta RESEND_API_KEY o CONTACT_TO_EMAIL");
    return fail(500, "El servicio de contacto no está configurado.");
  }

  const { name, email, message } = result.data;
  const resend = new Resend(apiKey);

  try {
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || DEFAULT_FROM,
      to,
      replyTo: email,
      subject: `[Arcade Vault] Mensaje de ${name}`,
      html: `
        <h2>Nuevo mensaje desde Acerca de</h2>
        <p><strong>Nombre:</strong> ${escapeHtml(name)}</p>
        <p><strong>Correo:</strong> ${escapeHtml(email)}</p>
        <p><strong>Mensaje:</strong></p>
        <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
      `,
    });
    if (error) {
      console.error("[contact] Resend:", error);
      return fail(500, "No se pudo enviar el mensaje. Inténtalo de nuevo.");
    }
  } catch (err) {
    console.error("[contact] Resend:", err);
    return fail(500, "No se pudo enviar el mensaje. Inténtalo de nuevo.");
  }

  return Response.json({ ok: true });
}
