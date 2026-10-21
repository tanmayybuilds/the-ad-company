import { useRef } from "react";
import { clients, company } from "@/content/site";
import { gsap, MOTION, MQ, useGSAP } from "@/lib/motion";

export function ClientStrip() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add({ motion: MQ.motion, fine: MQ.finePointer, desktop: MQ.desktop }, (context) => {
        if (!context.conditions?.motion) return;

        const timing = MOTION.clients;
        gsap.timeline({
          defaults: { ease: MOTION.ease },
          scrollTrigger: { trigger: root.current, start: "top 82%", once: true },
        })
          .from("[data-boulevard-road]", { scaleX: 0, transformOrigin: "left center", duration: timing.road }, 0)
          .from("[data-client-building]", { scaleY: 0.2, y: 18, opacity: 0, transformOrigin: "center bottom", duration: timing.building, stagger: timing.stagger }, 0.15)
          .from("[data-client-sign]", { rotationX: -65, y: 24, opacity: 0, transformOrigin: "center bottom", duration: timing.sign, stagger: timing.stagger }, 0.55)
          .from("[data-boulevard-beacon]", { scale: 0, opacity: 0, duration: 0.3 }, 1.7);

        if (!context.conditions.fine || !context.conditions.desktop) return;
        const stage = root.current?.querySelector<HTMLElement>("[data-boulevard-stage]");
        const world = stage?.parentElement;
        if (!stage || !world) return;
        const rotateX = gsap.quickTo(stage, "rotationX", { duration: timing.settle, ease: MOTION.ease });
        const rotateY = gsap.quickTo(stage, "rotationY", { duration: timing.settle, ease: MOTION.ease });
        const move = (event: PointerEvent) => {
          const rect = world.getBoundingClientRect();
          const x = gsap.utils.clamp(-1, 1, (event.clientX - rect.left) / Math.max(rect.width, 1) * 2 - 1);
          const y = gsap.utils.clamp(-1, 1, (event.clientY - rect.top) / Math.max(rect.height, 1) * 2 - 1);
          rotateX(5 - y * timing.tilt);
          rotateY(x * timing.tilt);
        };
        const reset = () => { rotateX(5); rotateY(0); };
        world.addEventListener("pointermove", move);
        world.addEventListener("pointerleave", reset);
        return () => {
          world.removeEventListener("pointermove", move);
          world.removeEventListener("pointerleave", reset);
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-labelledby="clients-title" className="client-boulevard section-y border-b hairline bg-ivory">
      <div className="container-page">
        <h2 id="clients-title" className="text-display-md max-w-3xl">{clients.heading}</h2>
        <div className="boulevard-world">
          <div className="boulevard-stage" data-boulevard-stage>
            <div className="boulevard-road" data-boulevard-road aria-hidden="true">
              <span>{company.concept}</span>
              <i data-boulevard-beacon />
            </div>
            <ul className="boulevard-blocks">
              {clients.items.map(({ name, logo, width, height, background }) => (
                <li key={name} data-client className="boulevard-lot">
                  <div className="boulevard-building" data-client-building aria-hidden="true"><span /></div>
                  <div className="boulevard-sign" data-client-sign>
                    <div className="boulevard-face" style={{ backgroundColor: background }}>
                      <img
                        src={`${import.meta.env.BASE_URL}${logo.slice(1)}`}
                        alt={name}
                        width={width}
                        height={height}
                        loading="lazy"
                        decoding="async"
                        className="h-16 w-full max-w-44 object-scale-down"
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="boulevard-tree boulevard-tree-left" aria-hidden="true" />
            <div className="boulevard-tree boulevard-tree-right" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}
