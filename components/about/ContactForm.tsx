"use client";

// ===== components/about/ContactForm.tsx — formulario de contacto (portado de About en about.jsx) =====
// Estados: idle | sending | sent | error. El envío va a POST /api/contact.

import { useState, type FormEvent } from "react";

type Status = "idle" | "sending" | "sent" | "error";

const EMPTY = { name: "", email: "", msg: "", website: "" };

export function ContactForm() {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState<Status>("idle");
  const [sentName, setSentName] = useState("");
  const [shake, setShake] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;
    if (!form.name.trim() || !form.email.trim() || !form.msg.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          message: form.msg,
          website: form.website,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setSentName(form.name.trim());
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  const reset = () => {
    setStatus("idle");
    setSentName("");
    setForm(EMPTY);
  };

  const sending = status === "sending";

  return (
    <form className={"contact-form" + (shake ? " shake" : "")} onSubmit={onSubmit}>
      {status !== "sent" ? (
        <>
          <div className="field">
            <label htmlFor="cf-name">NOMBRE</label>
            <input id="cf-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="px_kai" />
          </div>
          <div className="field">
            <label htmlFor="cf-email">CORREO ELECTRÓNICO</label>
            <input id="cf-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jugador@vault.gg" />
          </div>
          <div className="field">
            <label htmlFor="cf-msg">MENSAJE</label>
            <textarea id="cf-msg" rows={5} value={form.msg} onChange={(e) => setForm({ ...form, msg: e.target.value })} placeholder="Cuéntanos qué tienes en mente…"></textarea>
          </div>
          {/* honeypot: oculto para personas, los bots lo rellenan */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
            style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
          />
          {status === "error" && (
            <div role="alert" style={{ fontFamily: "var(--mono)", fontSize: 12, lineHeight: 1.6, color: "var(--magenta)", marginBottom: 12 }}>
              [ERROR] No se pudo enviar el mensaje. Inténtalo de nuevo.
            </div>
          )}
          <button className="btn xl press" type="submit" disabled={sending} style={{ width: "100%", opacity: sending ? 0.6 : 1 }}>
            {sending ? "TRANSMITIENDO…" : "▶  ENVIAR MENSAJE"}
          </button>
        </>
      ) : (
        <div className="terminal-success">
          <div className="term-bar">
            <span className="dot r"></span><span className="dot y"></span><span className="dot g"></span>
            <span className="term-title">VAULT-OS // TERMINAL</span>
          </div>
          <div className="term-body">
            <div className="line"><span className="prompt">vault@arcade:~$</span> ./send_message --to=team</div>
            <div className="line dim">[OK] Conectando con servidor…</div>
            <div className="line dim">[OK] Validando contenido…</div>
            <div className="line dim">[OK] Transmitiendo paquete…</div>
            <div className="line success">&gt; MENSAJE RECIBIDO. TE RESPONDEREMOS PRONTO. GRACIAS, {sentName.toUpperCase()}.<span className="caret">_</span></div>
            <div style={{ marginTop: 18 }}>
              <button className="btn ghost" type="button" onClick={reset}>ENVIAR OTRO MENSAJE</button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
