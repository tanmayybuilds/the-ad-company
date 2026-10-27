/**
 * Sculptural advertising micro-city (React Three Fiber).
 * Browser-only: loaded lazily from HeroArt after hydration.
 *
 * Renders on demand: frames are drawn only while the tilt is settling, so the
 * scene is idle (no loop) when nothing moves, and fully paused offscreen.
 */
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { MOTION } from "@/lib/motion";
import { companyLogo } from "@/lib/logo";

const C = {
  ivory: "#F7F9F8",
  beige: "#E5EFF0",
  plinth: "#CEDFE2",
  plinthEdge: "#AAC8CE",
  ink: "#102F38",
  orange: "#12546B",
  lime: "#D9A328",
  glass: "#294B56",
};

type Pointer = { x: number; y: number };

export type HeroCity3DProps = {
  active: boolean;
  interactive: boolean;
  onReady: () => void;
};

export default function HeroCity3D({ active, interactive, onReady }: HeroCity3DProps) {
  const pointer = useRef<Pointer>({ x: 0, y: 0 });

  return (
    <Canvas
      orthographic
      shadows
      frameloop={active ? "demand" : "never"}
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
      camera={{ position: [7, 6.2, 7], near: 0.1, far: 100, zoom: 50 }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        gl.outputColorSpace = THREE.SRGBColorSpace;
        requestAnimationFrame(() => requestAnimationFrame(onReady));
      }}
      aria-hidden="true"
      style={{ width: "100%", height: "100%" }}
    >
      <Fit />
      <Lights />
      <PointerTracker pointer={pointer} enabled={interactive && active} />
      <Rig pointer={pointer} enabled={interactive}>
        <MicroCity />
      </Rig>
      <CaptureHook />
    </Canvas>
  );
}

/** Fit the orthographic frame to the container. */
function Fit() {
  const { camera, size, invalidate } = useThree();
  useLayoutEffect(() => {
    const cam = camera as THREE.OrthographicCamera;
    cam.zoom = Math.min(size.width, size.height) / 10.6;
    cam.position.set(7, 6.2, 7);
    cam.lookAt(0, 1.45, 0);
    cam.updateProjectionMatrix();
    invalidate();
  }, [camera, size, invalidate]);
  return null;
}

function Lights() {
  return (
    <>
      <ambientLight color="#fff7ea" intensity={1.35} />
      <hemisphereLight args={["#fffaf0", "#d9d2c4", 0.55]} />
      <directionalLight
        position={[9, 14, 6]}
        intensity={1.6}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
        shadow-camera-near={0.5}
        shadow-camera-far={40}
        shadow-bias={-0.0006}
        shadow-radius={4}
      />
      <directionalLight position={[-8, 5, -6]} intensity={0.35} color={C.lime} />
    </>
  );
}

function PointerTracker({
  pointer,
  enabled,
}: {
  pointer: React.MutableRefObject<Pointer>;
  enabled: boolean;
}) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    if (!enabled) {
      pointer.current = { x: 0, y: 0 };
      invalidate();
      return;
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pointer.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -((e.clientY / window.innerHeight) * 2 - 1),
      };
      invalidate();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [enabled, invalidate, pointer]);
  return null;
}

function Rig({
  pointer,
  enabled,
  children,
}: {
  pointer: React.MutableRefObject<Pointer>;
  enabled: boolean;
  children: React.ReactNode;
}) {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const tx = enabled ? pointer.current.x * MOTION.tilt.yaw : 0;
    const ty = enabled ? pointer.current.y * MOTION.tilt.pitch : 0;
    const k = MOTION.tilt.damping;
    g.rotation.y += (tx - g.rotation.y) * k;
    g.rotation.x += (-ty - g.rotation.x) * k;
    if (Math.abs(tx - g.rotation.y) > 0.0004 || Math.abs(-ty - g.rotation.x) > 0.0004) {
      state.invalidate();
    }
  });
  return <group ref={group}>{children}</group>;
}

