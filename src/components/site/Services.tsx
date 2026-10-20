import { useCallback, useLayoutEffect, useRef, useState } from "react";
import residentialImg from "@/assets/service-residential.jpg";
import corporateImg from "@/assets/service-corporate.jpg";
import outdoorImg from "@/assets/service-outdoor.jpg";
import cinemaImg from "@/assets/service-cinema-airport.jpg";
import deliveryImg from "@/assets/service-delivery.jpg";
import { services } from "@/content/site";
import { useReveal } from "@/hooks/use-reveal";
import { gsap, MOTION, useGSAP } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Eyebrow } from "./primitives";

const visuals: Record<string, { src: string; alt: string }> = {
  residential: {
    src: residentialImg,
    alt: "Illustration: miniature apartment society entrance with a lobby screen and notice board.",
  },
  corporate: {
    src: corporateImg,
    alt: "Illustration: miniature office lobby with a standee and a wall screen.",
  },
  outdoor: {
    src: outdoorImg,
    alt: "Illustration: miniature street with an auto-rickshaw, a cab, a bus shelter and a roadside screen.",
  },
  cinema: {
    src: cinemaImg,
    alt: "Illustration: miniature airport gate and cinema hall, each with a large screen.",
  },
  delivery: {
    src: deliveryImg,
    alt: "Illustration: miniature doorstep with a delivery bag holding a flyer and a phone showing an ad.",
  },
};

