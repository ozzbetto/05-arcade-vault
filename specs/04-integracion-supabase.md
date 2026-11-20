# 04 — Integración base de Supabase

**Estado:** Aprobado
**Depende de:** SPEC 01, SPEC 03
**Fecha:** 2026-11-20

**Objetivo:** Dejar Supabase integrado en la app Next.js (dependencias, variables de entorno y un único helper de cliente) sin crear tablas, sin usarlo en ninguna pantalla y sin cambiar el comportamiento actual.

## Alcance

**Incluye:**

- Instalar `@supabase/supabase-js` y `@supabase/ssr` como dependencias.
- Documentar en `.env.template` las variables `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- Crear `lib/supabase.ts` con una función `createSupabaseClient()` que lee esas variables y devuelve un cliente de `@supabase/supabase-js`.
- Error explícito y legible si falta alguna de las dos variables al crear el cliente.
- Actualizar `CLAUDE.md` (estructura, variables de entorno y estado del spec) al implementar.

**No incluye:**

- Crear tablas, migraciones, políticas RLS, funciones o cualquier cambio en la base de datos.
- Usar el cliente en alguna pantalla, Route Handler o en `AuthProvider`; ningún archivo existente de `app/` ni `components/` cambia.
- Auth real, sesiones con cookies ni `middleware`/`proxy` (`@supabase/ssr` queda instalado pero sin usar).
- Clientes separados de navegador y servidor.
- Variables de servidor con permisos elevados (`service_role`).
- Persistencia real de scores, leaderboards o usuarios (sigue siendo spec futuro).
- Tipos generados desde la base de datos.
- Tests automatizados (no hay test runner).

## Modelo de datos

No se introducen estructuras de datos ni persistencia. Solo se agregan:

- **Variables de entorno** (ambas públicas, se pueden exponer al navegador):
  - `NEXT_PUBLIC_SUPABASE_URL`: URL del proyecto (`https://<project_ref>.supabase.co`).
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: publishable key del proyecto.
- **Contrato de `lib/supabase.ts`:** `createSupabaseClient(): SupabaseClient`. Lanza `Error` con el nombre de la variable faltante si alguna no está definida. No guarda estado global ni hace requests al crearse.

## Plan de implementación

1. **Dependencias:** `npm install @supabase/supabase-js @supabase/ssr`. El sistema sigue funcional (nada las importa).
2. **Entorno:** agregar las dos variables a `.env.template` con comentario de dónde obtenerlas (Dashboard de Supabase → Project Settings → API Keys); verificar que `.env*.local` siga en `.gitignore`. El usuario completa los valores reales en `.env.local` (no se versionan ni se escriben desde el spec).
3. **Helper:** crear `lib/supabase.ts` con `createSupabaseClient()`; consultar antes `node_modules/next/dist/docs/` para la convención de variables `NEXT_PUBLIC_*` en Next 16 (lectura estática de `process.env.NEXT_PUBLIC_…`, sin acceso dinámico por clave).
4. **Documentación:** actualizar `CLAUDE.md` (estructura con `lib/supabase.ts`, variables de entorno, listado de specs y "siguiente paso").
5. **Chequeo final:** `npm run lint` y `npm run build` sin errores.

## Criterios de aceptación

- [ ] `package.json` lista `@supabase/supabase-js` y `@supabase/ssr` en `dependencies` y `package-lock.json` está actualizado.
- [ ] `.env.template` documenta `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` sin valores.
- [ ] `lib/supabase.ts` exporta `createSupabaseClient()` y no ejecuta nada al importarse.
- [ ] Con ambas variables definidas, `createSupabaseClient()` devuelve un cliente sin lanzar error.
- [ ] Sin alguna de las variables, `createSupabaseClient()` lanza un `Error` que nombra la variable faltante.
- [ ] `git diff` no muestra cambios en `app/` ni en `components/`, y no hay archivos de migraciones ni SQL nuevos.
- [ ] No se versiona ningún secreto (`.env.local` sigue ignorado por git).
- [ ] `npm run lint` y `npm run build` terminan sin errores, con y sin las variables definidas (el helper no se invoca en build).
- [ ] `CLAUDE.md` refleja el nuevo archivo, las variables y el estado del spec.

## Decisiones tomadas y descartadas

- **Un solo helper `lib/supabase.ts`** en lugar de clientes separados (`client.ts`/`server.ts`): la integración se pidió mínima; la separación se justifica recién cuando haya auth con cookies.
- **Instalar `@supabase/ssr` aunque no se use:** decisión del usuario para dejar la dependencia lista. Descartado: instalarla solo cuando exista auth real. Consecuencia conocida: dependencia sin consumidores hasta un spec futuro.
- **Publishable key (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)** en lugar de la anon key legacy: es el nombre vigente en Supabase y es segura para exponer al navegador con RLS.
- **Error explícito si faltan variables**, en vez de dejar que `createClient` falle con un mensaje genérico: facilita diagnosticar un `.env.local` incompleto.
- **Verificación solo con lint, build y el error por variables faltantes.** Descartado: script manual contra Supabase (`auth.getSession()`), porque se prefirió no hacer ningún request ni agregar artefactos.
- **Sin tocar `AuthProvider` ni pantallas:** el auth mock sigue sobre `localStorage` hasta un spec dedicado.
- **Sin `service_role`:** una clave con permisos elevados no pertenece a una integración base y es riesgosa si se expone por error.

## Riesgos identificados

- **Variables `NEXT_PUBLIC_*` se inyectan en build:** si se cambian en `.env.local`, hay que reiniciar `npm run dev` (y reconstruir en producción) para que se reflejen.
- **Acceso dinámico a `process.env`:** `process.env[name]` no se reemplaza en el bundle del navegador; el helper debe leer cada variable con su nombre literal.
- **`@supabase/ssr` sin uso:** puede quedar desactualizado o confundir sobre qué está activo; el spec de auth real debe decidir si lo adopta o lo retira.
- **Convención de Next 16:** puede diferir de versiones anteriores; leer la guía en `node_modules/next/dist/docs/` antes del paso 3.

## Qué **no** entra en este spec

- Tablas, migraciones, RLS o cualquier cambio de esquema.
- Uso del cliente en pantallas, API o `AuthProvider`.
- Auth real, cookies de sesión o `middleware`/`proxy`.
- Clientes separados de navegador/servidor y claves `service_role`.
- Tipos generados y tests.

Cada uno de ellos, si se aborda, va en su propio spec.
