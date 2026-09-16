"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useState, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChartIcon, CloseIcon, MenuIcon, MoonIcon, RadarIcon, SearchIcon, SunIcon } from "./icons";
import { useLanguage } from "@/lib/language";
import { LangToggle } from "./lang-toggle";

const THEME_EVENT = "rr-theme-change";

/**
 * The theme lives in the DOM (set by the inline script before first paint) and in
 * the OS preference — both are external systems, so it is read with
 * useSyncExternalStore rather than mirrored into state inside an effect.
 */
function subscribeTheme(onChange: () => void) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", onChange);
  window.addEventListener(THEME_EVENT, onChange);
  return () => {
    mq.removeEventListener("change", onChange);
    window.removeEventListener(THEME_EVENT, onChange);
  };
}

function readTheme(): "light" | "dark" {
  const attr = document.documentElement.getAttribute("data-theme");
  if (attr === "dark" || attr === "light") return attr;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function ThemeToggle() {
  const { t } = useLanguage();
  // On the server the theme is unknowable; light is the documented default and
  // the client re-reads immediately after hydration.
  const theme = useSyncExternalStore(subscribeTheme, readTheme, () => "light" as const);

  const toggle = useCallback(() => {
    const next = readTheme() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("rr-theme", next);
    } catch {
      /* storage blocked — the theme still applies for this session */
    }
    window.dispatchEvent(new Event(THEME_EVENT));
  }, []);

  return (
    <button
      type="button"
      onClick={toggle}
      className="grid h-11 w-11 cursor-pointer place-items-center rounded-lg text-muted-fg transition-colors duration-200 hover:bg-surface-2 hover:text-foreground"
      aria-label={theme === "dark" ? t.nav.themeToLight : t.nav.themeToDark}
    >
      {theme === "dark" ? <MoonIcon /> : <SunIcon />}
    </button>
  );
}

export function SiteNav() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const LINKS = [
    { href: "/", label: t.nav.search, Icon: SearchIcon },
    { href: "/pro", label: t.nav.pro, Icon: ChartIcon },
  ];

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/85 backdrop-blur-md">
      <nav
        aria-label={t.nav.ariaLabel}
        className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6"
      >
        <Link
          href="/"
          aria-label={t.nav.homeAria}
          className="flex h-11 shrink-0 items-center gap-2 font-semibold tracking-tight text-foreground"
        >
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-on-primary">
            <RadarIcon size={20} />
          </span>
          <span className="text-lg">RateRadar</span>
        </Link>

        <div className="ml-auto hidden items-center gap-1 sm:flex">
          {LINKS.map(({ href, label, Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`relative flex h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors duration-200 ${
                  active ? "text-primary" : "text-muted-fg hover:bg-surface-2 hover:text-foreground"
                }`}
              >
                <Icon size={18} />
                {label}
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
          <LangToggle />
          <ThemeToggle />
        </div>

        <div className="ml-auto flex items-center gap-1 sm:hidden">
          <LangToggle />
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
            className="grid h-11 w-11 cursor-pointer place-items-center rounded-lg text-muted-fg transition-colors duration-200 hover:bg-surface-2 hover:text-foreground"
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </nav>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id="mobile-nav"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-border sm:hidden"
          >
            <ul className="px-4 py-2">
              {LINKS.map(({ href, label, Icon }) => {
                const active = isActive(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      // Closed on navigation here rather than in an effect on pathname.
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`flex h-12 items-center gap-3 rounded-lg px-3 text-sm font-medium ${
                        active ? "bg-surface-2 text-primary" : "text-muted-fg"
                      }`}
                    >
                      <Icon size={18} />
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
