import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import * as THREE from 'three';
import { companyLogo } from '@/lib/logo';
import { residentialPose, walkingPose } from '@/lib/residential-journey.mjs';

type SceneProps = { progress: MutableRefObject<number>; active: boolean; connect: (invalidate: (() => void) | null) => void; onReady: () => void; onFailure: () => void };
type XYZ = [number, number, number];
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const ballGeometry = new THREE.SphereGeometry(1, 12, 10);
const cylinderGeometry = new THREE.CylinderGeometry(.5, .5, 1, 12);
const torsoGeometry = new THREE.CylinderGeometry(.22, .165, .52, 12);
const hairGeometry = new THREE.SphereGeometry(.158, 12, 8, 0, Math.PI * 2, 0, Math.PI * .55);
const materials = new Map<string, THREE.MeshStandardMaterial>();
function material(color: string) {
  if (!materials.has(color)) materials.set(color, new THREE.MeshStandardMaterial({ color, roughness: .76 }));
  return materials.get(color)!;
}
const C = { plaster: '#e9e6db', stone: '#c9c8bf', light: '#faf8ef', teal: '#12546b', gold: '#d9a328', ink: '#102f38', glass: '#658b95', road: '#535d60', grass: '#809772', leaf: '#496f58', steel: '#abb8b7' };

function Box({ at, size, color, rotation = 0 }: { at: XYZ; size: XYZ; color: string; rotation?: number }) {
  return <mesh position={at} scale={size} rotation-y={rotation} geometry={boxGeometry} material={material(color)} castShadow receiveShadow dispose={null} />;
}
function Ball({ at, size, color }: { at: XYZ; size: XYZ; color: string }) {
  return <mesh position={at} scale={size} geometry={ballGeometry} material={material(color)} castShadow dispose={null} />;
}
function Cylinder({ at, size, color }: { at: XYZ; size: XYZ; color: string }) {
  return <mesh position={at} scale={size} geometry={cylinderGeometry} material={material(color)} castShadow dispose={null} />;
}

function useAdvertisements() {
  const logo = useLoader(THREE.TextureLoader, companyLogo.src);
  useEffect(() => { logo.colorSpace = THREE.SRGBColorSpace; logo.anisotropy = 4; logo.needsUpdate = true; }, [logo]);
  return useMemo(() => [logo], [logo]);
}

function Advertisement({ at, width, height, textures, angle = 0, screen = false }: { at: XYZ; width: number; height: number; textures: THREE.Texture[]; angle?: number; screen?: boolean }) {
  const logoWidth = Math.min(width * .88, height * .72 * companyLogo.width / companyLogo.height);
  return <group position={at} rotation-y={angle}>
    <Box at={[0, 0, -.065]} size={[width + .13, height + .13, .12]} color={screen ? C.ink : C.light} />
    <mesh position-z={.003}>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial color={C.light} roughness={screen ? .35 : .9} emissive={screen ? '#ffffff' : '#000000'} emissiveIntensity={.15} side={THREE.DoubleSide} />
    </mesh>
    <mesh position-z={.009}><planeGeometry args={[logoWidth, logoWidth * companyLogo.height / companyLogo.width]} /><meshStandardMaterial map={textures[0]} transparent roughness={.65} side={THREE.DoubleSide} /></mesh>
    <Box at={[0, height * .46, .012]} size={[width, height * .06, .012]} color={C.teal} />
    <Box at={[0, -height * .46, .012]} size={[width, height * .06, .012]} color={C.gold} />
  </group>;
}