export function Services() {
  const root = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const first = useRef(true);
  const reduce = useRef(false);

  useReveal(root);

  const placeIndicator = useCallback((animate: boolean) => {
    const list = listRef.current;
    const ind = indicatorRef.current;
    const row = list?.children[active] as HTMLElement | undefined;
    if (!row || !ind) return;
    const props = { y: row.offsetTop, height: row.offsetHeight };
    if (animate && !reduce.current) {
      gsap.to(ind, { ...props, duration: MOTION.services.indicator, ease: MOTION.easeInOut, overwrite: true });
    } else {
      gsap.set(ind, props);
    }
  }, [active]);

  useLayoutEffect(() => {
    reduce.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    placeIndicator(!first.current);
    first.current = false;
    const ro = new ResizeObserver(() => placeIndicator(false));
    if (listRef.current) ro.observe(listRef.current);
    return () => ro.disconnect();
  }, [placeIndicator]);

  // Image transition when the selection changes.
  useGSAP(
    () => {
      const imgs = gsap.utils.toArray<HTMLElement>("[data-service-img]", root.current);
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      imgs.forEach((img, i) => {
        if (i === active) {
          gsap.set(img, { zIndex: 2, opacity: 1 });
          if (!reduced) {
            gsap.fromTo(
              img,
              { clipPath: "inset(0% 0% 100% 0%)", scale: 1.06 },
              { clipPath: "inset(0% 0% 0% 0%)", scale: 1, duration: MOTION.services.image, ease: MOTION.ease, overwrite: true },
            );
          } else {
            gsap.set(img, { clipPath: "inset(0% 0% 0% 0%)", scale: 1 });
          }
        } else {
          gsap.set(img, { zIndex: 1 });
          gsap.to(img, { opacity: 0, duration: reduced ? 0 : 0.3, delay: reduced ? 0 : 0.35, overwrite: true });
        }
      });
    },
    { scope: root, dependencies: [active] },
  );

  const current = services.items[active]!;

  return (
    <section
      id="services"
      ref={root}
      aria-labelledby="services-title"
      className="section-y relative border-b hairline bg-paper"
    >
      <div className="container-page">
        <div className="grid grid-cols-1 items-end gap-6 border-b hairline pb-10 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-8" data-reveal>
            <Eyebrow className="mb-3">[02 // Where your brand can show up]</Eyebrow>
            <h2 id="services-title" className="text-display-lg text-ink">
              {services.heading[0]}
              <br />
              {services.heading[1]}
            </h2>
          </div>
          <p className="max-w-md leading-relaxed text-ink/80 lg:col-span-4 lg:pb-2" data-reveal>
            {services.intro}
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-10 pt-10 lg:grid-cols-12 lg:gap-6">
          {/* Supporting visual — shown first on mobile so a selection is visible. */}
          <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:order-2 lg:col-span-5" data-reveal>
            <figure
              id="service-visual"
              aria-live="polite"
              className="border-2 border-ink bg-paper p-4 shadow-hard-md md:p-5"
            >
              <div className="mb-3 flex items-center justify-between gap-3 border-b hairline pb-2">
                <span className="text-label-index text-[0.6875rem] text-ink">
                  Format example // {current.visualLabel}
                </span>
                <span className="text-label-index text-[0.6875rem] text-signal">Illustration</span>
              </div>
              <div className="relative aspect-[4/3] w-full overflow-hidden border border-ink bg-sand-deep">
                {services.items.map((s, i) => (
                  <img
                    key={s.id}
                    data-service-img
                    src={visuals[s.id]!.src}
                    alt={i === active ? visuals[s.id]!.alt : ""}
                    aria-hidden={i !== active}
                    width={1024}
                    height={768}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover"
                    style={{ opacity: i === 0 ? 1 : 0 }}
                  />
                ))}
                <span className="text-label-index absolute bottom-3 left-3 z-10 bg-ink px-2 py-1 text-[0.6875rem] text-ivory">
                  [{current.index}] {current.title}
                </span>
              </div>
              <figcaption className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-label-index block text-[0.625rem] text-ink/60">Formats</span>
                  <span className="text-label-tag text-ink">{current.formats.length} listed</span>
                </div>
                <div>
                  <span className="text-label-index block text-[0.625rem] text-ink/60">Focus</span>
                  <span className="text-label-tag text-ink">
                    {current.primary ? "Our primary focus" : "Also available"}
                  </span>
                </div>
                <p className="text-label-index col-span-2 border border-lime-deep/40 bg-lime/30 p-2 text-[0.6875rem] normal-case tracking-normal text-ink">
                  Illustrative environment only — not a client campaign.
                </p>
              </figcaption>
            </figure>
          </div>

          {/* Service index */}
          <div className="relative min-w-0 lg:order-1 lg:col-span-7">
            <div
              ref={indicatorRef}
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 bg-ink shadow-hard-sm"
              style={{ height: 0 }}
            />
            <ul ref={listRef} className="relative" aria-label="Services">
              {services.items.map((s, i) => {
                const isActive = i === active;
                return (
                  <li
                    key={s.id}
                    data-active={isActive}
                    onClick={() => setActive(i)}
                    onMouseEnter={(e) => {
                      if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) setActive(i);
                      void e;
                    }}
                    className={cn(
                      "group relative cursor-pointer border-b px-4 py-6 transition-colors duration-300 md:px-6",
                      isActive ? "border-transparent text-ivory" : "hairline text-ink hover:bg-sand",
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "text-label-index transition-colors",
                            isActive ? "text-lime" : s.primary ? "text-signal" : "text-ink/55",
                          )}
                        >
                          [{s.index}]
                        </span>
                        {s.primary && (
                          <span className="text-label-tag bg-orange px-2 py-0.5 text-[0.625rem] tracking-widest text-ink">
                            Primary focus
                          </span>
                        )}
                      </div>
                      <span
                        aria-hidden="true"
                        className={cn(
                          "h-3 w-3 rounded-full border transition-colors",
                          isActive ? "border-lime bg-lime" : "border-ink/40 bg-transparent",
                        )}
                      />
                    </div>
                    <h3
                      className={cn(
                        "mt-2 font-display font-bold uppercase leading-tight tracking-tight",
                        s.primary ? "text-[clamp(1.75rem,1.3rem+1.4vw,2.5rem)]" : "text-headline-md",
                      )}
                    >
                      <button
                        type="button"
                        aria-pressed={isActive}
                        aria-controls="service-visual"
                        onFocus={() => setActive(i)}
                        className="text-left uppercase focus-visible:outline-offset-4"
                      >
                        {s.title}
                      </button>
                    </h3>
                    <p className={cn("mt-1 font-medium transition-colors", isActive ? "text-ivory/85" : "text-ink/75")}>
                      {s.lead}
                    </p>
                    <ul className="mt-4 flex flex-wrap gap-2" aria-label={`${s.title} formats`}>
                      {s.formats.map((f) => (
                        <li
                          key={f}
                          className={cn(
                            "text-label-index border px-2.5 py-1 text-[0.6875rem] normal-case tracking-normal transition-colors",
                            isActive ? "border-ivory/25 bg-ink-soft text-ivory" : "border-ink/20 bg-paper text-ink",
                          )}
                        >
                          {f}
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
