## Arcade Vault

Es una plataforma para jugar online y competir por la mayor cantidad de puntos.

## Usa Spec Driven Design

Basado en /spec y /spec-impl

Siguiendo las buenas practicas recomendadas aquí:
https://github.com/Klerith/fernando-skills

## Skills usadas

```bash
npx skills@latest add Klerith/fernando-skills
```

## Estado

MVP visual completo (spec 01): Biblioteca, Detalle de juego, Reproductor (simulado), Auth (mock) y Salón de la Fama. Los datos, la sesión y las puntuaciones son mock (`localStorage`); aún no hay backend ni juegos jugables.

| Ruta | Pantalla |
|---|---|
| `/` | Biblioteca |
| `/juegos/[id]` | Detalle de juego |
| `/juegos/[id]/jugar` | Reproductor |
| `/auth` | Iniciar sesión / crear cuenta / invitado |
| `/salon` | Salón de la Fama |

## Desarrollo

```bash
npm install
npm run dev     # http://localhost:3000
npm run lint
npm run build
```

Las specs están en `specs/`.
