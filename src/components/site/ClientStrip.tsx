import { useRef } from "react";
import { clients } from "@/content/site";
import { gsap, MQ, useGSAP } from "@/lib/motion";

export function ClientStrip() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.from("[data-client]", {
          opacity: 0,
          y: 12,
          duration: 0.5,
          ease: "power2.out",
          stagger: 0.05,
          scrollTrigger: { trigger: root.current, start: "top 85%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-labelledby="clients-title" className="border-b hairline bg-ivory py-10 lg:py-12">
      <div className="container-page">
        <div className="flex flex-col justify-between gap-2 pb-5 sm:flex-row sm:items-center">
          <h2 id="clients-title" className="text-label-index tracking-widest text-ink/70">
            {clients.heading}
          </h2>
          <span className="text-label-index text-[0.6875rem] text-ink/50">{clients.note}</span>
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
          {clients.names.map((name) => (
            <li
              key={name}
              data-client
              className="flex min-h-20 items-center justify-center border border-ink/20 bg-paper px-3 py-4 text-center transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-hard-xs"
            >
              <span className="font-display text-[0.95rem] font-bold uppercase leading-tight tracking-tight text-ink sm:text-base lg:text-lg">
                {name}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