function Person({ at, color, skin = '#b97f5d', phase = 0, yaw = 0, walk = false, leaflet = false, textures, progress }: { at: XYZ; color: string; skin?: string; phase?: number; yaw?: number; walk?: boolean; leaflet?: boolean; textures: THREE.Texture[]; progress: MutableRefObject<number> }) {
  const body = useRef<THREE.Group>(null);
  const leftLeg = useRef<THREE.Group>(null), rightLeg = useRef<THREE.Group>(null);
  const leftArm = useRef<THREE.Group>(null), rightArm = useRef<THREE.Group>(null);
  useFrame(() => {
    const pose = walkingPose(progress.current, phase);
    body.current!.position.y = at[1] + (walk ? pose.lift : 0);
    body.current!.position.x = at[0] + (walk ? (progress.current - .5) * 3.5 : 0);
    leftLeg.current!.rotation.x = walk ? pose.stride : 0;
    rightLeg.current!.rotation.x = walk ? -pose.stride : 0;
    leftArm.current!.rotation.x = walk ? -pose.stride * .65 : -.12;
    rightArm.current!.rotation.x = leaflet ? -.9 + pose.gesture : walk ? pose.stride * .65 : -.18 + pose.gesture;
  });
  return <group ref={body} position={at} rotation-y={yaw}>
    <group position={[0, .88, 0]}>
      <mesh position-y={.29} geometry={torsoGeometry} material={material(color)} castShadow dispose={null} />
      <Ball at={[0, .015, 0]} size={[.18, .15, .12]} color="#34424b" />
      <Cylinder at={[0, .62, 0]} size={[.14, .12, .14]} color={skin} />
      <Ball at={[0, .78, 0]} size={[.15, .195, .145]} color={skin} />
      <mesh position={[0, .825, -.012]} geometry={hairGeometry} material={material(phase > .5 ? '#362820' : '#222a2c')} dispose={null} />
      <Ball at={[-.052, .8, .132]} size={[.012, .014, .01]} color="#263237" />
      <Ball at={[.052, .8, .132]} size={[.012, .014, .01]} color="#263237" />
      <Ball at={[0, .75, .145]} size={[.025, .035, .025]} color={skin} />
      {[-1, 1].map(side => <group key={side} ref={side < 0 ? leftLeg : rightLeg} position={[side * .1, -.06, 0]}>
        <Cylinder at={[0, -.23, 0]} size={[.17, .44, .17]} color="#34424b" />
        <Ball at={[0, -.44, 0]} size={[.084, .09, .08]} color="#34424b" />
        <Cylinder at={[0, -.6, .015]} size={[.14, .34, .14]} color="#34424b" />
        <Box at={[0, -.77, .065]} size={[.17, .1, .32]} color="#273137" />
      </group>)}
      {[-1, 1].map(side => <group key={side} ref={side < 0 ? leftArm : rightArm} position={[side * .245, .47, 0]} rotation-z={side * .07}>
        <Cylinder at={[0, -.13, 0]} size={[.135, .27, .135]} color={color} />
        <Cylinder at={[0, -.38, .025]} size={[.105, .27, .105]} color={skin} />
        <Ball at={[0, -.54, .025]} size={[.065, .085, .055]} color={skin} />
        {leaflet && side > 0 && <Advertisement at={[.02, -.58, .09]} width={.23} height={.32} textures={textures} />}
      </group>)}
    </group>
  </group>;
}

function Car({ progress, reverse = false }: { progress: MutableRefObject<number>; reverse?: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => { ref.current!.position.x = reverse ? -16 + progress.current * 30 : 12 - progress.current * 34; });
  const color = reverse ? '#e4dfd5' : '#486a78';
  return <group ref={ref} position={[reverse ? -16 : 12, 0, reverse ? 9 : 5.6]} rotation-y={reverse ? Math.PI / 2 : -Math.PI / 2}>
    <Box at={[0, .58, 0]} size={[1.8, .52, 4.1]} color={color} />
    <Box at={[0, .86, -.12]} size={[1.76, .22, 3.9]} color={color} />
    <Box at={[0, 1.12, -.18]} size={[1.5, .58, 2.25]} color={C.glass} />
    <Box at={[0, 1.43, -.23]} size={[1.53, .1, 1.85]} color={color} />
    <Box at={[0, 1.12, .13]} size={[1.58, .66, .1]} color={color} />
    <Box at={[0, .62, 2.06]} size={[1.55, .16, .04]} color="#e6e8db" />
    <Box at={[0, .62, -2.06]} size={[1.55, .13, .04]} color="#a8594d" />
    {[-1, 1].flatMap(x => [-1.28, 1.28].map(z => <group key={`${x}-${z}`} position={[x * .89, .39, z]} rotation-z={Math.PI / 2}>
      <Cylinder at={[0, 0, 0]} size={[.7, .22, .7]} color="#283238" />
      <Cylinder at={[0, -.12, 0]} size={[.42, .025, .42]} color="#b0b8b9" />
    </group>))}
  </group>;
}

