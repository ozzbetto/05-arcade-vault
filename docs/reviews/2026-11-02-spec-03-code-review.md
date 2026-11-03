# Code review — spec 03 (Acerca de + Contacto con Resend)

- **Fecha:** 2026-11-02
- **Rama:** `spec-03-about-contacto-resend` (cambios sin commitear sobre `1cc1638`)
- **Alcance:** `app/acerca-de/`, `app/api/contact/route.ts`, `components/about/`, `lib/contact.ts`, `components/Nav.tsx`, `app/globals.css`, `.env.template`, `package.json` / `package-lock.json`
- **Verificación automática:** `npm run lint` ✅ · `npx tsc --noEmit` ✅ (sin errores). No hay test runner configurado.

## Estado del remoto (`ozzbetto/05-arcade-vault`, público, default `main`)

- PRs: 9 en total; #2–#6, #9, #13, #14 mergeados, #1 cerrado. Ninguno abierto.
- Issues #7, #8, #10, #11, #12: todos cerrados. Ninguno abierto.
- La rama de esta feature **no existe en el remoto** y el PR de spec 03 aún no se abrió.
- `main` local está 1 commit por delante de `origin/main` (`1cc1638`, docs de spec 03 + `.env.template`): ese commit se hizo directo sobre `main`, no vía PR.
- Ramas remotas huérfanas: `claude/issue-8`, `-10` (x2), `-11`, `-12` — sus issues ya están cerrados.
- Ramas locales obsoletas: `01-config` (PR #1 cerrado, 1 commit adelante), `backup/spec-02-pre-rewrite`.

## Hallazgos

### Medio

1. **`/api/contact` sin rate limiting** — `app/api/contact/route.ts:10`
   El único freno anti-bot es el honeypot. Un script que omita el campo `website` puede disparar miles de POST válidos y agotar la cuota de Resend o inundar el buzón de `CONTACT_TO_EMAIL`. Recomendación: límite por IP (p. ej. middleware/proxy con contador, o servicio externo) y/o token de captcha (Turnstile). Mínimo viable: documentarlo como riesgo conocido en la spec.

2. **El cliente descarta el mensaje de error del servidor y no replica los límites** — `components/about/ContactForm.tsx:39-44, 61-69`
   La validación del cliente solo comprueba "no vacío". Un mensaje de más de 2000 caracteres (o nombre > 80) recibe un 400 con texto específico, pero el cliente lo ignora y muestra siempre "No se pudo enviar… Inténtalo de nuevo", lo que lleva a reintentar sin éxito. Recomendación: añadir `maxLength={CONTACT_LIMITS.*}` a los inputs (reutilizando `lib/contact.ts`) y, ante 400, mostrar `error` del JSON.

### Bajo

3. **Saltos de línea en el asunto** — `route.ts:42`
   `name` solo se hace `trim()`; puede contener `\r\n` y llegar al `subject`. Resend lo envía como campo JSON, así que el riesgo real es bajo, pero conviene normalizar (`name.replace(/\s+/g, " ")`) en `validateContact`.

4. **Honeypot con nombre `website`** — `ContactForm.tsx:74`
   Es un nombre que los gestores de contraseñas/autocompletado suelen rellenar aun con `autoComplete="off"`; en ese caso un usuario real recibiría "éxito" falso y su mensaje se descartaría en silencio (`route.ts:20-22`). Recomendación: usar un nombre menos obvio (p. ej. `hp_field`).

5. **Éxito simulado en la terminal** — `ContactForm.tsx:99-101`
   Las líneas `[OK] Conectando…` son decorativas y estáticas; está bien por estética, pero conviene que quede claro que no reflejan estado real del envío.

6. **`setTimeout` del shake sin limpiar** — `ContactForm.tsx:23`. Inocuo (solo `setState` booleano), anotado por completitud.

### Observaciones sin acción

- **Escape HTML correcto**: `name`, `email` y `message` pasan por `escapeHtml` antes de interpolarse en el HTML del correo (`route.ts:45-48`). `replyTo` usa el correo ya validado.
- **Secretos**: `RESEND_API_KEY` solo se lee en servidor; `.gitignore` excluye `.env*` salvo `.env.template` (sin valores).
- **Lockfile**: el diff de `package-lock.json` es coherente con añadir `resend` (+ `standardwebhooks`, `postal-mime`, `fast-sha256`, `@stablelib/base64`) y trae además entradas `@tailwindcss/oxide-wasm32-wasi/*` que no tienen relación con la feature: verificar que se hayan generado solo al reinstalar y no sean ruido no deseado.
- **Next 16**: no se contrastó el Route Handler contra `node_modules/next/dist/docs/` (requerido por `AGENTS.md`); `POST` con `Response.json` es lo esperado, pero conviene confirmarlo.
- **Sin tests**: `validateContact` y `escapeHtml` son funciones puras y fáciles de cubrir cuando se configure un runner.

## Acciones sugeridas antes de abrir el PR

1. Mover el commit de docs fuera de `main` (o aceptar que `main` local se sincronice vía el PR de la rama).
2. Resolver hallazgo 2 (maxLength + mostrar error del servidor); decidir postura sobre el 1.
3. Commitear los cambios, empujar la rama y abrir PR contra `main`.
4. Limpiar ramas `claude/issue-*` remotas y ramas locales obsoletas.
