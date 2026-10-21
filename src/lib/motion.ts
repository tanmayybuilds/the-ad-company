import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** Shared motion settings — adjust timings here. */
export const MOTION = {
  ease: "power3.out",
  easeInOut: "power2.inOut",
  hero: {
    lineDuration: 0.75,
    lineStagger: 0.09,
    fadeDuration: 0.6,
    artDuration: 1.0,
    y: 18,
  },
  reveal: { duration: 0.7, y: 24, yMobile: 12, start: "top 88%" },
  clients: { cycleSeconds: 5.2, pixelsPerSecond: 150 },
  services: { indicator: 0.45, image: 0.6 },
  work: { wipe: 0.9, stagger: 0.18 },
  process: { line: 1.0, step: 0.55, stagger: 0.28 },
  /** Hero 3D tilt range in radians (desktop fine pointer only). */
  tilt: { yaw: 0.16, pitch: 0.05, damping: 0.08 },
} as const;

/** gsap.matchMedia conditions. Changes during the session revert/re-run automatically. */
export const MQ = {
  motion: "(prefers-reduced-motion: no-preference)",
  reduce: "(prefers-reduced-motion: reduce)",
  desktop: "(min-width: 768px)",
  finePointer: "(hover: hover) and (pointer: fine)",
} as const;

export { gsap, ScrollTrigger, useGSAP };
