import { useMemo, useRef } from 'react';
import type { RefObject } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { motion, useReducedMotion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { ArrowRight, GitBranch, Sparkles } from 'lucide-react';

/* =========================================================
 * 3Dヒーローシーン（Interactive 3D Canvas Background）※Three.js / R3F 版
 * - WebGL（React Three Fiber）でワイヤーフレームの多面体＋うねるコア球＋星屑を描画
 * - マウス位置に応じてシーン全体が Lerp（平滑化）で回転し、奥行きのある視点移動
 * - 見出し・ボタン側にマウスがあっても反応するよう、イベント源をセクション全体に設定
 * - Framer Motion でバッジ → 見出し → 本文 → ボタンの順にフェードイン
 * - DPR 上限 2 / 画面外では frameloop を止めて省電力 / reduced-motion 時は自動回転なし
 * ========================================================= */

const STAR_COUNT = 900;

/** 再現性のある乱数（描画ごとに星の位置が変わらないように） */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function createStars() {
  const rand = seeded(42);
  const arr = new Float32Array(STAR_COUNT * 3);
  for (let i = 0; i < STAR_COUNT; i++) {
    const r = 6 + rand() * 10;
    const theta = rand() * Math.PI * 2;
    const phi = Math.acos(2 * rand() - 1);
    arr.set([r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi)], i * 3);
  }
  return arr;
}

type SceneProps = {
  /** マウス追従の強さ（ラジアン） */
  followStrength: number;
  /** 追従のなめらかさ（0〜1、小さいほどゆっくり） */
  lerp: number;
  autoRotate: boolean;
  color: string;
  accent: string;
};

function Scene({ followStrength, lerp, autoRotate, color, accent }: SceneProps) {
  const root = useRef<THREE.Group>(null);
  const wire = useRef<THREE.Mesh>(null);
  const stars = useRef<THREE.Points>(null);
  const positions = useMemo(() => createStars(), []);

  useFrame(({ pointer }, delta) => {
    const k = 1 - Math.pow(1 - lerp, delta * 60);
    if (root.current) {
      root.current.rotation.y += (pointer.x * followStrength - root.current.rotation.y) * k;
      root.current.rotation.x += (-pointer.y * followStrength * 0.6 - root.current.rotation.x) * k;
    }
    if (autoRotate) {
      if (wire.current) {
        wire.current.rotation.y += delta * 0.15;
        wire.current.rotation.z += delta * 0.05;
      }
      if (stars.current) stars.current.rotation.y += delta * 0.01;
    }
  });

  return (
    <group ref={root}>
      <points ref={stars}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.035} color="#a5b4fc" transparent opacity={0.8} sizeAttenuation depthWrite={false} />
      </points>

      <Float speed={autoRotate ? 1.4 : 0} rotationIntensity={0.4} floatIntensity={0.8}>
        {/* 外側：ワイヤーフレームの多面体 */}
        <mesh ref={wire}>
          <icosahedronGeometry args={[1.9, 1]} />
          <meshBasicMaterial color={color} wireframe transparent opacity={0.55} />
        </mesh>
        {/* 内側：うねる発光コア */}
        <mesh scale={1.05}>
          <sphereGeometry args={[1, 96, 96]} />
          <MeshDistortMaterial color={accent} emissive={accent} emissiveIntensity={0.6} roughness={0.2} metalness={0.3} distort={autoRotate ? 0.45 : 0} speed={2} />
        </mesh>
      </Float>

      {/* 足元のグリッド */}
      <gridHelper args={[30, 40, color, '#1e293b']} position={[0, -2.6, 0]} />
    </group>
  );
}

export function Interactive3DCanvasHero({ followStrength = 0.5, lerp = 0.06, autoRotate = true, color = '#06b6d4', accent = '#7c3aed', height = 620 }: { followStrength?: number; lerp?: number; autoRotate?: boolean; color?: string; accent?: string; height?: number }) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } } };
  const item: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 24, filter: reduceMotion ? 'none' : 'blur(8px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <section
        ref={sectionRef}
        className="relative isolate w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-slate-950"
        style={{ height }}
      >
        {/* ---- 3D 背景層 ---- */}
        <div className="absolute inset-0 -z-10" aria-hidden>
          <Canvas
            dpr={[1, 2]}
            camera={{ position: [0, 0, 7], fov: 45 }}
            eventSource={sectionRef as RefObject<HTMLElement>}
            eventPrefix="client"
            gl={{ antialias: true, powerPreference: 'high-performance' }}
          >
            <color attach="background" args={['#020617']} />
            <fog attach="fog" args={['#020617', 7, 16]} />
            <ambientLight intensity={0.3} />
            <pointLight position={[4, 3, 5]} intensity={40} color="#22d3ee" />
            <pointLight position={[-5, -2, 2]} intensity={40} color="#d946ef" />
            <Scene followStrength={followStrength} lerp={lerp} autoRotate={autoRotate && !reduceMotion} color={color} accent={accent} />
          </Canvas>
          {/* 可読性のためのビネット */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(2,6,23,0.2)_0%,rgba(2,6,23,0.85)_75%)]" />
        </div>

        {/* ---- コピー＆アクション ---- */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="pointer-events-none flex h-full flex-col items-center justify-center px-6 text-center"
        >
          <motion.p
            variants={item}
            className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 text-xs font-semibold text-cyan-200 shadow-[0_0_24px_rgba(34,211,238,0.25)]"
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden /> Powered by WebGL
          </motion.p>
          <motion.h1 variants={item} className="mt-6 text-4xl font-black leading-[1.1] tracking-tight text-white sm:text-6xl">
            想像を、
            <span className="bg-gradient-to-r from-cyan-300 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">立体で描く。</span>
          </motion.h1>
          <motion.p variants={item} className="mt-5 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
            Three.js と React で組み上げたリアルタイム3D。マウスの動きに合わせて、空間ごとなめらかに回り込みます。
          </motion.p>
          <motion.div variants={item} className="pointer-events-auto mt-9 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#start"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/30 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              はじめる <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="https://github.com/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            >
              <GitBranch className="h-4 w-4" /> GitHub
            </a>
          </motion.div>
        </motion.div>
      </section>
    </main>
  );
}


export default function App() {
  return <Interactive3DCanvasHero />;
}
