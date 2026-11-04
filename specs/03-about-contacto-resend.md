# 03 — Acerca de y Contacto (envío con Resend)

**Estado:** Implemented
**Depende de:** SPEC 01, SPEC 02
**Fecha:** 2026-11-01

**Objetivo:** Implementar la pantalla "Acerca de" con su formulario de contacto en `/acerca-de`, idéntica al prototipo `references/templates/home-about/about.jsx`, y enviar el mensaje por correo con Resend desde un Route Handler.

## Alcance

**Incluye:**

- Nueva ruta `/acerca-de` con las secciones del template: hero (kicker "▸ ACERCA DE", título, misión, 3 highlights con íconos pixel), divisor con píxeles parpadeantes y sección "CONTÁCTANOS" (intro + 3 tips + formulario).
- Animación de entrada por scroll (`.reveal` + `IntersectionObserver`), reutilizando el mecanismo ya creado en spec 02.
- Formulario con nombre, correo y mensaje; estado de "shake" ante campos vacíos y pantalla de éxito estilo terminal (`VAULT-OS // TERMINAL`) con botón "ENVIAR OTRO MENSAJE", como en el template.
- Route Handler `POST /api/contact` que valida y envía el correo con el SDK `resend` (dependencia nueva).
- Estado de error no presente en el template, agregado de forma mínima: línea `[ERROR]` en estilo terminal dentro del formulario, conservando lo escrito y permitiendo reintentar.
- `Nav`: agregar "Acerca de" (`/acerca-de`) en desktop y panel móvil, con `isActive` solo en `/acerca-de`.
- Portar a `app/globals.css` los selectores faltantes de `references/templates/home-about/styles.css` (about, highlight, about-divider, contact, contact-form, `textarea`, `.btn.press`, `.terminal-success`, `shake`, `pxblink`).
- Documentar variables de entorno en `.env.example` (el `.env.local` real no se versiona).

**No incluye:**

- Confirmación por correo al visitante (un solo correo al equipo).
- Rate limit, captcha o almacenamiento de mensajes en base de datos.
- Dominio propio verificado en Resend (se usa `onboarding@resend.dev` por defecto).
- Plantillas de correo con React Email (HTML simple en string).
- Tests automatizados (no hay test runner).
- Rediseño: se respeta el template; no se usa `/frontend-design`.

## Modelo de datos

No se introduce persistencia. Se agregan:

- **Payload del request** `POST /api/contact` (JSON): `{ name: string; email: string; message: string; website?: string }`. `website` es el honeypot (oculto en el formulario, debe llegar vacío).
- **Validación en servidor** (en `lib/contact.ts`, función pura reutilizable): `name` 1–80 caracteres, `email` con formato válido y ≤ 254, `message` 1–2000 caracteres, todos tras `trim()`.
- **Respuestas:** `200 { ok: true }`; `400 { ok: false, error: string }` por validación; `500 { ok: false, error: string }` si falta `RESEND_API_KEY`/`CONTACT_TO_EMAIL` o Resend devuelve error. Si el honeypot viene lleno se responde `200 { ok: true }` sin enviar nada.
- **Variables de entorno:**
  - `RESEND_API_KEY` (obligatoria, solo servidor).
  - `CONTACT_TO_EMAIL` (obligatoria; destinatario del equipo).
  - `RESEND_FROM_EMAIL` (opcional; default `Arcade Vault <onboarding@resend.dev>`).
- **Correo enviado:** `from` = `RESEND_FROM_EMAIL`, `to` = `CONTACT_TO_EMAIL`, `replyTo` = correo del visitante, asunto `[Arcade Vault] Mensaje de {name}`, cuerpo HTML simple con nombre, correo y mensaje, con todos los valores del usuario escapados.

## Plan de implementación

1. **Dependencia y entorno:** `npm install resend`; crear `.env.example` con las 3 variables; verificar que `.env*.local` esté en `.gitignore`.
2. **CSS:** diff entre `references/templates/home-about/styles.css` y `app/globals.css`; portar los selectores faltantes del bloque `ABOUT PAGE` (y los de `textarea`, `.btn.press`, terminal, shake) respetando los tokens existentes. Nada los usa aún, el sistema sigue funcional.
3. **Validación:** crear `lib/contact.ts` con tipos, `validateContact` y `escapeHtml`.
4. **API:** crear `app/api/contact/route.ts` (consultar antes `node_modules/next/dist/docs/` para la convención de Route Handlers de Next 16) que parsea JSON, valida, aplica el honeypot y envía con Resend, devolviendo las respuestas del modelo de datos.
5. **Página:** crear `app/acerca-de/page.tsx` y componentes en `components/about/` (p. ej. `HighlightIcon`, `ContactForm` como client component con estados `idle | sending | sent | error`, shake y reset). Reutilizar el hook/componente de reveal de spec 02.
6. **Nav:** agregar "Acerca de" y ajustar `isActive` en `components/Nav.tsx` (desktop y panel móvil).
7. **Verificación visual y responsive:** `npm run dev`, comparar `/acerca-de` contra `references/templates/home-about/arcade-vault-standalone.html` en desktop y < 840px, incluyendo estado de éxito y error.
8. **Verificación de envío:** con `RESEND_API_KEY` real, enviar un mensaje y confirmar que llega a `CONTACT_TO_EMAIL`; probar sin la variable para ver el estado de error.
9. **Chequeo final:** `npm run lint` y `npm run build` sin errores.

