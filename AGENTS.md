# PromptBarn Agent Notes

## Project

PromptBarn is an offline-first Electron desktop app for storing and reusing AI prompts locally.

Core stack:

- Electron
- electron-vite
- React
- TypeScript strict mode
- Tailwind CSS
- Zustand
- SQLite with `better-sqlite3`
- Zod
- SQLite FTS5

Do not add cloud sync, accounts, telemetry, analytics, external AI APIs, remote network dependencies, or auto-updates.

## Architecture Rules

- Renderer code must not access Node.js, the filesystem, Electron internals, or SQLite directly.
- All database logic belongs in `src/main/database`.
- All IPC handlers belong in `src/main/ipc`.
- Validate every IPC input in the main process before touching SQLite.
- The preload script exposes only the typed `window.promptBarn` API.
- Do not expose raw `ipcRenderer`, `ipcMain`, Node APIs, or Electron internals to the renderer.
- Keep SQL in repository/database modules and use prepared statements.
- Store local app data in Electron `userData`.

## Security Defaults

Keep the Electron window hardened:

- `contextIsolation: true`
- `nodeIntegration: false`
- `sandbox: true`
- no remote content
- strict Content Security Policy
- block unexpected navigation
- deny new windows

## Important Paths

- Main process: `src/main`
- Database: `src/main/database`
- IPC: `src/main/ipc`
- Preload: `src/preload`
- Renderer: `src/renderer`
- Shared schemas/types: `src/shared`
- App icon assets: `assets/PromptBarn.png`, `assets/PromptBarn.icns`
- Packaged output: `dist`
- Vite build output: `out`

## Commands

Install dependencies:

```bash
npm install
```

Run in development:

```bash
npm run dev
```

Typecheck:

```bash
npm run typecheck
```

Build:

```bash
npm run build
```

Package:

```bash
npm run package
```

`better-sqlite3` is a native dependency. `postinstall` runs `electron-builder install-app-deps` so it is rebuilt for Electron.

## Dependency Note

Use the latest compatible dependency set. At the time this project was created:

- `electron-vite@5.0.0` supports Vite `^5 || ^6 || ^7`.
- Vite 8 requires `@vitejs/plugin-react@6`.
- Therefore the latest compatible pairing is `vite@7.3.2` with `@vitejs/plugin-react@5.2.0`.

Do not force incompatible peer dependencies just to satisfy `npm outdated`.

## Database Notes

SQLite schema includes:

- `categories`
- `prompts`
- `tags`
- `prompt_tags`
- `prompt_search` FTS5 table

FTS is synced through triggers on prompt insert/update/delete. Keep migrations in `src/main/database/migrations.ts`; `schema.sql` is kept as readable reference.

## UI Notes

The visual direction follows the app icon:

- deep navy background
- cyan primary actions
- cool silver surfaces
- dark mode defaults on

Keep the app as a usable desktop work surface, not a landing page.

## Verification Before Finishing

Before finishing, run the fastest checks that validate the change.

At minimum, run:

```bash
npm run typecheck
npm run build
```

Run packaging only when the change affects Electron packaging, native dependencies, app startup, preload/main process behavior, database/native modules, or build configuration:

```bash
npm run package
```

Examples of changes that require `npm run package`:

- Changes to Electron main/preload files
- Changes to `electron-builder`, `electron-vite`, Vite, or TypeScript config
- Changes to dependencies, especially native dependencies such as `better-sqlite3`
- Changes to SQLite/database initialization or app data paths
- Changes that may affect production startup but not dev mode

If `npm run package` is skipped, mention that it was skipped because the change did 

## Maintaining This File

If you make changes that affect how future agents should work in this repository, update `AGENTS.md` in the same change.

Update this file when changing:

- Project setup or install steps
- Development, build, typecheck, test, or package commands
- Electron, Vite, TypeScript, Tailwind, or packaging configuration
- Native dependency behavior, especially `better-sqlite3`
- Database setup, migrations, or local app data paths
- Required verification steps before finishing
- Important architectural conventions or security rules

Do not update this file for ordinary feature work, UI-only changes, refactors, or bug fixes unless they change the workflow or expectations for future agents.