import { useRef } from 'react';
import type { PointerEvent, ReactNode } from 'react';
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { Sparkles } from 'lucide-react';

/* =========================================================
 * 3Dチルトカード（3D Tilt Card）
 * - カーソル位置に合わせてカードが立体的に傾く（rotateX / rotateY）
 * - 中の要素を translateZ で浮かせ、傾きに合わせて奥行きのズレ（パララックス）を出す
 * - カーソル位置に光沢（グレア）が走る
 * - マウスのみ反応（タッチでは静止）。prefers-reduced-motion 時は傾きなし
 * ========================================================= */

type TiltCardProps = {
  children: ReactNode;
  /** 最大傾き角（deg） */
  maxTilt?: number;
  /** 光沢の強さ（0〜1） */
  glare?: number;
  className?: string;
};

const SPRING = { stiffness: 250, damping: 20, mass: 0.5 };

export function TiltCard({ children, maxTilt = 14, glare = 0.35, className = '' }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  // -0.5〜0.5 の正規化座標
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, SPRING);
  const sy = useSpring(py, SPRING);

  const rotateY = useTransform(sx, [-0.5, 0.5], [-maxTilt, maxTilt]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [maxTilt, -maxTilt]);
  const glareX = useTransform(sx, [-0.5, 0.5], [0, 100]);
  const glareY = useTransform(sy, [-0.5, 0.5], [0, 100]);
  const glareBg = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,${glare}), transparent 55%)`;

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduceMotion || e.pointerType !== 'mouse' || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const reset = () => {
    px.set(0);
    py.set(0);
  };

  return (
    <div className="[perspective:1000px]">
      <motion.div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={reset}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className={`group relative rounded-3xl ${className}`}
      >
        {children}
        <motion.div
          aria-hidden
          style={{ background: glareBg }}
          className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 mix-blend-overlay transition-opacity duration-300 group-hover:opacity-100"
        />
      </motion.div>
    </div>
  );
}

/** カード内で浮かせる層 */
export function Layer({ depth, children, className = '' }: { depth: number; children: ReactNode; className?: string }) {
  return (
    <div style={{ transform: `translateZ(${depth}px)` }} className={className}>
      {children}
    </div>
  );
}

const CARDS = [
  { title: 'Aurora', price: '¥12,800', from: 'from-indigo-500', to: 'to-fuchsia-500', img: 'https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?w=900&q=80' },
  { title: 'Ember', price: '¥9,800', from: 'from-orange-500', to: 'to-rose-500', img: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=900&q=80' },
  { title: 'Lagoon', price: '¥14,200', from: 'from-teal-400', to: 'to-sky-500', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=80' },
];

export default function App() {
  return (
    <main className="min-h-screen bg-slate-100 px-6 py-20 dark:bg-slate-950">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-semibold tracking-[0.3em] text-indigo-600 dark:text-indigo-400">3D TILT CARD</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl dark:text-white">手に取るように、傾く。</h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">カードの上でカーソルを動かしてみてください。</p>

        <ul className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-3">
          {CARDS.map((c) => (
            <li key={c.title}>
              <TiltCard className={`aspect-[3/4] bg-gradient-to-br ${c.from} ${c.to} p-5 shadow-2xl shadow-slate-900/20`}>
                <Layer depth={30} className="h-3/5 overflow-hidden rounded-2xl shadow-xl">
                  <img src={c.img} alt="" className="h-full w-full object-cover" />
                </Layer>
                <Layer depth={60} className="mt-5 text-white">
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-widest text-white/80">
                    <Sparkles className="h-3.5 w-3.5" aria-hidden /> LIMITED
                  </p>
                  <h2 className="mt-1 text-2xl font-bold">{c.title}</h2>
                </Layer>
                <Layer depth={45} className="mt-3 flex items-center justify-between">
                  <span className="text-lg font-semibold text-white">{c.price}</span>
                  <button
                    type="button"
                    className="rounded-full bg-white px-4 py-1.5 text-xs font-bold text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                  >
                    詳細を見る
                  </button>
                </Layer>
              </TiltCard>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
