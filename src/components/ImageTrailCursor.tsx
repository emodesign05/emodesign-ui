import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

/* =========================================================
 * 画像トレイル（Image Trail Cursor）
 * - マウスを動かした軌跡に、画像が次々と現れては消えていく（ポートフォリオ・ギャラリーのファーストビューに）
 * - 一定距離（threshold px）動くごとに、用意した画像を順番に1枚ずつ使い回して表示
 * - GSAP：出現（拡大＋フェードイン）→ 少し漂う → 縮小＋フェードアウトを1本のタイムラインで
 * - 画像は <img> を事前に N 枚だけ置いて使い回す（DOM を増やし続けない）
 * - タッチ端末（pointer: coarse）と prefers-reduced-motion では無効
 * ========================================================= */

const IMAGES = [
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600&q=70',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&q=70',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=70',
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=600&q=70',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&q=70',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&q=70',
];
/** 画像が読み込めない環境でも形が分かるよう、背景にグラデーションを敷く */
const FALLBACK = ['from-indigo-500 to-sky-400', 'from-rose-500 to-orange-400', 'from-emerald-500 to-lime-400', 'from-fuchsia-500 to-violet-500', 'from-amber-400 to-yellow-300', 'from-cyan-500 to-teal-400'];

type Props = {
  /** 何 px 動くごとに1枚出すか */
  threshold?: number;
  /** 1枚が表示されている時間（秒） */
  lifetime?: number;
  /** 画像の幅（px） */
  size?: number;
  /** 出現時の傾き（度・ランダム幅） */
  rotate?: number;
};

export function ImageTrailArea({ threshold = 80, lifetime = 0.9, size = 220, rotate = 10 }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      if (window.matchMedia('(pointer: coarse), (prefers-reduced-motion: reduce)').matches) return;
      const items = gsap.utils.toArray<HTMLElement>('[data-trail]');
      let index = 0;
      let last: { x: number; y: number } | null = null;
      let z = 1;

      const onMove = (e: PointerEvent) => {
        const rect = root.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        if (last && Math.hypot(x - last.x, y - last.y) < threshold) return;
        const dx = last ? x - last.x : 0;
        const dy = last ? y - last.y : 0;
        last = { x, y };
        const el = items[index % items.length];
        index++;
        gsap.killTweensOf(el);
        gsap
          .timeline()
          .set(el, { x, y, xPercent: -50, yPercent: -50, zIndex: z++, rotate: gsap.utils.random(-rotate, rotate), scale: 0.6, autoAlpha: 0 })
          .to(el, { scale: 1, autoAlpha: 1, duration: 0.25, ease: 'power3.out' })
          // 動いた方向に少し流れる
          .to(el, { x: x + dx * 0.4, y: y + dy * 0.4, duration: lifetime, ease: 'power2.out' }, 0)
          .to(el, { scale: 0.4, autoAlpha: 0, duration: 0.4, ease: 'power2.in' }, lifetime);
      };
      root.addEventListener('pointermove', onMove);
      return () => root.removeEventListener('pointermove', onMove);
    },
    { scope: rootRef, dependencies: [threshold, lifetime, size, rotate], revertOnUpdate: true },
  );

  return (
    <div ref={rootRef} className="relative flex min-h-screen items-center justify-center overflow-hidden bg-neutral-950 text-white">
      {IMAGES.map((src, i) => (
        <div
          key={src}
          data-trail
          aria-hidden
          className={`pointer-events-none invisible absolute left-0 top-0 overflow-hidden rounded-xl bg-gradient-to-br shadow-2xl ${FALLBACK[i % FALLBACK.length]}`}
          style={{ width: size, height: size * 1.25 }}
        >
          <img src={src} alt="" className="h-full w-full object-cover" draggable={false} />
        </div>
      ))}
      <div className="pointer-events-none relative z-[9999] px-6 text-center mix-blend-difference">
        <p className="text-xs font-semibold tracking-[0.4em]">IMAGE TRAIL</p>
        <h1 className="mt-4 text-5xl font-black tracking-tight sm:text-8xl">Move your cursor.</h1>
      </div>
    </div>
  );
}

export default function App() {
  return <ImageTrailArea />;
}