function Tree({ at, scale = 1 }: { at: XYZ; scale?: number }) {
  return <group position={at} scale={scale}>
    <Cylinder at={[0, 1.25, 0]} size={[.28, 2.5, .28]} color="#8b7967" />
    <Ball at={[0, 3.1, 0]} size={[1.3, 1.7, 1.2]} color={C.leaf} />
    <Ball at={[-.7, 2.8, .25]} size={[.95, 1.1, 1]} color="#6b8d65" />
  </group>;
}

function Apartment({ at, height = 15 }: { at: XYZ; height?: number }) {
  const windows = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    const matrix = new THREE.Matrix4();
    let i = 0;
    for (let floor = 0; floor < 6; floor++) for (let column = 0; column < 4; column++) {
      matrix.makeScale(.8, 1.1, .1); matrix.setPosition(-2.1 + column * 1.4, 2 + floor * (height - 3) / 6, 2.56);
      windows.current!.setMatrixAt(i++, matrix);
    }
    windows.current!.instanceMatrix.needsUpdate = true;
  }, [height]);
  return <group position={at}>
    <Box at={[0, height / 2, 0]} size={[6.8, height, 5]} color={C.plaster} />
    <Box at={[0, height + .16, 0]} size={[7, .32, 5.2]} color={C.light} />
    <instancedMesh ref={windows} args={[boxGeometry, material(C.glass), 24]} dispose={null} />
    {[3, 6, 9, 12].filter(y => y < height).map(y => <Box key={y} at={[0, y, 2.68]} size={[6.9, .16, .55]} color={C.light} />)}
  </group>;
}