## Criterios de aceptación

- [ ] `/acerca-de` muestra hero, highlights, divisor y contacto en el orden y con el aspecto del template, sin diferencias visuales apreciables en desktop y < 840px, sin scroll horizontal.
- [ ] Las secciones `.reveal` aparecen con animación al hacer scroll y no quedan invisibles al recargar a mitad de scroll.
- [ ] Enviar el formulario con algún campo vacío (tras `trim`) no hace request y dispara el efecto shake de ~400 ms.
- [ ] Enviar datos válidos llama a `POST /api/contact`, muestra el botón en estado de envío (deshabilitado) y luego la pantalla terminal con "GRACIAS, {NOMBRE EN MAYÚSCULAS}".
- [ ] El correo llega a `CONTACT_TO_EMAIL` con asunto `[Arcade Vault] Mensaje de {name}`, nombre, correo y mensaje, y responder desde el cliente de correo contesta al visitante (`replyTo`).
- [ ] Los valores del usuario aparecen escapados en el HTML del correo (un mensaje con `<script>` llega como texto).
- [ ] El servidor responde 400 ante nombre/correo/mensaje inválidos o fuera de longitud, aunque se salte la validación del cliente.
- [ ] Con el honeypot `website` lleno, la API responde `200` y no se envía correo.
- [ ] Sin `RESEND_API_KEY` o ante error de Resend, la API responde 500 y el formulario muestra una línea `[ERROR]` conservando lo escrito y permitiendo reintentar; la clave nunca se expone al cliente.
- [ ] "ENVIAR OTRO MENSAJE" limpia el formulario y vuelve al estado inicial.
- [ ] El `Nav` muestra "Acerca de" en desktop y panel móvil, activo solo en `/acerca-de`.
- [ ] `.env.example` documenta las 3 variables y no se versiona ningún secreto.
- [ ] `npm run lint` y `npm run build` terminan sin errores.

## Decisiones tomadas y descartadas

- **Route Handler `POST /api/contact`** en lugar de Server Action: contrato HTTP explícito (códigos 400/500) y estados de error fáciles de manejar en el cliente. Descartado: Server Action, por menos visibilidad de errores.
- **Ruta `/acerca-de`** (no `/about`): consistente con `/biblioteca` y `/salon`. Descartado: `/about`, aunque coincida con el nombre del template.
- **Remitente `onboarding@resend.dev` por defecto, configurable por env.** Permite probar sin dominio verificado; limitación conocida: solo entrega al correo dueño de la cuenta Resend hasta verificar un dominio.
- **Un solo correo al equipo**, con `replyTo` al visitante. Descartado: confirmación al visitante, porque sin dominio verificado no llegaría y amplía el alcance.
- **Mostrar error en el formulario** si el envío falla. Es el único agregado no presente en el template, mantenido mínimo y con el estilo terminal existente. Descartado: mostrar éxito siempre, porque oculta fallos.
- **Validación en servidor + honeypot**, sin rate limit ni captcha. Descartado: rate limit, porque en serverless requiere un store externo y excede el alcance.
- **Reutilizar el CSS del template** en `globals.css` (misma decisión que specs 01 y 02) y el reveal de spec 02.
- **Saltear `/frontend-design`**: el diseño ya existe en el template.

## Riesgos identificados

- **Desfase de CSS:** `home-about/styles.css` puede diferir de lo ya portado (p. ej. `.field`, `.btn`); el diff del paso 2 debe revisar también cambios, no solo adiciones.
- **Entrega limitada con `onboarding@resend.dev`:** si `CONTACT_TO_EMAIL` no es el correo de la cuenta Resend, el envío falla; verificar un dominio antes de producción.
- **Abuso del endpoint:** sin rate limit, el endpoint público puede recibir spam; el honeypot solo frena bots simples.
- **Inyección HTML en el correo:** mitigada con `escapeHtml`; debe cubrirse con el criterio de aceptación correspondiente.
- **API de Next 16:** la convención de Route Handlers puede diferir de versiones anteriores; leer la guía en `node_modules/next/dist/docs/` antes del paso 4.
