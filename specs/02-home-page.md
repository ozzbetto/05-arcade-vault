# 02 — Home page (landing)

**Estado:** Approved
**Depende de:** SPEC 01
**Fecha:** 2026-10-25

**Objetivo:** Implementar la landing page de Arcade Vault en `/` según el prototipo `references/templates/home-about/home.jsx`, mover la Biblioteca a `/biblioteca` y agregar "Inicio" al `Nav`.

## Alcance

**Incluye:**

- Nueva Home en `/` con las secciones del template: hero (silhouettes pixel flotantes, título, CTAs, "DESLIZA"), "¿POR QUÉ ARCADE VAULT?" (4 feature cards), "JUEGOS DISPONIBLES AHORA" (mini-cards de los primeros 6 juegos + "VER TODOS"), stats, "ACTIVIDAD EN VIVO" (últimas puntuaciones + top jugadores), "PRECIOS" (plan único + FAQ) y CTA final.
- Animación de entrada por scroll (`.reveal` + `IntersectionObserver`, portada de `useReveal`).
- Mover la Biblioteca actual de `/` a `/biblioteca` (sin cambios de UI).
- Actualizar enlaces y redirects que apuntaban a la Biblioteca en `/` (redirect de `/auth` tras login, "volver" desde detalle/reproductor, etc.) para que apunten a `/biblioteca`.
- `Nav`: agregar el link "Inicio" (`/`) en desktop y panel móvil; ajustar `isActive` (Biblioteca activa en `/biblioteca` y `/juegos/*`; Inicio activa solo en `/`). El logo sigue llevando a `/`.
- Portar a `app/globals.css` los selectores nuevos de `references/templates/home-about/styles.css` (home, hero, silos, feature-card, mini-card, stats, activity, pricing, final CTA, `.reveal`) que no existen en el CSS actual.
- Datos de "Actividad en vivo" y stats **derivados** de `GAMES`/`seededScores` (ver Modelo de datos), no hardcodeados.

**No incluye:**

- La pantalla "Acerca de" / Contacto (`about.jsx`), su ruta y su link en el `Nav` — queda para un spec aparte.
- Backend, datos reales de actividad, ranking real o formulario real; los CTAs solo navegan.
- Cambios al reproductor, detalle, Salón o auth más allá de actualizar enlaces a `/biblioteca`.
- Tests automatizados (no hay test runner).
- Rediseño: se respeta el template; no se usa `/frontend-design`.

## Modelo de datos

No se introduce persistencia. Se agregan helpers puros y determinísticos (sin `Math.random`, para evitar mismatch de hidratación) en `lib/data.ts`:

- **`homeStats(): { n: string; u: string; s: string }[]`** — 3 bloques. Juegos = `GAMES.length`; partidas = suma de `plays` de `GAMES` (parseando "12.4K") formateada; el tercero ("GLOBAL / RANKING / COMPITE CON EL MUNDO") queda fijo.
- **`recentScores(): { p: string; g: string; s: number; t: string; c: string }[]`** — 7 filas: jugador y puntaje tomados de `seededScores` con semilla por juego, `g` = `title` del juego, `c` = `color` del juego, `t` = "hace N min" creciente por índice.
- **`topToday(): { r: number; p: string; s: number }[]`** — top 5 a partir de `seededScores(seed fija, 5)` (orden descendente).
- Los números se formatean con locale fijo `"es-ES"` en ambos entornos.

Las features, el plan de precios y las 3 FAQ son contenido estático del componente (copia literal del template).

## Plan de implementación