function Environment({ progress, textures }: { progress: MutableRefObject<number>; textures: THREE.Texture[] }) {
  const sectors = useRef<(THREE.Group | null)[]>([]);
  useFrame(({ camera }) => sectors.current.forEach((group, index) => { if (group) group.visible = Math.abs(camera.position.z - [0, -12, -27, -42, -60][index]) < 31; }));
  return <>
    <Box at={[0, -.2, -27]} size={[80, .35, 115]} color={C.grass} />
    <Box at={[0, -.025, -27]} size={[13, .12, 85]} color="#d8d6c9" />
    <Box at={[0, -.005, 7.3]} size={[72, .12, 7.5]} color={C.road} />
    {Array.from({ length: 12 }, (_, i) => <Box key={i} at={[-30 + i * 5.5, .06, 7.3]} size={[2.4, .015, .1]} color="#eee9d8" />)}
    {[-1, 1].flatMap(side => [0, 1, 2, 3, 4].map(i => <Tree key={`${side}-${i}`} at={[side * (8.5 + i % 2), 0, -6 - i * 14]} scale={.9 + (i % 2) * .2} />))}
    <Apartment at={[-15, 0, -9]} height={18} /><Apartment at={[15, 0, -16]} height={22} />
    <Apartment at={[-19, 0, -36]} height={19} /><Apartment at={[20, 0, -49]} height={21} />

    <group ref={node => { sectors.current[0] = node; }}>
      {[-1, 1].map(side => <group key={side}>
        <Box at={[side * 6.1, 2.3, 0]} size={[1.1, 4.6, 1.1]} color={C.plaster} />
        <Box at={[side * 10.4, 1.1, 0]} size={[7.5, 2.2, .45]} color={C.stone} />
        {Array.from({ length: 8 }, (_, i) => <Box key={i} at={[side * (2.6 + i * .42), 1.2, 0]} size={[.045, 2.2, .08]} color={C.teal} />)}
      </group>)}
      <Box at={[0, 4.8, 0]} size={[13.5, .55, 1.25]} color={C.light} />
      <Advertisement at={[0, 3.35, .67]} width={5.3} height={1.75} textures={textures} />
      <Box at={[-4.4, .13, 2.1]} size={[1.6, .25, 2]} color={C.plaster} />
      <Person at={[-4.5, .26, 2]} color="#b9b4a3" yaw={.7} textures={textures} progress={progress} />
      <Person at={[3.7, 0, 2]} color="#dfb357" phase={.25} yaw={-.5} walk textures={textures} progress={progress} />
      <Person at={[-3, 0, -2]} color="#8cafa6" skin="#865941" phase={.6} yaw={Math.PI} walk textures={textures} progress={progress} />
      <Car progress={progress} /><Car progress={progress} reverse />
    </group>

    <group ref={node => { sectors.current[1] = node; }}>
      <Box at={[0, .08, -11]} size={[10, .16, 8]} color={C.light} />
      <Box at={[0, 2.5, -13]} size={[10, 5, .3]} color={C.plaster} />
      <Box at={[-4.85, 2.5, -10.5]} size={[.3, 5, 5]} color={C.plaster} />
      <Box at={[1.3, 1.58, -12.76]} size={[2.8, 3.2, .16]} color={C.teal} />
      <Box at={[.67, 1.5, -12.63]} size={[1.2, 2.85, .1]} color={C.steel} />
      <Box at={[1.93, 1.5, -12.63]} size={[1.2, 2.85, .1]} color={C.steel} />
      <Box at={[1.3, 2.99, -12.51]} size={[.5, .12, .035]} color={C.gold} />
      <Advertisement at={[-1.65, 2, -12.7]} width={1.25} height={1.9} textures={textures} screen />
      <Cylinder at={[3.6, .37, -11.8]} size={[.8, .75, .8]} color={C.stone} /><Tree at={[3.6, .3, -11.8]} scale={.35} />
      <Person at={[-.5, .16, -10.8]} color="#bd8d7d" skin="#c18b64" phase={.35} yaw={-2.6} textures={textures} progress={progress} />
      <Person at={[2.5, .16, -9.8]} color="#819ca7" phase={.75} yaw={Math.PI} textures={textures} progress={progress} />
    </group>

    <group ref={node => { sectors.current[2] = node; }}>
      <Box at={[0, .08, -25]} size={[10, .16, 7]} color={C.light} />
      <Box at={[0, 2.2, -27]} size={[10, 4.4, .3]} color={C.plaster} />
      <Box at={[1.3, 1.45, -26.8]} size={[1.7, 2.9, .15]} color="#8b745e" />
      <Ball at={[1.95, 1.4, -26.67]} size={[.045, .045, .045]} color={C.gold} />
      <Box at={[-2.2, 1.8, -26.78]} size={[2.3, 1.6, .1]} color={C.glass} />
      <Box at={[1.3, .18, -26.2]} size={[2.15, .24, .9]} color={C.stone} />
      <Person at={[.9, .29, -25.9]} color="#e0b65f" phase={.45} yaw={-.65} textures={textures} progress={progress} />
      <Person at={[-.3, .16, -24.7]} color={C.teal} skin="#8e5b42" phase={.2} yaw={2.1} leaflet textures={textures} progress={progress} />
      <Advertisement at={[-.09, 1.15, -24.45]} width={.4} height={.55} textures={textures} angle={.3} />
    </group>

    <group ref={node => { sectors.current[3] = node; }}>
      <Box at={[0, .05, -42]} size={[11, .12, 9]} color="#deddd2" />
      <Box at={[-3.8, .5, -43.5]} size={[2.8, .15, .75]} color="#aa8b68" />
      {[-4.7, -2.9].map(x => <Box key={x} at={[x, .25, -43.5]} size={[.12, .5, .6]} color={C.ink} />)}
      <Person at={[-.7, .12, -42]} color={C.teal} phase={.15} yaw={.6} leaflet textures={textures} progress={progress} />
      <Person at={[.7, .12, -41.3]} color="#b58377" skin="#915f45" phase={.8} yaw={-2.1} textures={textures} progress={progress} />
      <Person at={[3.7, .12, -44]} color="#91a4a2" phase={.65} yaw={-1.3} walk textures={textures} progress={progress} />
      <Advertisement at={[-.05, 1.22, -41.45]} width={.34} height={.46} textures={textures} />
    </group>

    <group ref={node => { sectors.current[4] = node; }}>
      <Box at={[0, .1, -59]} size={[10, .2, 8]} color={C.light} />
      <Box at={[0, 1.75, -60.8]} size={[5, 3.5, .2]} color={C.teal} />
      <Advertisement at={[0, 2.1, -60.64]} width={4.5} height={2.1} textures={textures} />
      <Box at={[0, 3.65, -59.7]} size={[5.4, .25, 2.7]} color={C.gold} />
      {[-2.4, 2.4].map(x => <Cylinder key={x} at={[x, 1.85, -58.5]} size={[.09, 3.7, .09]} color={C.teal} />)}
      <Box at={[0, .57, -58.8]} size={[3.8, 1.1, .8]} color={C.teal} />
      <Advertisement at={[0, .58, -58.36]} width={1.4} height={.65} textures={textures} />
      {[-.75, 0, .75].map(x => <group key={x}><Box at={[x, 1.25, -58.8]} size={[.32, .3, .3]} color={C.light} /><Advertisement at={[x, 1.25, -58.64]} width={.23} height={.2} textures={textures} /></group>)}
      <Person at={[-1.5, .2, -59.6]} color={C.teal} phase={.2} leaflet textures={textures} progress={progress} />
      <Person at={[.9, .2, -57.4]} color="#d0aa75" phase={.6} yaw={Math.PI} textures={textures} progress={progress} />
      <Person at={[-1.2, .2, -56.6]} color="#8b9f91" phase={.1} yaw={2.7} textures={textures} progress={progress} />
    </group>
  </>;
}

