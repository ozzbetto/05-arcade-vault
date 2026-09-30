# 01 — MVP: pantallas de Arcade Vault

**Estado:** Approved
**Depende de:** —
**Fecha:** 2026-09-28

**Objetivo:** Portar las 5 pantallas visuales del prototipo estático en `references/templates/` (Biblioteca, Detalle de juego, Reproductor, Auth y Salón de la Fama) a rutas reales de Next.js 16 App Router, sin implementar ningún juego real.

## Alcance

**Incluye:**
- 5 pantallas como rutas de App Router:
  - `/` — Biblioteca (grid de juegos, búsqueda, filtro por categoría)
  - `/juegos/[id]` — Detalle de juego (info, stats, leaderboard del juego)
  - `/juegos/[id]/jugar` — Reproductor (HUD simulado, "juego" en CSS/CRT, modal de fin de partida)
  - `/auth` — Inicio de sesión / registro / invitado (mock, sin backend)
  - `/salon` — Salón de la Fama (podio + tabla de puntuaciones por juego)
- `Nav` global (desktop + panel móvil) y footer, integrados en `app/layout.tsx`.
- Datos mock de juegos, jugadores y puntuaciones (`lib/data.ts`), portados de `data.jsx`.
- Estado de sesión mock (usuario) y guardado de puntuaciones, respaldados por `localStorage`, compartidos vía un `AuthProvider` (React Context) para que `Nav`, Reproductor y Salón de la Fama lean el mismo estado.
- Estilos: reutilización del CSS ya portado en `app/globals.css` (que ya replica `styles.css` del template usando tokens `@theme inline` de Tailwind v4), completando cualquier selector que falte al portar las pantallas.
- Fuentes: `next/font/google` (Press Start 2P + JetBrains Mono), ya configuradas en `app/layout.tsx`.
- Responsive/mobile: el menú hamburguesa y el panel lateral del `Nav`, y los breakpoints ya definidos en `globals.css`.

**No incluye:**
- Ningún juego jugable de verdad. El "reproductor" mantiene la simulación puramente visual del template (puntaje que sube solo con `setInterval`, sin lógica de juego real).
- Backend, API routes, base de datos o autenticación real. Login/registro aceptan cualquier valor y solo generan un usuario mock.
- Persistencia más allá de `localStorage` del navegador (sin sincronización entre dispositivos).
- Cualquier feature no presente en los templates (perfiles, multiplayer, compras, etc.) — queda fuera de este MVP y de este spec.
- Tests automatizados (no hay test runner configurado en el proyecto).

## Modelo de datos

No se introduce persistencia real ni backend. Estructuras nuevas (todas en memoria/localStorage, tipadas en TypeScript):

- **`Game`** (`lib/data.ts`): `{ id, title, short, long, cat, cover, color, best, plays }`. Idéntico a los objetos de `GAMES` en `data.jsx`, portados tal cual (8 juegos).
- **`CATS`**: `string[]` de categorías para los chips de filtro (`TODOS, ARCADE, PUZZLE, SHOOTER, VERSUS`).
- **`PLAYERS`**: `string[]` de nombres mock usados por `seededScores`.
- **`seededScores(seed, count)`**: función determinística (PRNG con semilla) que genera filas `{ rank, name, score, date }` para leaderboards — portada tal cual desde `data.jsx`.
- **`AuthUser`**: `{ name: string } | null`, guardado en `localStorage` bajo la key `av_user`.
- **`ScoreEntry`**: `{ game: string; score: number; name: string; at: number }`, agregado a un array en `localStorage` bajo la key `av_scores` cada vez que se guarda una puntuación desde el Reproductor.

## Plan de implementación

1. **Datos mock:** crear `lib/data.ts` portando `GAMES`, `CATS`, `PLAYERS` y `seededScores` desde `references/templates/data.jsx`, tipados en TypeScript.
2. **Estado de auth compartido:** crear `lib/auth-context.tsx` con un `AuthProvider` (client component) que expone `user`, `login(user)`, `signOut()`, `saveScore(entry)`, respaldado por `localStorage` (`av_user`, `av_scores`), replicando la lógica de `handleLogin`/`handleSignOut`/`handleSaveScore` de `app.jsx`. Envolver `{children}` en `app/layout.tsx` con este provider.
3. **Nav global:** crear `components/Nav.tsx` portando `nav.jsx`, usando `usePathname()` de `next/navigation` para resaltar el link activo (en vez del objeto `route` del template) y `useAuth()` para mostrar "Iniciar Sesión" vs nombre de usuario. Integrar `<Nav />` y el `<footer>` (texto y estilos de `app.jsx`) en `app/layout.tsx`, alrededor de `{children}`.
4. **Biblioteca (`/`):** reemplazar `app/page.tsx` (boilerplate actual) por la pantalla `Library`/`GameCard` portada de `biblioteca.jsx`, navegando con `next/link`/`useRouter` a `/juegos/[id]` en vez de `navigate({name:"detalle", id})`.
5. **Detalle (`/juegos/[id]/page.tsx`):** portar `detalle.jsx`, usando el `id` de `params`, `lib/data.ts` y `seededScores`; el botón "JUGAR AHORA" navega a `/juegos/[id]/jugar`.
6. **Reproductor (`/juegos/[id]/jugar/page.tsx`):** portar `reproductor.jsx` como client component, manteniendo la simulación de puntaje/vidas/nivel/pausa/modal de fin de partida, y usando `saveScore` del `AuthProvider` para persistir el resultado.
7. **Auth (`/auth/page.tsx`):** portar `auth.jsx`, usando `login()` del `AuthProvider` y redirigiendo a `/` tras iniciar sesión, crear cuenta o entrar como invitado.
8. **Salón de la Fama (`/salon/page.tsx`):** portar `salon.jsx`, usando `lib/data.ts`, `seededScores` y `user` del `AuthProvider` para la fila "tu mejor marca".
9. **Verificación visual y responsive:** correr `npm run dev`, recorrer las 5 pantallas (desktop y mobile/hamburguesa) comparando contra `references/templates/Arcade Vault.html` abierto en el navegador, y ajustar cualquier selector de `globals.css` que falte.
10. **Chequeo final:** `npm run lint` y `npm run build` sin errores.

