import { useMemo, useRef, useState } from 'react';
import type { ComponentRef, KeyboardEvent } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useReducedMotion } from 'framer-motion';
import { Pause, Play, RotateCcw, Rotate3d } from 'lucide-react';

/* =========================================================
 * 360度3D商品ビューワー（Interactive 3D Product Viewer）
 * - ドラッグで360度回転、ホイール／ピンチで拡大縮小（OrbitControls）
 * - 操作していない間はゆっくり自動回転。操作すると一時停止
 * - カラーバリエーションをスウォッチで切替（色はなめらかに補間）
 * - キーボード ← → で回転、ボタンで視点リセット／自動回転の ON・OFF
 * - デモはプリミティブで作ったボトル。実物モデルは useGLTF('/model.glb') に差し替え可
 * - prefers-reduced-motion 時は自動回転なし
 * ========================================================= */

const VARIANTS = [
  { name: 'Midnight', body: '#1e293b', cap: '#cbd5e1' },
  { name: 'Coral', body: '#fb7185', cap: '#fff1f2' },
  { name: 'Sage', body: '#84a98c', cap: '#f5f5f4' },
  { name: 'Sand', body: '#d6b48a', cap: '#292524' },
];

/** ボトルの断面（LatheGeometry 用） */
function bottleProfile() {
  const pts: THREE.Vector2[] = [];
  const add = (x: number, y: number) => pts.push(new THREE.Vector2(x, y));
  add(0, -1.5);
  add(0.62, -1.5);
  add(0.7, -1.4);
  add(0.72, 0.6);
  add(0.68, 0.85);
  add(0.42, 1.15);
  add(0.3, 1.25);
  add(0.3, 1.4);
  add(0, 1.4);
  return pts;
}

function Bottle({ variant, spin }: { variant: number; spin: { current: number } }) {
  const group = useRef<THREE.Group>(null);
  const bodyMat = useRef<THREE.MeshPhysicalMaterial>(null);
  const capMat = useRef<THREE.MeshStandardMaterial>(null);
  const profile = useMemo(() => bottleProfile(), []);
  const target = useMemo(() => ({ body: new THREE.Color(), cap: new THREE.Color() }), []);

  useFrame((_, delta) => {
    target.body.set(VARIANTS[variant].body);
    target.cap.set(VARIANTS[variant].cap);
    const k = 1 - Math.pow(0.001, delta);
    bodyMat.current?.color.lerp(target.body, k);
    capMat.current?.color.lerp(target.cap, k);
    if (group.current) group.current.rotation.y += (spin.current - group.current.rotation.y) * k;
  });

  return (
    <group ref={group}>
      <mesh castShadow>
        <latheGeometry args={[profile, 96]} />
        <meshPhysicalMaterial ref={bodyMat} color={VARIANTS[0].body} roughness={0.35} metalness={0.1} clearcoat={0.8} clearcoatRoughness={0.2} />
      </mesh>
      {/* キャップ */}
      <mesh position={[0, 1.62, 0]} castShadow>
        <cylinderGeometry args={[0.36, 0.36, 0.5, 64]} />
        <meshStandardMaterial ref={capMat} color={VARIANTS[0].cap} roughness={0.25} metalness={0.6} />
      </mesh>
      {/* ラベル帯 */}
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.725, 0.725, 0.9, 96, 1, true]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.12} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

export function ProductViewer360({ autoRotateSpeed = 1.2, minDistance = 5, maxDistance = 12, fov = 35, lightIntensity = 2.4, damping = true }: { autoRotateSpeed?: number; minDistance?: number; maxDistance?: number; fov?: number; lightIntensity?: number; damping?: boolean }) {
  const reduce = useReducedMotion();
  const [variant, setVariant] = useState(0);
  const [auto, setAuto] = useState(!reduce);
  const [interacting, setInteracting] = useState(false);
  const spin = useRef(0);
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') spin.current -= Math.PI / 8;
    else if (e.key === 'ArrowRight') spin.current += Math.PI / 8;
    else return;
    e.preventDefault();
  };

  const reset = () => {
    spin.current = 0;
    controls.current?.reset();
  };

  const btn =
    'flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white/80 text-slate-700 backdrop-blur transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200';

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 text-slate-900 sm:px-8 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
        <div
          tabIndex={0}
          role="img"
          aria-label={`${VARIANTS[variant].name} カラーのボトル。ドラッグまたは左右キーで回転できます`}
          onKeyDown={onKeyDown}
          className="relative aspect-square overflow-hidden rounded-3xl bg-gradient-to-b from-white to-slate-200 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:from-slate-800 dark:to-slate-900"
        >
          <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0.8, 8.5], fov }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[3, 5, 4]} intensity={lightIntensity} castShadow shadow-mapSize={[1024, 1024]} />
            <directionalLight position={[-4, 2, -3]} intensity={0.8} color="#c7d2fe" />
            <Bottle variant={variant} spin={spin} />
            <ContactShadows position={[0, -1.52, 0]} opacity={0.45} scale={6} blur={2.4} far={3} />
            <OrbitControls
              ref={controls}
              enablePan={false}
              minDistance={minDistance}
              maxDistance={maxDistance}
              minPolarAngle={Math.PI * 0.2}
              maxPolarAngle={Math.PI * 0.6}
              autoRotate={auto && !interacting}
              autoRotateSpeed={autoRotateSpeed}
              enableDamping={damping}
              onStart={() => setInteracting(true)}
              onEnd={() => setInteracting(false)}
            />
          </Canvas>
          <p className="pointer-events-none absolute left-1/2 top-4 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/50 px-3 py-1 text-[11px] text-white">
            <Rotate3d className="h-3.5 w-3.5" aria-hidden /> ドラッグで回転・ホイールで拡大
          </p>
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button type="button" className={btn} onClick={() => setAuto((v) => !v)} aria-pressed={auto} aria-label="自動回転">
              {auto ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <button type="button" className={btn} onClick={reset} aria-label="視点をリセット">
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold tracking-[0.3em] text-indigo-600 dark:text-indigo-400">360° PRODUCT VIEWER</p>
          <h1 className="mt-3 text-4xl font-bold sm:text-5xl">Hydro Bottle</h1>
          <p className="mt-2 text-2xl font-semibold tabular-nums">¥4,980</p>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            あらゆる角度から質感を確かめられる3Dビューワー。カラーを選ぶと、その場で色がなめらかに切り替わります。
          </p>
          <fieldset className="mt-8">
            <legend className="text-sm font-semibold">
              カラー：<span className="font-normal">{VARIANTS[variant].name}</span>
            </legend>
            <div className="mt-3 flex gap-3">
              {VARIANTS.map((v, i) => (
                <label key={v.name} className="cursor-pointer">
                  <input type="radio" name="color" value={v.name} checked={variant === i} onChange={() => setVariant(i)} className="peer sr-only" />
                  <span
                    className="block h-10 w-10 rounded-full border-2 border-white shadow ring-2 ring-transparent transition peer-checked:ring-indigo-600 peer-focus-visible:ring-indigo-400 dark:border-slate-900"
                    style={{ backgroundColor: v.body }}
                  />
                  <span className="sr-only">{v.name}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <button type="button" className="mt-10 w-full rounded-full bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 sm:w-auto dark:bg-white dark:text-slate-900">
            カートに入れる
          </button>
        </div>
      </div>
    </main>
  );
}


export default function App() {
  return <ProductViewer360 />;
}