function Journey({ progress, connect, onReady, onFailure }: SceneProps) {
  const { camera, gl, invalidate, size } = useThree();
  const textures = useAdvertisements();
  const aim = useMemo(() => new THREE.Vector3(), []);
  useEffect(() => {
    connect(invalidate); invalidate(); onReady();
    const canvas = gl.domElement;
    canvas.addEventListener('webglcontextlost', onFailure);
    return () => { connect(null); canvas.removeEventListener('webglcontextlost', onFailure); };
  }, [connect, invalidate, gl, onReady, onFailure]);
  useEffect(() => {
    const perspective = camera as THREE.PerspectiveCamera;
    perspective.fov = size.width < 650 ? 68 : 46;
    perspective.updateProjectionMatrix(); invalidate();
  }, [camera, size.width, invalidate]);
  useFrame(() => {
    const pose = residentialPose(progress.current);
    camera.position.fromArray(pose.eye);
    camera.lookAt(aim.fromArray(pose.aim));
  }, -1);
  return <>
    <color attach="background" args={['#dae8e5']} />
    <fog attach="fog" args={['#dae8e5', 25, 72]} />
    <hemisphereLight args={['#fff8e9', '#93a28d', 2]} />
    <ambientLight intensity={.45} />
    <directionalLight position={[14, 24, 12]} color="#fff0d4" intensity={2.6} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-35} shadow-camera-right={35} shadow-camera-top={55} shadow-camera-bottom={-55} shadow-camera-far={140} shadow-bias={-.001} />
    <Environment progress={progress} textures={textures} />
  </>;
}

export default function ResidentialScene(props: SceneProps) {
  return <Canvas frameloop={props.active ? 'demand' : 'never'} shadows dpr={[1, 1.35]}
    camera={{ position: [12, 6.2, 22], fov: 46, near: .1, far: 150 }}
    gl={{ antialias: true, powerPreference: 'low-power', alpha: false }}
    onCreated={({ gl }) => { gl.outputColorSpace = THREE.SRGBColorSpace; gl.toneMapping = THREE.ACESFilmicToneMapping; }}>
    <Suspense fallback={null}><Journey {...props} /></Suspense>
  </Canvas>;
}
