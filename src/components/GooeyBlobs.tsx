import { useId, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

/* =========================================================
 * グーイー（Gooey / Liquid Blob Effect）
 * - 丸い要素同士が近づくと、液体のようにくっついて1つになり、離れるとちぎれる
 * - 仕組み：SVG フィルター（ぼかし feGaussianBlur → 透明度のコントラストを上げる feColorMatrix）を要素のグループにかける
 * - カーソルに追従する大きな玉と、少し遅れてついてくる小さな玉（GSAP quickTo の追従時間をずらす）
 *   ＋ ゆっくり漂う玉たち（GSAP の repeat / yoyo）
 * - ボタンのホバー演出（ボタン＋小玉が溶け合う）にも応用可
 * - タッチ端末では追従なし（漂う玉のみ）、prefers-reduced-motion 時は静止
 * ========================================================= */

type Props = {
  /** くっつき具合（ぼかしの強さ）。大きいほど遠くからくっつく */
  blur?: number;
  /** 追従する玉の数 */
  followers?: number;
  /** 玉の色 */
  color?: string;
  /** 追従の遅れ（秒）：先頭の玉 */
  lag?: number;
};

export function GooeyBlobs({ blur = 14, followers = 5, color = '#6366f1', lag = 0.25 }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const filterId = useId().replace(/:/g, '');

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      // 漂う玉
      gsap.utils.toArray<HTMLElement>('[data-float]').forEach((el, i) => {
        gsap.to(el, { x: gsap.utils.random(-120, 120), y: gsap.utils.random(-80, 80), scale: gsap.utils.random(0.7, 1.3), duration: gsap.utils.random(3, 6), ease: 'sine.inOut', repeat: -1, yoyo: true, delay: i * 0.3 });
      });
      if (window.matchMedia('(pointer: coarse)').matches) return;
      // カーソル追従の玉：後ろの玉ほど遅れて追う
      const setters = gsap.utils.toArray<HTMLElement>('[data-follow]').map((el, i) => ({
        x: gsap.quickTo(el, 'x', { duration: lag + i * 0.08, ease: 'power3.out' }),
        y: gsap.quickTo(el, 'y', { duration: lag + i * 0.08, ease: 'power3.out' }),
      }));
      const onMove = (e: PointerEvent) => {
        const r = root.getBoundingClientRect();
        setters.forEach((s) => {
          s.x(e.clientX - r.left);
          s.y(e.clientY - r.top);
        });
      };
      root.addEventListener('pointermove', onMove);
      return () => root.removeEventListener('pointermove', onMove);
    },
    { scope: rootRef, dependencies: [followers, lag], revertOnUpdate: true },
  );

  return (
    <div ref={rootRef} className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <svg aria-hidden className="absolute h-0 w-0">
        <filter id={filterId}>
          <feGaussianBlur in="SourceGraphic" stdDeviation={blur} result="blur" />
          {/* アルファ（透明度）を強調して、ぼけた縁をくっきりさせる → 液体のような輪郭に */}
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" />
        </filter>
      </svg>

      <div aria-hidden className="absolute inset-0" style={{ filter: `url(#${filterId})` }}>
        {/* 漂う玉 */}
        {[
          { left: '30%', top: '40%', size: 160 },
          { left: '55%', top: '55%', size: 120 },
          { left: '65%', top: '35%', size: 90 },
        ].map((b, i) => (
          <div key={i} data-float className="absolute rounded-full" style={{ left: b.left, top: b.top, width: b.size, height: b.size, background: color }} />
        ))}
        {/* カーソル追従の玉（先頭が大きく、後ろほど小さい） */}
        {Array.from({ length: followers }, (_, i) => {
          const s = 90 - i * (60 / Math.max(1, followers));
          return <div key={i} data-follow className="absolute -left-[200px] -top-[200px] rounded-full" style={{ width: s, height: s, marginLeft: -s / 2, marginTop: -s / 2, background: color }} />;
        })}
      </div>

      <div className="pointer-events-none relative flex min-h-screen flex-col items-center justify-center px-6 text-center mix-blend-difference">
        <p className="text-xs font-semibold tracking-[0.4em] text-white">GOOEY EFFECT</p>
        <h1 className="mt-4 text-5xl font-black tracking-tight text-white sm:text-7xl">触れると、溶け合う。</h1>
      </div>
    </div>
  );
}

export default function App() {
  return <GooeyBlobs />;
}