1. **CSS:** diff entre `references/templates/home-about/styles.css` y `app/globals.css`; portar los selectores faltantes (home, silos, features, mini-card, stats, activity, pricing, final, `.reveal`) respetando los tokens `@theme inline` existentes. El sistema sigue funcional (nada los usa aún).
2. **Mover Biblioteca:** crear `app/biblioteca/page.tsx` con el contenido actual de `app/page.tsx`; actualizar enlaces/redirects internos a `/biblioteca` (auth, detalle, reproductor y cualquier otro). `/` queda temporalmente sin cambios de UI hasta el paso 4.
3. **Helpers de datos:** agregar `homeStats`, `recentScores` y `topToday` a `lib/data.ts`.
4. **Home:** reemplazar `app/page.tsx` por la Home. Componentes en `components/home/` (p. ej. `FloatingSilhouettes`, `MiniCard`, `FeatureIcon`, y un client component para el reveal por scroll). Navegación con `next/link` en lugar de `navigate()`: "EXPLORAR JUEGOS" y "VER TODOS" → `/biblioteca`; "CREAR CUENTA" y "EMPEZAR GRATIS" → `/auth`; mini-card → `/juegos/[id]`; "VER SALÓN" → `/salon`; "INSERTAR MONEDA" → `/biblioteca`.
5. **Nav:** agregar "Inicio" y ajustar `isActive` en `components/Nav.tsx` (desktop y panel móvil).
6. **Verificación visual y responsive:** `npm run dev`, recorrer `/` en desktop y < 840px comparando contra `references/templates/home-about/arcade-vault-standalone.html`; confirmar que `/biblioteca` y el resto de rutas siguen funcionando.
7. **Chequeo final:** `npm run lint` y `npm run build` sin errores.

## Criterios de aceptación

- [ ] `/` muestra la Home con las 6 secciones del template (hero, por qué, juegos, stats + actividad, precios, CTA final) en el orden del template.
- [ ] Las secciones con `.reveal` aparecen con animación al hacer scroll y no quedan invisibles si se recarga la página a mitad de scroll.
- [ ] La sección de juegos muestra los primeros 6 de `GAMES`; click en una mini-card navega a `/juegos/[id]`.
- [ ] "EXPLORAR JUEGOS", "VER TODOS LOS JUEGOS" e "INSERTAR MONEDA" navegan a `/biblioteca`; "CREAR CUENTA" y "EMPEZAR GRATIS" a `/auth`; "VER SALÓN" a `/salon`.
- [ ] `/biblioteca` muestra la Biblioteca de spec 01 con búsqueda y filtros funcionando.
- [ ] Tras login/registro/invitado en `/auth` se redirige a `/biblioteca` y ningún enlace interno apunta a la Biblioteca en `/`.
- [ ] El `Nav` muestra "Inicio" en desktop y panel móvil; solo está activo en `/`, y "Biblioteca" está activo en `/biblioteca` y `/juegos/*`.
- [ ] Stats y actividad en vivo se generan desde `lib/data.ts` (no hay arrays literales de jugadores/puntajes en el componente) y son idénticos entre renders (sin warnings de hidratación en consola).
- [ ] La Home se ve correcta en viewport < 840px y en desktop, sin scroll horizontal.
- [ ] `npm run lint` y `npm run build` terminan sin errores.

## Decisiones tomadas y descartadas

- **Solo Home, sin About.** Aunque la carpeta `home-about` incluye ambas, se acota el spec a lo pedido; About/Contacto tiene formulario y estado propios y merece su spec. Consecuencia: el `Nav` no incluye "Acerca de" todavía.
- **Home en `/`, Biblioteca en `/biblioteca`.** Replica el flujo del template (Inicio → Biblioteca) y da una landing con URL natural. Descartado: Home en `/home` y Biblioteca en `/`, por URL poco natural. Costo: tocar enlaces/redirects de spec 01.
- **Actividad y stats derivados de `GAMES`/`seededScores`** en vez de texto fijo del template. Mantiene coherencia con el resto de la app (nombres de juegos y colores reales) a costa de desviarse de los nombres de jugador literales del template. Descartado: hardcodear, por duplicar datos de juegos.
- **Actualizar `Nav` al del template** (agregar "Inicio") en vez de dejarlo igual, para no depender solo del logo.
- **Helpers determinísticos** (sin `Math.random`/`Date.now`) para evitar errores de hidratación; "hace N min" es mock.
- **Reutilizar el CSS del template** en `globals.css` en lugar de reescribir a utilities de Tailwind (misma decisión que spec 01).
- **Saltear `/frontend-design`**: el diseño ya existe en el template.

## Riesgos identificados

- **Desfase de CSS:** `home-about/styles.css` puede diferir del `styles.css` original en selectores ya portados; el diff del paso 1 debe revisar también cambios, no solo adiciones.
- **Enlaces olvidados a `/`** como Biblioteca: buscar con grep (`href="/"`, `router.push("/")`) en el paso 2.
- **Hidratación:** `toLocaleString` y `IntersectionObserver` solo deben ejecutarse con locale fijo / dentro de `useEffect`.