/** Dev-only helper used to regenerate the static fallback image. */
function CaptureHook() {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const target = window as unknown as { __captureCity?: () => string };
    const capture = () => {
      gl.render(scene, camera);
      return gl.domElement.toDataURL("image/png");
    };
    target.__captureCity = capture;
    return () => { if (target.__captureCity === capture) delete target.__captureCity; };
  }, [gl, scene, camera]);
  return null;
}

/* ------------------------------------------------------------------ */
/* Textures                                                            */
/* ------------------------------------------------------------------ */

function useCanvasTexture(w: number, h: number, draw: (ctx: CanvasRenderingContext2D, logo: CanvasImageSource) => void) {
  const invalidate = useThree((s) => s.invalidate);
  const logo = useLoader(THREE.TextureLoader, companyLogo.src);
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    draw(ctx, logo.image);
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [w, h, logo]);

  // Redraw once the brand fonts are available.
  useEffect(() => {
    let cancelled = false;
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    if (!fonts) return;
    Promise.all([fonts.load('800 80px "Syne"'), fonts.load('700 40px "JetBrains Mono"')])
      .catch(() => undefined)
      .then(() => {
        if (cancelled) return;
        const ctx = (texture.image as HTMLCanvasElement).getContext("2d")!;
        ctx.clearRect(0, 0, w, h);
        draw(ctx, logo.image);
        texture.needsUpdate = true;
        invalidate();
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [texture]);

  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

const SYNE = '"Syne", "Arial Black", sans-serif';
const MONO = '"JetBrains Mono", monospace';

function drawScreen(ctx: CanvasRenderingContext2D, logo: CanvasImageSource) {
  ctx.fillStyle = C.ink;
  ctx.fillRect(0, 0, 512, 720);
  ctx.fillStyle = C.beige;
  ctx.fillRect(36, 36, 440, 330);
  ctx.drawImage(logo, 64, 60, 384, 384 * companyLogo.height / companyLogo.width);
  ctx.fillStyle = C.ink;
  ctx.font = `800 36px ${SYNE}`;
  ctx.fillText("OUT IN THE", 64, 300);
  ctx.fillText("REAL WORLD.", 64, 342);
  ctx.fillStyle = C.ivory;
  ctx.fillRect(36, 396, 440, 288);
  ctx.fillStyle = C.ink;
  ctx.font = `800 34px ${SYNE}`;
  ctx.fillText("COMMITTED TO", 64, 462);
  ctx.fillText("COMMITMENTS.", 64, 504);
  ctx.fillStyle = C.lime;
  ctx.beginPath();
  ctx.arc(400, 610, 44, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = C.ink;
  ctx.font = `700 22px ${MONO}`;
  ctx.fillText("[ON-GROUND]", 64, 620);
}

function drawMural(ctx: CanvasRenderingContext2D, logo: CanvasImageSource) {
  ctx.fillStyle = C.beige;
  ctx.fillRect(0, 0, 512, 900);
  ctx.fillStyle = C.ink;
  ctx.font = `800 104px ${SYNE}`;
  ctx.fillText("THE", 44, 170);
  ctx.fillText("WORLD", 44, 280, 424);
  ctx.fillText("IS OUR", 44, 390);
  ctx.fillStyle = C.ink;
  ctx.fillText("CANVAS.", 44, 500);
  ctx.fillStyle = C.lime;
  ctx.fillRect(44, 560, 240, 22);
  ctx.drawImage(logo, 44, 680, 424, 424 * companyLogo.height / companyLogo.width);
}

function drawAutoPanel(ctx: CanvasRenderingContext2D, logo: CanvasImageSource) {
  ctx.drawImage(logo, 8, 7, 240, 240 * companyLogo.height / companyLogo.width);
}

function drawBanner(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = C.lime;
  ctx.fillRect(0, 0, 128, 512);
  ctx.save();
  ctx.translate(86, 480);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = C.ink;
  ctx.font = `800 58px ${SYNE}`;
  ctx.fillText("YOUR BRAND", 0, 0);
  ctx.restore();
}

/* ------------------------------------------------------------------ */
/* Scene                                                               */
/* ------------------------------------------------------------------ */

function Box({
  args,
  color,
  position,
  rotation,
  shadow = true,
}: {
  args: [number, number, number];
  color: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  shadow?: boolean;
}) {
  return (
    <mesh position={position} rotation={rotation ?? [0, 0, 0]} castShadow={shadow} receiveShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial color={color} roughness={0.92} metalness={0} />
    </mesh>
  );
}

function MicroCity() {
  return (
    <group>
      <Plinth />
      <Residential />
      <Office />
      <ScreenTotem />
      <AutoRickshaw />
      <StreetBits />
    </group>
  );
}

function Plinth() {
  return (
    <group>
      <mesh position={[0, -0.22, 0]} receiveShadow>
        <cylinderGeometry args={[4.25, 4.45, 0.44, 72]} />
        <meshStandardMaterial color={C.plinth} roughness={1} />
      </mesh>
      <mesh position={[0, -0.47, 0]}>
        <cylinderGeometry args={[4.45, 4.45, 0.06, 72]} />
        <meshStandardMaterial color={C.ink} roughness={1} />
      </mesh>
      {/* Road band across the plinth */}
      <mesh position={[0.2, 0.006, 1.75]} rotation={[-Math.PI / 2, 0, 0.0]} receiveShadow>
        <planeGeometry args={[7.6, 1.15]} />
        <meshStandardMaterial color={C.plinthEdge} roughness={1} />
      </mesh>
      {[-2.6, -1.4, -0.2, 1, 2.2].map((x) => (
        <mesh key={x} position={[x, 0.012, 1.75]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.55, 0.06]} />
          <meshStandardMaterial color={C.ivory} roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

function Residential() {
  const mural = useCanvasTexture(512, 900, drawMural);
  const banner = useCanvasTexture(128, 512, drawBanner);
  const floors = [0, 1, 2, 3];
  return (
    <group position={[-1.45, 0, -0.55]}>
      <Box args={[2.3, 4.3, 2.0]} color={C.ivory} position={[0, 2.15, 0]} />
      <Box args={[2.42, 0.16, 2.12]} color={C.ink} position={[0, 4.36, 0]} />
      <Box args={[0.7, 0.42, 0.7]} color={C.beige} position={[-0.5, 4.65, -0.4]} />

      {/* Balconies on the front (+z) face */}
      {floors.map((i) => {
        const y = 0.95 + i * 0.92;
        return (
          <group key={i}>
            <Box args={[1.3, 0.07, 0.42]} color={C.beige} position={[-0.38, y, 1.18]} />
            <Box args={[1.3, 0.3, 0.04]} color={C.ink} position={[-0.38, y + 0.18, 1.38]} />
            <mesh position={[-0.38, y + 0.42, 1.005]}>
              <planeGeometry args={[1.0, 0.5]} />
              <meshStandardMaterial color={C.glass} roughness={0.5} />
            </mesh>
          </group>
        );
      })}
      {/* Vertical brand banner on the front face */}
      <mesh position={[0.72, 2.45, 1.006]}>
        <planeGeometry args={[0.55, 2.2]} />
        <meshStandardMaterial map={banner} roughness={0.9} />
      </mesh>
      {/* Ground-floor entrance + orange canopy */}
      <Box args={[0.62, 0.62, 0.05]} color={C.ink} position={[0.72, 0.31, 1.01]} shadow={false} />
      <Box args={[1.0, 0.07, 0.5]} color={C.orange} position={[0.72, 0.72, 1.24]} />

      {/* Side wall (+x) ad mural: THE WORLD IS OUR CANVAS. */}
      <mesh position={[1.156, 2.35, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.65, 2.9]} />
        <meshStandardMaterial map={mural} roughness={0.9} />
      </mesh>
    </group>
  );
}

function Office() {
  return (
    <group position={[1.55, 0, -1.65]}>
      <Box args={[1.9, 2.7, 1.55]} color={C.ink} position={[0, 1.35, 0]} />
      {[0, 1, 2].map((j) => (
        <Box
          key={j}
          args={[1.94, 0.26, 1.59]}
          color={C.glass}
          position={[0, 0.75 + j * 0.72, 0]}
          shadow={false}
        />
      ))}
      <Box args={[0.6, 0.48, 0.6]} color={C.lime} position={[0.35, 2.94, 0.15]} />
      <mesh position={[-0.45, 3.2, -0.3]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.95, 8]} />
        <meshStandardMaterial color={C.ink} />
      </mesh>
      <Box args={[1.94, 0.12, 0.1]} color={C.orange} position={[0, 0.32, 0.8]} shadow={false} />
    </group>
  );
}

function ScreenTotem() {
  const screen = useCanvasTexture(512, 720, drawScreen);
  return (
    <group position={[1.75, 0, 0.55]} rotation={[0, 0.55, 0]}>
      <Box args={[0.6, 0.18, 0.5]} color={C.ink} position={[0, 0.09, 0]} />
      <Box args={[0.24, 1.15, 0.24]} color={C.ink} position={[0, 0.66, 0]} />
      <Box args={[1.6, 2.24, 0.2]} color={C.ink} position={[0, 2.3, 0]} />
      <mesh position={[0, 2.3, 0.102]}>
        <planeGeometry args={[1.42, 2.0]} />
        <meshBasicMaterial map={screen} toneMapped={false} />
      </mesh>
      <mesh position={[0, 2.3, -0.102]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[1.42, 2.0]} />
        <meshStandardMaterial color={C.orange} roughness={0.9} />
      </mesh>
    </group>
  );
}

function AutoRickshaw() {
  const panel = useCanvasTexture(256, 128, drawAutoPanel);
  return (
    <group position={[-0.75, 0, 2.35]} rotation={[0, 0.5, 0]}>
      {/* Lower body */}
      <Box args={[1.45, 0.42, 0.92]} color={C.orange} position={[0, 0.42, 0]} />
      {/* Cabin frame + canvas hood */}
      <Box args={[1.12, 0.12, 0.96]} color={C.ink} position={[-0.12, 1.22, 0]} />
      <Box args={[1.0, 0.56, 0.06]} color={C.beige} position={[-0.18, 0.9, 0.44]} shadow={false} />
      <Box args={[1.0, 0.56, 0.06]} color={C.beige} position={[-0.18, 0.9, -0.44]} shadow={false} />
      <Box args={[0.06, 0.6, 0.92]} color={C.ink} position={[-0.66, 0.92, 0]} />
      {/* Ad panels on both sides */}
      <mesh position={[-0.2, 0.92, 0.475]}>
        <planeGeometry args={[0.82, 0.41]} />
        <meshStandardMaterial map={panel} transparent roughness={0.9} />
      </mesh>
      <mesh position={[-0.2, 0.92, -0.475]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.82, 0.41]} />
        <meshStandardMaterial map={panel} transparent roughness={0.9} />
      </mesh>
      {/* Windshield */}
      <mesh position={[0.5, 0.92, 0]} rotation={[0, 0, -0.22]}>
        <boxGeometry args={[0.05, 0.56, 0.8]} />
        <meshStandardMaterial color={C.glass} roughness={0.4} />
      </mesh>
      {/* Wheels */}
      {(
        [
          [0.62, 0.2, 0],
          [-0.5, 0.2, 0.46],
          [-0.5, 0.2, -0.46],
        ] as [number, number, number][]
      ).map((p, i) => (
        <mesh key={i} position={p} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 0.13, 20]} />
          <meshStandardMaterial color="#141413" roughness={1} />
        </mesh>
      ))}
      <mesh position={[0.74, 0.5, 0]}>
        <sphereGeometry args={[0.075, 12, 12]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
    </group>
  );
}

function StreetBits() {
  return (
    <group>
      {/* Lime sculptural tree */}
      <mesh position={[-3.0, 0.35, 0.9]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.7, 8]} />
        <meshStandardMaterial color={C.ink} />
      </mesh>
      <mesh position={[-3.0, 1.22, 0.9]} castShadow>
        <coneGeometry args={[0.48, 1.15, 8]} />
        <meshStandardMaterial color={C.lime} roughness={0.95} />
      </mesh>
      {/* Bollards */}
      {[0.7, 1.15, 1.6].map((x) => (
        <mesh key={x} position={[x, 0.18, 2.7]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.36, 12]} />
          <meshStandardMaterial color={C.ink} />
        </mesh>
      ))}
    </group>
  );
}
