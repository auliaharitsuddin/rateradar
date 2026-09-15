// Builds the static GitHub Pages demo (`out/`).
//
// `output: "export"` can't contain Route Handlers that read the request (our
// app/api/* and app/go/[source] both do), and Next requires `export const
// dynamic` to be a literal string per file (no env-based ternary), so the
// server-rendered pages (search, pro, hotel/[id]) can't just branch at
// runtime. Instead each of those has a *.static.tsx sibling written for the
// export build, and this script temporarily swaps it in for page.tsx.
//
// Everything is moved back in a `finally`, and a leftover swap from a crashed
// prior run is restored first, so this is safe to re-run and never leaves the
// real server routes altered on disk otherwise.
import { existsSync, mkdirSync, renameSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const app = path.join(root, "app");
// Outside app/ entirely — anything left inside app/ is scanned as a route
// segment regardless of name, so a same-directory rename isn't enough.
const backupDir = path.join(root, ".export-bak");

const dirSwaps = [
  [path.join(app, "api"), path.join(backupDir, "api")],
  [path.join(app, "go"), path.join(backupDir, "go")],
];

const fileSwaps = [
  ["hotel/[id]/page.tsx", "hotel/[id]/page.static.tsx"],
  ["search/page.tsx", "search/page.static.tsx"],
  ["pro/page.tsx", "pro/page.static.tsx"],
].map(([real, staticVariant]) => [path.join(app, real), path.join(app, staticVariant)]);

/** Undo a previous run that crashed mid-swap, before doing anything else. */
function recoverFromCrash() {
  for (const [original, backup] of dirSwaps) {
    if (existsSync(backup) && !existsSync(original)) renameSync(backup, original);
  }
  for (const [real, staticVariant] of fileSwaps) {
    const realBak = `${real}.server-bak`;
    if (!existsSync(realBak)) continue; // no crash left over for this pair
    // `real` currently holds the static variant's content — put it back, then
    // restore the real page from its backup.
    if (existsSync(real)) renameSync(real, staticVariant);
    renameSync(realBak, real);
  }
}

function swapIn() {
  mkdirSync(backupDir, { recursive: true });
  for (const [original, backup] of dirSwaps) {
    if (existsSync(original)) renameSync(original, backup);
  }
  for (const [real, staticVariant] of fileSwaps) {
    renameSync(real, `${real}.server-bak`);
    renameSync(staticVariant, real);
  }
}

function swapBack() {
  for (const [real, staticVariant] of fileSwaps) {
    renameSync(real, staticVariant);
    renameSync(`${real}.server-bak`, real);
  }
  for (const [original, backup] of dirSwaps) {
    if (existsSync(backup)) renameSync(backup, original);
  }
}

recoverFromCrash();
swapIn();

let result;
try {
  result = spawnSync("npx", ["next", "build"], {
    cwd: root,
    stdio: "inherit",
    shell: process.platform === "win32",
    env: { ...process.env, NEXT_PUBLIC_STATIC_EXPORT: "true" },
  });
} finally {
  swapBack();
}

process.exit(result?.status ?? 1);
