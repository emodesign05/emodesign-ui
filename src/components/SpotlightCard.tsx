import { useRef } from 'react';
import type { CSSProperties } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Gauge, Layers, ShieldCheck, Sparkles, Workflow, Zap } from 'lucide-react';

gsap.registerPlugin(useGSAP);

/* =========================================================
 * スポットライトカード（Spotlight / Glow Border Card）
 * - カーソルの位置だけ、カードの枠線と背景がふわっと光る（SaaS の機能紹介で定番）
 * - 仕組み：カーソル座標を CSS 変数（--x / --y）に入れ、radial-gradient の中心に使う
 *   枠線は「1px 内側に背景色の面を重ねる」ことで、光る部分だけ枠として見せる
 * - グリッド全体でカーソルを追うので、隣のカードの枠もつながって光る
 * - GSAP quickTo で座標をなめらかに補間（ぴったり追従させたい場合は smooth を 0 に）
 * - タッチ端末では光らない（静的なカードとして表示）
 * ========================================================= */

type Props = {
  /** 光の半径（px） */
  size?: number;
  /** 光の色 */
  color?: string;
  /** 背景の光の強さ（0〜1） */
  intensity?: number;
  /** 追従のなめらかさ（秒） */
  smooth?: number;
};

const FEATURES = [
  { icon: Zap, title: '高速', body: '初期表示を最優先に設計。' },
  { icon: ShieldCheck, title: '堅牢', body: '型とテストで壊れにくく。' },
  { icon: Layers, title: '拡張性', body: '部品単位で組み替え可能。' },
  { icon: Workflow, title: '自動化', body: '繰り返し作業をなくす。' },
  { icon: Gauge, title: '計測', body: '数字で改善を回す。' },
  { icon: Sparkles, title: '演出', body: '動きで意図を伝える。' },
];

export function SpotlightGrid({ size = 320, color = '#818cf8', intensity = 0.15, smooth = 0.3 }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || window.matchMedia('(pointer: coarse)').matches) return;
      const cards = gsap.utils.toArray<HTMLElement>('[data-card]');
      const pos = { x: -9999, y: -9999 };
      const apply = () => {
        cards.forEach((c) => {
          const r = c.getBoundingClientRect();
          c.style.setProperty('--x', `${pos.x - r.left}px`);
          c.style.setProperty('--y', `${pos.y - r.top}px`);
        });
      };
      const toX = gsap.quickTo(pos, 'x', { duration: smooth, ease: 'power3.out', onUpdate: apply });
      const toY = gsap.quickTo(pos, 'y', { duration: smooth, ease: 'power3.out', onUpdate: apply });
      const onMove = (e: PointerEvent) => {
        if (smooth === 0) {
          pos.x = e.clientX;
          pos.y = e.clientY;
          apply();
          return;
        }
        toX(e.clientX);
        toY(e.clientY);
      };
      const onEnter = () => gsap.to(cards, { '--o': 1, duration: 0.3 });
      const onLeave = () => gsap.to(cards, { '--o': 0, duration: 0.5 });
      root.addEventListener('pointermove', onMove);
      root.addEventListener('pointerenter', onEnter);
      root.addEventListener('pointerleave', onLeave);
      return () => {
        root.removeEventListener('pointermove', onMove);
        root.removeEventListener('pointerenter', onEnter);
        root.removeEventListener('pointerleave', onLeave);
      };
    },
    { scope: rootRef, dependencies: [smooth], revertOnUpdate: true },
  );

  // 枠用（強い光）と面用（弱い光）の2つのグラデーション
  const glow = (alpha: number) => `radial-gradient(${size}px circle at var(--x) var(--y), color-mix(in srgb, ${color} ${Math.round(alpha * 100)}%, transparent), transparent 70%)`;

  return (
    <div ref={rootRef} className="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {FEATURES.map(({ icon: Icon, title, body }) => (
        <article
          key={title}
          data-card
          className="group relative rounded-2xl bg-white/10 p-px"
          style={{ '--x': '-9999px', '--y': '-9999px', '--o': 0, backgroundImage: glow(1) } as CSSProperties}
        >
          {/* 1px 内側の面（これで外周1pxだけ光って見える） */}
          <div className="relative h-full overflow-hidden rounded-[15px] bg-neutral-950 p-7">
            <div aria-hidden className="pointer-events-none absolute inset-0" style={{ backgroundImage: glow(intensity), opacity: 'var(--o)' }} />
            <Icon className="relative h-6 w-6 text-indigo-300" aria-hidden />
            <h3 className="relative mt-5 text-lg font-bold text-white">{title}</h3>
            <p className="relative mt-2 text-sm text-neutral-400">{body}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

export default function App() {
  return (
    <main className="flex min-h-screen flex-col justify-center gap-12 bg-neutral-950 px-6 py-24">
      <div className="text-center">
        <p className="text-xs font-semibold tracking-[0.3em] text-indigo-400">SPOTLIGHT CARD</p>
        <h1 className="mt-3 text-4xl font-black text-white sm:text-5xl">カーソルが、光になる。</h1>
      </div>
      <SpotlightGrid />
    </main>
  );
}