## Criterios de aceptación

- [ ] `npm run dev` levanta la app y `/` muestra la Biblioteca con hero, buscador, chips de categoría y grid de tarjetas de los 8 juegos mock.
- [ ] Buscar por nombre y filtrar por categoría en `/` actualiza el grid sin recargar la página; el estado vacío ("NO HAY RESULTADOS") se muestra cuando no hay coincidencias.
- [ ] Click en una tarjeta o en "JUGAR" navega a `/juegos/[id]` con la info, tags, stats y leaderboard del juego correspondiente.
- [ ] "JUGAR AHORA" en el detalle navega a `/juegos/[id]/jugar`, que muestra el HUD (jugador, puntuación, vidas, nivel), la pantalla CRT animada, y permite pausar/reanudar y finalizar la partida.
- [ ] Al finalizar la partida se puede guardar la puntuación (con iniciales editables) y aparece la confirmación; el modal ofrece "JUGAR DE NUEVO" y "VOLVER AL VAULT".
- [ ] `/auth` permite alternar entre "Iniciar Sesión" / "Crear Cuenta", enviar el formulario (mock, sin validación de backend) o entrar como invitado, y redirige a `/` actualizando el estado global de usuario.
- [ ] El `Nav` muestra "Iniciar Sesión" sin usuario y el nombre de usuario tras loguearse (mock), de forma consistente en todas las rutas; cerrar sesión vuelve a mostrar "Iniciar Sesión".
- [ ] `/salon` muestra podio (top 3) y tabla de puntuaciones por juego seleccionado mediante chips, y agrega una fila "tu mejor marca" cuando hay usuario logueado.
- [ ] El menú hamburguesa y panel lateral funcionan en viewport móvil (< 840px) en todas las rutas.
- [ ] `npm run lint` y `npm run build` terminan sin errores.
- [ ] No hay ningún juego jugable real: el Reproductor es una simulación puramente visual/CSS, sin lógica de colisiones, inputs de juego ni motor de juego.

## Decisiones tomadas y descartadas

- **Rutas reales de App Router** (`/`, `/juegos/[id]`, `/juegos/[id]/jugar`, `/auth`, `/salon`) en vez de mantener el routing por hash de una sola página del template — aprovecha el App Router y da URLs compartibles. Descartado: mantener el hash-routing/SPA de estado único, por ser menos idiomático en este stack.
- **Reutilizar `styles.css` como CSS global** (ya portado a `app/globals.css` con tokens `@theme inline` de Tailwind v4 en un commit previo) en vez de reescribir todo el diseño a utilities de Tailwind — prioriza fidelidad visual al diseño ya validado y evita riesgo de regresiones. Tailwind queda disponible para ajustes puntuales.
- **Saltear la skill `/frontend-design`** para este spec — el diseño ya existe y está validado en `references/templates/`; la skill queda reservada para pantallas futuras sin template.
- **Mantener la simulación de puntaje del Reproductor** (setInterval incrementando el score, pausa, vidas, nivel, modal de fin de partida) — es solo estado de React/UI, no un juego real, y es fiel al template y al pedido de "solo implementar la parte visual".
- **Auth y puntuaciones mock en `localStorage`**, sin backend ni API routes — coherente con el alcance "solo visual" del MVP.
- **Estado de auth compartido vía React Context (`AuthProvider`)** en `app/layout.tsx`, en vez de que cada componente lea `localStorage` por su cuenta — evita desincronización entre `Nav`, Reproductor y Salón de la Fama que ahora viven en rutas/componentes separados.
- **Datos mock en un módulo TypeScript (`lib/data.ts`)** en vez de JSON estático — permite portar `seededScores` (lógica, no solo datos) tipada.
- **Rutas anidadas `/juegos/[id]` y `/juegos/[id]/jugar`** en vez de rutas hermanas `/juego/[id]` y `/jugar/[id]` — refleja la jerarquía natural juego → jugar.
- **Layout actual (`app/layout.tsx`) se conserva y se extiende**, no se reemplaza desde cero — el commit más reciente ya portó fuentes (`next/font/google`), fondo (`av-bg`/`av-noise`) y metadata equivalentes al template; solo falta integrar `AuthProvider`, `Nav` y el `footer`.
