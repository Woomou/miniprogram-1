# Repository Guidelines

## Project Structure & Module Organization
- Source lives under `miniprogram/`.
  - `pages/` contains views: `index/`, `wordList/`, `pronunciation/` with matching `.wxml/.scss/.ts/.json` files.
  - `components/` holds reusable UI (e.g., `navigation-bar`).
  - `utils/` contains logic helpers (e.g., `phonicsAPI.*`, `pronunciation.*`, `wordData.*`, `handwritingAPI.ts`).
- Root config: `project.config.json` (WeChat), `.prettierrc`, `eslint.config.js`, `tsconfig.json`.

## Build, Test, and Development Commands
- `npm run typecheck` — TypeScript type checking (no emit).
- `npm run lint` / `npm run lint:fix` — ESLint check/fix for `.ts/.js`.
- `npm run prettier` — Format files per `.prettierrc`.
- WeChat DevTools: Import project (miniprogram root is `miniprogram/`), then Compile/Preview. Optional scripts: `./build.sh`, `./test.sh` (utility checks for local workflows).

## Coding Style & Naming Conventions
- TypeScript preferred for logic; SCSS for styles; pair files by page/component name.
- Tabs: 2 spaces, `singleQuote: true`, `semi: true`, `printWidth: 80`.
- ESLint rules: no `var`, avoid `any` (warn), unused args should be prefixed with `_`.
- Pages/components: lowerCamelCase directories; export helpers as named functions in `utils/`.

## Testing Guidelines
- No formal test framework is configured. When adding non‑trivial logic, place it in `utils/` and keep functions pure to ease manual verification.
- If you introduce tests, propose the setup in a PR first (e.g., lightweight TypeScript test harness or DevTools plugin checks).

## Commit & Pull Request Guidelines
- Use clear, scoped commits; prefer Conventional Commits style (`feat:`, `fix:`, `chore:`) when possible.
- PRs should include: purpose/summary, linked issues, screenshots or screen recordings for UI changes, and notes on config changes (e.g., new API endpoints or permissions).
- Keep changes minimal and localized; avoid large refactors mixed with features.

## Security & Configuration Tips
- Do not commit secrets. Keep private settings in `project.private.config.json`.
- External APIs: configure endpoints in `utils/phonicsAPI.*` and `utils/handwritingAPI.ts`. Ensure domains are whitelisted in DevTools settings.
- Minimize network calls in hot paths; debounce/throttle as needed (e.g., handwriting recognition).

## Agent‑Specific Instructions
- Match existing patterns and file layout; update all paired files when adding a page/component.
- Prefer fixes at the root cause; avoid unrelated changes. Respect ESLint/Prettier outputs.
