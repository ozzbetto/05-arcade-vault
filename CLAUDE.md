# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

Arcade Vault ("Es una plataforma para jugar online y competir por la mayor cantidad de puntos") is a Next.js 16 App Router project, currently at the initial `create-next-app` scaffold stage (`app/layout.tsx`, `app/page.tsx`, `app/globals.css`).

Stack: Next.js 16.3.5, React 19.2.8, TypeScript, Tailwind CSS v4 (via `@tailwindcss/postcss`), ESLint 9 flat config (`eslint-config-next`).

## Skills

Usa siempre /frontend-desing para diseñar interfaces de usuario

## Commands

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — lint with ESLint (flat config in `eslint.config.mjs`)

There is no test runner configured yet.

## Working method: Spec Driven Design

This project follows spec-driven development using the `/spec` and `/spec-impl` skills from the [Klerith/fernando-skills](https://github.com/Klerith/fernando-skills) collection, installed via:

```bash
npx skills@latest add Klerith/fernando-skills
```

Prefer writing/updating a spec before implementing a feature, then use `/spec-impl` to carry out the implementation, rather than jumping straight into ad-hoc code changes.

## Next.js version caveat

Per `AGENTS.md`, this Next.js version (16.3.5) has breaking changes relative to older/training-data knowledge of Next.js — APIs, conventions, and file structure may differ. Before writing routing, data-fetching, config, or other framework-specific code, check the relevant guide under `node_modules/next/dist/docs/` (sections: `01-app`, `02-pages`, `03-architecture`, `04-community`) rather than relying on prior Next.js knowledge.
