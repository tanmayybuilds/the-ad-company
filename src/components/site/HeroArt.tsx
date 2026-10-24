import { Component, lazy, Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import cityFallback from "@/assets/service-outdoor.jpg";
import { hero } from "@/content/site";
import { cn } from "@/lib/utils";
import { MQ } from "@/lib/motion";

const HeroCity3D = lazy(() => import("./HeroCity3D"));

class GLBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  override state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  override componentDidCatch() {
    this.props.onError();
  }
  override render() {
    return this.state.failed ? null : this.props.children;
  }
}

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") || c.getContext("webgl");
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return !!gl;
  } catch {
    return false;
  }
}

/**
 * Hero artwork: a static render of the micro-city is always present (SSR, no
 * JS, phones, WebGL failure). On desktop the live 3D scene fades in on top.
 */
export function HeroArt() {
  const frameRef = useRef<HTMLDivElement>(null);
  const [use3D, setUse3D] = useState(false);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(true);
  const [interactive, setInteractive] = useState(false);

  useEffect(() => {
    const desktop = window.matchMedia(MQ.desktop);
    const fine = window.matchMedia(MQ.finePointer);
    const motion = window.matchMedia(MQ.motion);
    const update = () => {
      setUse3D(desktop.matches && motion.matches && hasWebGL());
      setInteractive(desktop.matches && fine.matches && motion.matches);
    };
    update();
    desktop.addEventListener("change", update);
    fine.addEventListener("change", update);
    motion.addEventListener("change", update);
    return () => {
      desktop.removeEventListener("change", update);
      fine.removeEventListener("change", update);
      motion.removeEventListener("change", update);
    };
  }, []);

  // Pause rendering when offscreen or the tab is hidden.
  useEffect(() => {
    if (!use3D || !frameRef.current) return;
    let inView = true;
    const sync = () => setActive(inView && !document.hidden);
    const io = new IntersectionObserver((entries) => {
      inView = entries[0]?.isIntersecting ?? true;
      sync();
    });
    io.observe(frameRef.current);
    document.addEventListener("visibilitychange", sync);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [use3D]);

  return (
    <div className="relative mx-auto w-full max-w-[34rem] lg:max-w-none" data-hero-item data-hero-art>
      {/* Pedestal frame */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -rotate-1 border border-ink/15 bg-sand-deep shadow-hard-md"
      />
      <div className="text-label-index absolute -left-2 -top-4 z-20 border border-ink bg-paper px-3 py-1 text-[0.6875rem] font-bold text-ink shadow-hard-xs sm:-left-4">
        {hero.artNotes.top}
      </div>
      <div className="text-label-index absolute -bottom-4 right-2 z-20 flex items-center gap-2 border border-ink bg-lime px-3 py-1 text-[0.6875rem] font-bold text-on-accent shadow-hard-xs">
        <span aria-hidden="true" className="h-2 w-2 rounded-full bg-brand" />
        {hero.artNotes.bottom}
      </div>

      <div
        ref={frameRef}
        role="img"
        aria-label="Illustrated miniature city: everyday streets and advertising spaces, with a branded auto-rickshaw."
        className="relative z-10 aspect-[4/3] w-full overflow-hidden bg-sand md:aspect-[10/11]"
      >
        <img
          src={cityFallback}
          alt=""
          width={1024}
          height={768}
          fetchPriority="high"
          decoding="async"
          className={cn(
            "absolute inset-0 h-full w-full object-contain transition-opacity duration-300",
            ready && use3D ? "opacity-0 delay-300" : "opacity-100",
          )}
        />
        {use3D && (
          <GLBoundary onError={() => setUse3D(false)}>
            <Suspense fallback={null}>
              <div
                className={cn(
                  "absolute inset-0 transition-opacity duration-300",
                  ready ? "opacity-100" : "opacity-0",
                )}
              >
                <HeroCity3D active={active} interactive={interactive} onReady={() => setReady(true)} />
              </div>
            </Suspense>
          </GLBoundary>
        )}
      </div>
    </div>
  );
}
