import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { nav } from "@/content/site";
import { cn } from "@/lib/utils";
import { ActionLink, Wordmark } from "./primitives";

export function Header() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Highlight the section currently in view.
  useEffect(() => {
    const ids = nav.map((n) => n.href.slice(1));
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
      if (window.scrollY < 200) setActive(null);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Mobile menu: Escape closes, focus moves into the panel and back.
  useEffect(() => {
    if (!open) return;
    const first = panelRef.current?.querySelector<HTMLElement>("a");
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onResize = () => {
      if (window.matchMedia("(min-width: 1024px)").matches) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b bg-ivory transition-[border-color] duration-300",
        scrolled ? "border-ink/15" : "border-ink/10",
      )}
    >
      <a
        href="#main"
        className="text-label-tag sr-only z-[60] bg-ink px-4 py-2 text-ivory focus:not-sr-only focus:absolute focus:left-4 focus:top-3"
      >
        Skip to content
      </a>
      <div className="container-page flex h-[var(--header-h)] items-center justify-between gap-6">
        <a href="#top" aria-label="The Ad Company — back to top" className="shrink-0">
          <Wordmark />
        </a>

        <div className="flex items-center gap-6">
          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-6">
              {nav.map((item) => {
                const isActive = active === item.href.slice(1);
                return (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className={cn(
                        "relative py-2 text-sm font-semibold uppercase tracking-wider transition-colors",
                        "after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:bg-orange after:transition-transform after:duration-300",
                        isActive
                          ? "text-signal after:scale-x-100"
                          : "text-muted-foreground after:scale-x-0 hover:text-ink hover:after:scale-x-100",
                      )}
                    >
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <ActionLink href="#contact" variant="signal" size="sm" className="hidden sm:inline-flex">
            Let’s talk
          </ActionLink>

          <button
            ref={buttonRef}
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center border-2 border-ink bg-paper text-ink shadow-hard-xs transition-colors hover:bg-lime lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      <div
        id="mobile-menu"
        ref={panelRef}
        inert={!open}
        className={cn(
          "absolute inset-x-0 top-full origin-top border-b-2 border-ink bg-ink text-ivory transition-[opacity,transform,visibility] duration-300 ease-out lg:hidden",
          open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-3 opacity-0",
        )}
      >
        <nav aria-label="Mobile" className="container-page py-6">
          <ul className="flex flex-col">
            {nav.map((item, i) => (
              <li key={item.href} className="border-b hairline-ivory">
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-baseline justify-between py-4 font-display text-3xl font-extrabold uppercase tracking-tight transition-colors hover:text-lime"
                >
                  {item.label}
                  <span className="text-label-index text-ivory/60">[0{i + 1}]</span>
                </a>
              </li>
            ))}
          </ul>
          <ActionLink
            href="#contact"
            variant="signal"
            size="lg"
            className="mt-6 w-full"
            onClick={() => setOpen(false)}
          >
            Let’s talk
          </ActionLink>
        </nav>
      </div>
    </header>
  );
}
