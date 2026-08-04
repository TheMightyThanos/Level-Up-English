## Plan

### 1. Replace the TanStack Start template with the uploaded ZIP

The current project is Lovable's TanStack Start template; your ZIP is a Vite + React + React Router app. As you requested, I'll swap the whole codebase to your ZIP as-is.

Steps:
- Extract `/mnt/user-uploads/levelupenglish-main.zip` to a temp dir.
- Verify it contains no `.git/` directory (don't copy git metadata into the project).
- Wipe the current project files (template `src/`, `src/routes/`, `vite.config.ts`, `tsconfig.json`, `package.json`, `bun.lock`, `components.json`, `eslint.config.js`, `index.html` if present, `src/styles.css`, etc.) — keep only Lovable-managed files (`.lovable/`, `AGENTS.md`, `.prettier*`, `.gitignore`).
- Copy every file from `levelupenglish-main/` into the project root.
- Run `bun install` so the Vite/React-Router/Radix/etc. dependencies from your `package.json` are installed.

Note (for transparency, no action needed from you): Lovable's modern stack is TanStack Start. Reverting to a Vite + React Router app is fully supported to run, but some Lovable-specific features tuned for TanStack (SSR, server functions) won't apply. Your app is fully client-side anyway, so this is fine.

### 2. Apply the 3 critical changes to `src/services/googleAppsScript.ts`

After the import, overwrite that file with the corrected version:

- **Webhook URL** → `https://script.google.com/macros/s/AKfycbw1zaudRS-6gRA-1ghjYTN-sqqICvFEVmAnRRCuAvfXLzXit6XnRNOj1Bpty4Ovnp9G/exec`
- **`ReadingPayload`** → add `nim: string;`
- **`buildReadingPayload`** →
  - include `nim: userData.nim` in the returned object
  - derive `letter` from `q.options.indexOf(selectedText)` (original, unshuffled order) instead of `q.shuffledOptions.findIndex(...)`
  - default `letter` to `'-'` (matches the exact function body you supplied)
- Leave `submitReadingResults` and the deprecated `submitResultsToGoogle` alias untouched (they already call `buildReadingPayload` and the new URL constant).

### 3. Verify

- Confirm `UserData` (in `src/types/toefl.ts`) already has a `nim: string` field. If not, I'll add it so the new payload typechecks. I won't touch the registration UI unless `nim` is missing from the type and needs a minimal field addition to compile — I'll flag it if so.
- Let Lovable's automatic build run; fix any import/typecheck errors that surface strictly from these changes.
- Do not touch UI, routing, scoring, or any unrelated logic.

### Out of scope
- No UI changes.
- No changes to listening/structure section logic.
- No changes to the Google Apps Script backend itself (you manage that).
