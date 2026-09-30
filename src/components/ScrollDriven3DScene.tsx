import { useMemo, useRef } from 'react';
import type { RefObject } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* =========================================================
 * スクロール連動3D演出（Scroll-Driven 3D Camera & Model Animation）
 * - GSAP ScrollTrigger の pin で Canvas を固定し、指定の長さ（500vh 分）スクロールさせる
 * - スクロール進捗（0〜1）に応じて、カメラがキーフレーム間を移動し、モデルが回転・変形
 * - 各チャプターの見出しと進捗バーは、同じ ScrollTrigger に紐づいた GSAP タイムライン（scrub）でフェード
 * - スクロール値は ref 経由で useFrame に渡し、React の再レンダーを発生させない
 * - モデルは Three.js のプリミティブで構成（GLB に差し替え可）
 * ========================================================= */

type Keyframe = { at: number; pos: [number, number, number]; look: [number, number, number] };

/** カメラの通り道（at = スクロール進捗） */
const CAMERA_PATH: Keyframe[] = [
  { at: 0, pos: [0, 0.4, 7], look: [0, 0, 0] },
  { at: 0.33, pos: [4.5, 1.6, 3.5], look: [0, 0.2, 0] },
  { at: 0.66, pos: [-3.8, 3.4, 2.2], look: [0, 0, 0] },
  { at: 1, pos: [0, 6.5, 0.01], look: [0, 0, 0] },
];

const CHAPTERS = [
  { range: [0, 0.2], eyebrow: '01 — FORM', title: '形を、見つめる。' },
  { range: [0.26, 0.46], eyebrow: '02 — ANGLE', title: '角度を変えれば、\n表情が変わる。' },
  { range: [0.56, 0.76], eyebrow: '03 — DEPTH', title: '奥行きの中へ。' },
  { range: [0.84, 1], eyebrow: '04 — ABOVE', title: '全体を、俯瞰する。' },
] as const;

const tmpPos = new THREE.Vector3();
const tmpLook = new THREE.Vector3();

function sampleCamera(p: number) {
  const i = Math.max(0, CAMERA_PATH.findIndex((k) => k.at >= p) - 1);
  const a = CAMERA_PATH[i];
  const b = CAMERA_PATH[Math.min(i + 1, CAMERA_PATH.length - 1)];
  const t = b.at === a.at ? 0 : THREE.MathUtils.smootherstep((p - a.at) / (b.at - a.at), 0, 1);
  tmpPos.set(...a.pos).lerp(new THREE.Vector3(...b.pos), t);
  tmpLook.set(...a.look).lerp(new THREE.Vector3(...b.look), t);
}

function Rig({ progress, smooth }: { progress: RefObject<number>; smooth: number }) {
  const look = useRef(new THREE.Vector3());
  useFrame(({ camera }, delta) => {
    sampleCamera(progress.current);
    const k = 1 - Math.pow(1 - smooth, delta * 60); // フレームレート非依存の lerp
    camera.position.lerp(tmpPos, k);
    look.current.lerp(tmpLook, k);
    camera.lookAt(look.current);
  });
  return null;
}

function Sculpture({ progress, color }: { progress: RefObject<number>; color: string }) {
  const knot = useRef<THREE.Mesh>(null);
  const rings = useRef<THREE.Group>(null);
  const ringData = useMemo(() => [1.9, 2.4, 2.9].map((r, i) => ({ r, tilt: (i - 1) * 0.5 })), []);

  useFrame((state, delta) => {
    const p = progress.current;
    if (knot.current) {
      knot.current.rotation.y += delta * 0.2;
      knot.current.rotation.x = p * Math.PI;
      const s = 1 + Math.sin(p * Math.PI) * 0.25;
      knot.current.scale.setScalar(s);
    }
    if (rings.current) {
      rings.current.rotation.y = p * Math.PI * 2 + state.clock.elapsedTime * 0.1;
      rings.current.children.forEach((c, i) => {
        c.rotation.x = Math.PI / 2 + ringData[i].tilt + p * (i + 1);
      });
    }
  });

  return (
    <group>
      <mesh ref={knot} castShadow>
        <torusKnotGeometry args={[1, 0.32, 256, 48]} />
        <meshPhysicalMaterial color={color} roughness={0.18} metalness={0.4} clearcoat={1} clearcoatRoughness={0.1} />
      </mesh>
      <group ref={rings}>
        {ringData.map(({ r }) => (
          <mesh key={r}>
            <torusGeometry args={[r, 0.012, 16, 200]} />
            <meshBasicMaterial color="#a5b4fc" transparent opacity={0.6} />
          </mesh>
        ))}
      </group>
      <ContactShadows position={[0, -1.8, 0]} opacity={0.5} scale={10} blur={2.5} far={4} />
    </group>
  );
}

