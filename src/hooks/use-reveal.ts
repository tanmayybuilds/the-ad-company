import type { RefObject } from "react";
import { gsap, MOTION, MQ, useGSAP } from "@/lib/motion";

/**
 * Fades `[data-reveal]` children of `scope` up into place once as they enter
 * the viewport. Skipped entirely for reduced motion; lighter on phones.
 */
export function useReveal(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add({ motion: MQ.motion, desktop: MQ.desktop }, (ctx) => {
        const { motion, desktop } = ctx.conditions as { motion: boolean; desktop: boolean };
        if (!motion) return;
        const els = gsap.utils.toArray<HTMLElement>("[data-reveal]", scope.current);
        els.forEach((el) => {
          gsap.from(el, {
            y: desktop ? MOTION.reveal.y : MOTION.reveal.yMobile,
            opacity: 0,
            duration: MOTION.reveal.duration,
            ease: MOTION.ease,
            delay: Number(el.dataset["revealDelay"] ?? 0),
            scrollTrigger: { trigger: el, start: MOTION.reveal.start, once: true },
          });
        });
      });
      return () => mm.revert();
    },
    { scope },
  );
}
