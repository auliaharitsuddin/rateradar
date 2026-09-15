// GitHub Pages export build only. scripts/export-pages.mjs swaps this in as
// page.tsx for the duration of `next build --output export`, then restores the
// real page.tsx (which reads ?id= server-side per request) afterwards. Static
// export has no server to read the query string at request time, so this
// renders on the client instead — see components/pro-client.tsx.
import { Suspense } from "react";
import { ProClient } from "@/components/pro-client";

export default function ProPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8" />}>
      <ProClient />
    </Suspense>
  );
}
