import { useRef } from "react";
import { company, hero } from "@/content/site";
import { gsap, MOTION, MQ, useGSAP } from "@/lib/motion";
import { ActionLink } from "./primitives";
import { HeroArt } from "./HeroArt";

function clearPending() {
  document.documentElement.classList.remove("motion-pending");
}

export function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        const q = gsap.utils.selector(root);
        const lines = q("[data-hero-line]");
        const fades = q("[data-hero-fade]");
        const art = q("[data-hero-art]");
        gsap.set(lines, { yPercent: 0, y: 28, opacity: 0 });
        gsap.set(fades, { y: MOTION.hero.y, opacity: 0 });
        gsap.set(art, { y: 28, scale: 0.97, opacity: 0 });
        clearPending();

        const tl = gsap.timeline({ defaults: { ease: MOTION.ease } });
        tl.to(lines, {
          y: 0,
          opacity: 1,
          clearProps: "transform",
          duration: MOTION.hero.lineDuration,
          stagger: MOTION.hero.lineStagger,
        })
          .to(
            art,
            { y: 0, scale: 1, opacity: 1, duration: MOTION.hero.artDuration, ease: "power2.out" },
            0.12,
          )
          .to(
            fades,
            { y: 0, opacity: 1, duration: MOTION.hero.fadeDuration, stagger: 0.08 },
            0.3,
          );
        return () => tl.kill();
      });
      mm.add(MQ.reduce, clearPending);
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section
      id="top"
      ref={root}
      aria-labelledby="hero-title"
      className="relative flex min-h-[calc(100svh-115px)] items-center overflow-hidden border-b hairline bg-paper pb-8 pt-[calc(var(--header-h)+1.5rem)] lg:pb-10 lg:pt-[calc(var(--header-h)+2rem)]"
    >
      <div
        aria-hidden="true"
        className="text-label-index absolute left-5 top-[calc(var(--header-h)+1rem)] hidden text-[0.6875rem] text-ink/40 md:block lg:left-10"
      >
        [01 // {company.concept}]
      </div>
      <div
        aria-hidden="true"
        className="text-label-index absolute right-5 top-[calc(var(--header-h)+1rem)] hidden text-[0.6875rem] text-ink/40 md:block lg:right-10"
      >
        OFFLINE · ON-GROUND · INDIA
      </div>

      <div className="container-page">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-12 lg:gap-6">
          <div className="z-10 min-w-0 lg:col-span-7">
            <div
              data-hero-item
              data-hero-fade
              className="inline-flex items-center gap-2 border border-ink/20 bg-sand px-3 py-1.5 shadow-hard-xs"
            >
              <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full border border-ink bg-lime" />
              <span className="text-label-index text-[0.6875rem] text-ink sm:text-[0.8125rem]">
                {hero.eyebrow}
              </span>
            </div>

            <h1 id="hero-title" className="text-display-xl mt-6 text-ink">
              {hero.headline.map((line, i) => (
                <span key={line} className="-mb-[0.08em] block overflow-hidden pb-[0.08em]">
                  <span
                    data-hero-item
                    data-hero-line
                    className={
                      i === hero.headline.length - 1
                        ? "inline-block text-signal underline decoration-lime decoration-wavy decoration-[3px] underline-offset-[0.12em]"
                        : "inline-block"
                    }
                  >
                    {line}
                  </span>
                </span>
              ))}
            </h1>

            <p
              data-hero-item
              data-hero-fade
              className="mt-7 max-w-xl text-lg leading-relaxed text-ink/80"
            >
              {hero.copy}
            </p>

            <div data-hero-item data-hero-fade className="mt-8 flex flex-wrap items-center gap-4">
              <ActionLink href={hero.primaryCta.href} variant="ink">
                {hero.primaryCta.label}
              </ActionLink>
              <ActionLink href={hero.secondaryCta.href} variant="outline" arrow={false}>
                {hero.secondaryCta.label}
              </ActionLink>
            </div>

            <p data-hero-item data-hero-fade className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="text-label-index text-ink/55">Statement:</span>
              <span className="font-sans text-base font-semibold italic text-signal">
                “{company.tagline}”
              </span>
            </p>
          </div>

          <div className="min-w-0 lg:col-span-5">
            <HeroArt />
          </div>
        </div>
      </div>
    </section>
  );
}
