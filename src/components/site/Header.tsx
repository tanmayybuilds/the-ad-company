import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { nav, serviceShowcase } from "@/content/site";
import { cn } from "@/lib/utils";
import { ActionLink, Wordmark } from "./primitives";
import { useMobileLayout } from '@/hooks/use-mobile-layout';

export function Header({ homePath = '' }: { homePath?: string } = {}) {
  const link = (href: string) => href.startsWith('#') ? `${homePath}${href}` : `${import.meta.env.BASE_URL}${href}`;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const isMobileLayout = useMobileLayout();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Highlight the section currently in view.
  useEffect(() => {
    const ids = nav.filter(n => n.href.startsWith('#')).map((n) => n.href.slice(1));
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
  }, [isMobileLayout]);

  // Mobile menu: Escape closes, focus moves into the panel and back.
  useEffect(() => {
    if (!open) return;
    const overflow = document.body.style.overflow;
    const padding = document.body.style.paddingRight;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    const background = [...document.querySelectorAll<HTMLElement>('main, #root > footer, #root > div > footer')];
    const previousInert = background.map(element => element.inert);
    background.forEach(element => { element.inert = true; });
    const first = panelRef.current?.querySelector<HTMLElement>("a");
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
      if (e.key === 'Tab') {
        const links = [...(panelRef.current?.querySelectorAll<HTMLElement>('a[href], button') ?? [])];
        const firstControl = buttonRef.current, lastControl = links.at(-1);
        if (e.shiftKey && document.activeElement === firstControl) { e.preventDefault(); lastControl?.focus(); }
        else if (!e.shiftKey && document.activeElement === lastControl) { e.preventDefault(); firstControl?.focus(); }
      }
    };
    const containFocus = (event: FocusEvent) => {
      if (event.target instanceof Node && !panelRef.current?.contains(event.target) && !buttonRef.current?.contains(event.target)) first?.focus();
    };
    const onResize = () => {
      if (window.matchMedia("(min-width: 1024px)").matches) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener('focusin', containFocus);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener('focusin', containFocus);
      window.removeEventListener("resize", onResize);
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = padding;
      background.forEach((element, index) => { element.inert = previousInert[index]; });
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b bg-ivory font-ui transition-[border-color] duration-300",
        scrolled ? "border-ink/15" : "border-ink/10",
      )}
    >
      <a
        href="#main"
        className="text-label-tag sr-only z-[60] bg-brand px-4 py-2 text-on-inverse focus:not-sr-only focus:absolute focus:left-4 focus:top-3"
      >
        Skip to content
      </a>
      <div className="container-page flex h-[var(--header-h)] items-center justify-between gap-6">
        <a href={link('#top')} aria-label="The Ad Company — back to top" className="shrink-0">
          <Wordmark />
        </a>

        <div className="flex items-center gap-6">
          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-6">
              {nav.map((item) => {
                const isActive = item.href === 'gallery.html' ? !!homePath : active === item.href.slice(1);
                return (
                  <li key={item.href}>
                    <a
                      href={link(item.href)}
                      aria-current={item.href === 'gallery.html' && homePath ? 'page' : undefined}
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

          <ActionLink href={link('#contact')} variant="signal" size="sm" className="hidden sm:inline-flex">
            Let’s talk
          </ActionLink>

          <button
            ref={buttonRef}
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center border-2 border-ink bg-paper text-ink shadow-hard-xs transition-colors hover:bg-lime hover:text-on-accent lg:hidden"
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
          "mobile-menu absolute inset-x-0 top-full origin-top border-b-2 border-ink bg-inverse text-on-inverse transition-[opacity,transform,visibility] duration-300 ease-out lg:hidden",
          open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-3 opacity-0",
        )}
      >
        <nav aria-label="Mobile" className="container-page py-6">
          <ul className="flex flex-col">
            {nav.map((item, i) => (
              <li key={item.href} className="border-b hairline-ivory" data-mobile-hidden={item.href === '#coverage' && !serviceShowcase.items.some(item => item.execution?.src)}>
                <a
                  href={link(item.href)}
                  aria-current={item.href === 'gallery.html' && homePath ? 'page' : undefined}
                  onClick={() => setOpen(false)}
                  className="flex items-baseline justify-between py-4 font-ui text-3xl font-extrabold uppercase tracking-tight transition-colors hover:text-lime"
                >
                  {item.label}
                  <span className="text-label-index text-on-inverse/70">[0{i + 1}]</span>
                </a>
              </li>
            ))}
          </ul>
          <ActionLink
            href={link('#contact')}
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