export function ScrollDriven3DScene({ smooth = 0.08, fov = 40, sectionHeight = 500, knotColor = '#6366f1' }: { smooth?: number; fov?: number; sectionHeight?: number; knotColor?: string }) {
  const rootRef = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useGSAP(
    () => {
      // ステージを固定し、(sectionHeight - 100)vh 分スクロールさせる
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '[data-stage]',
          start: 'top top',
          end: () => `+=${(window.innerHeight * (sectionHeight - 100)) / 100}`,
          pin: true,
          scrub: true,
          onUpdate: (self) => {
            progress.current = self.progress;
          },
        },
        defaults: { ease: 'none' },
      });
      tl.fromTo('[data-bar]', { scaleY: 0 }, { scaleY: 1, duration: 1 }, 0);
      // チャプター：range の手前 0.05 でフェードイン、終わりの 0.05 でフェードアウト（最初／最後は端で表示したまま）
      const FADE = 0.05;
      gsap.utils.toArray<HTMLElement>('[data-chapter]').forEach((el, i) => {
        const [a, b] = CHAPTERS[i].range;
        if (a === 0) gsap.set(el, { autoAlpha: 1 });
        else tl.fromTo(el, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: FADE }, a - FADE);
        if (b !== 1) tl.to(el, { autoAlpha: 0, y: -40, duration: FADE }, b - FADE);
      });
    },
    { scope: rootRef, dependencies: [sectionHeight], revertOnUpdate: true },
  );

  return (
    <main ref={rootRef} className="bg-slate-950">
      <section data-stage className="relative h-screen overflow-hidden">
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{ position: CAMERA_PATH[0].pos, fov }}
          gl={{ antialias: true }}
          aria-label="スクロールに合わせて視点が移動する3Dオブジェクト"
          role="img"
        >
          <color attach="background" args={['#020617']} />
          <fog attach="fog" args={['#020617', 8, 18]} />
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 8, 5]} intensity={2.2} castShadow />
          <pointLight position={[-4, 2, -3]} intensity={30} color="#f472b6" />
          <pointLight position={[3, -2, 4]} intensity={20} color="#22d3ee" />
          <Sculpture progress={progress} color={knotColor} />
          <Rig progress={progress} smooth={reduceMotion ? 1 : smooth} />
        </Canvas>

        {CHAPTERS.map((c) => (
          <div key={c.eyebrow} data-chapter className="invisible absolute inset-x-0 bottom-16 px-8 sm:bottom-24 sm:px-16">
            <p className="text-xs font-semibold tracking-[0.3em] text-indigo-300">{c.eyebrow}</p>
            <h2 className="mt-3 whitespace-pre-line text-4xl font-bold leading-tight text-white sm:text-6xl">{c.title}</h2>
          </div>
        ))}

        {/* 進捗バー */}
        <div className="absolute right-6 top-1/2 h-40 w-px -translate-y-1/2 bg-white/15">
          <div data-bar className="h-full w-full origin-top scale-y-0 bg-indigo-400" />
        </div>
      </section>
      <section className="flex h-screen items-center justify-center px-6 text-center">
        <p className="text-sm text-slate-400">スクロール連動の3Dシーンはここまで。</p>
      </section>
    </main>
  );
}


export default function App() {
  return <ScrollDriven3DScene />;
}
