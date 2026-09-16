"use client";

import { useLanguage } from "@/lib/language";

export function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="border-t border-border mt-16 bg-surface">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 text-sm text-subtle-fg">
        <p className="max-w-3xl">{t.footer.disclaimer}</p>
        <p className="mt-3">{t.footer.copyright(new Date().getFullYear())}</p>
      </div>
    </footer>
  );
}
