import { useEffect } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';

/* =========================================================
 * メッシュグラデーション（Animated Organic Mesh Gradient）
 * - 強くぼかした色の塊（ブロブ）を複数重ね、それぞれを別周期でゆっくり漂わせる
 * - 塊同士が溶け合い、有機的に形を変えるメッシュグラデーションになる
 * - マウス位置に合わせてブロブが層ごとに逆方向へずれ（奥行き）、カーソル位置には光の塊が追従して色が混ざる
 * - 上から細かいノイズを重ねてバンディング（色の段差）を目立たなくする
 * - prefers-reduced-motion 時は静止
 * ========================================================= */

type Blob = { color: string; size: string; x: string[]; y: string[]; duration: number; depth: number };

const BLOBS: Blob[] = [
  { color: '#6366f1', size: '55vmax', x: ['-10%', '20%', '-5%'], y: ['-10%', '10%', '-10%'], duration: 22, depth: 160 },
  { color: '#ec4899', size: '45vmax', x: ['60%', '40%', '65%'], y: ['-5%', '25%', '-5%'], duration: 26, depth: -220 },
  { color: '#06b6d4', size: '50vmax', x: ['10%', '35%', '5%'], y: ['50%', '30%', '55%'], duration: 30, depth: 260 },
  { color: '#f59e0b', size: '35vmax', x: ['65%', '55%', '70%'], y: ['55%', '40%', '60%'], duration: 24, depth: -140 },
];

/** カーソルに追従する塊 */
const FOLLOWER = { color: '#8b5cf6', size: '38vmax' };

const NOISE = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.5'/></svg>")`;

function BlobLayer({ blob, mx, my, reduce, depth, speed }: { blob: Blob; mx: ReturnType<typeof useSpring>; my: ReturnType<typeof useSpring>; reduce: boolean; depth: number; speed: number }) {
  const tx = useTransform(mx, (v) => v * blob.depth * depth);
  const ty = useTransform(my, (v) => v * blob.depth * depth);
  return (
    <motion.div className="absolute left-0 top-0" style={{ x: tx, y: ty }}>
      <motion.div
        className="rounded-full opacity-80 mix-blend-multiply dark:opacity-70 dark:mix-blend-screen"
        style={{ width: blob.size, height: blob.size, background: `radial-gradient(circle at center, ${blob.color} 0%, transparent 65%)` }}
        initial={{ x: blob.x[0], y: blob.y[0] }}
        animate={reduce ? undefined : { x: blob.x, y: blob.y, scale: [1, 1.15, 1] }}
        transition={{ duration: blob.duration / speed, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  );
}

export function MeshGradient({ blur = 64, saturation = 1.5, depth = 1, follower = true, speed = 1 }: { blur?: number; saturation?: number; depth?: number; follower?: boolean; speed?: number }) {
  const reduce = !!useReducedMotion();
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const mx = useSpring(px, { stiffness: 50, damping: 18 });
  const my = useSpring(py, { stiffness: 50, damping: 18 });
  // カーソル位置そのもの（px）に追従する光の塊
  const cx = useMotionValue(-9999);
  const cy = useMotionValue(-9999);
  const fx = useSpring(cx, { stiffness: 70, damping: 20 });
  const fy = useSpring(cy, { stiffness: 70, damping: 20 });

  useEffect(() => {
    if (reduce) return;
    const onMove = (e: PointerEvent) => {
      px.set(e.clientX / window.innerWidth - 0.5);
      py.set(e.clientY / window.innerHeight - 0.5);
      cx.set(e.clientX);
      cy.set(e.clientY);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [reduce, px, py, cx, cy]);

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden bg-white dark:bg-slate-950">
      <div className="absolute inset-0" style={{ filter: `blur(${blur}px) saturate(${saturation})` }}>
        {BLOBS.map((b) => (
          <BlobLayer key={b.color} blob={b} mx={mx} my={my} reduce={reduce} depth={depth} speed={speed} />
        ))}
        {/* カーソル追従の光（周囲の色と溶け合う） */}
        {!reduce && follower && (
          <motion.div
            className="absolute left-0 top-0 rounded-full opacity-90 mix-blend-multiply dark:mix-blend-screen"
            style={{
              x: fx,
              y: fy,
              translateX: '-50%',
              translateY: '-50%',
              width: FOLLOWER.size,
              height: FOLLOWER.size,
              background: `radial-gradient(circle at center, ${FOLLOWER.color} 0%, transparent 65%)`,
            }}
          />
        )}
      </div>
      <div className="absolute inset-0 opacity-25 mix-blend-overlay" style={{ backgroundImage: NOISE }} />
    </div>
  );
}

export default function App() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      <MeshGradient />
      <div className="relative z-10 max-w-2xl text-center">
        <p className="text-xs font-semibold tracking-[0.35em] text-slate-700 dark:text-white/80">MESH GRADIENT</p>
        <h1 className="mt-4 text-5xl font-black leading-[1.05] tracking-tight text-slate-900 sm:text-7xl dark:text-white">
          色が、呼吸する。
        </h1>
        <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-slate-700 dark:text-white/80">
          4つの色の塊がそれぞれの周期で漂い、溶け合いながら表情を変え続けます。マウスを動かすと色の塊が流れ、カーソルの位置に紫の光が溶け込みます。
        </p>
        <a
          href="#"
          className="mt-8 inline-flex rounded-full bg-slate-900/90 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:bg-white/90 dark:text-slate-900 dark:hover:bg-white"
        >
          詳しく見る
        </a>
      </div>
    </main>
  );
}
