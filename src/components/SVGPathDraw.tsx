import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, useGSAP);

/* =========================================================
 * SVGラインドローイング（SVG Path Draw）
 * - 線画（SVG の path / line / circle）が、一筆書きのように描かれていく
 * - GSAP DrawSVGPlugin：stroke-dasharray / dashoffset の計算を自動化（drawSVG: '0%' → '100%'）
 * - mode = 'scroll'：スクロール量に合わせて描く（scrub）／ 'play'：画面に入ったら一定時間で描く
 * - 線の太さ・色は stroke で指定。線の端は round でやわらかく
 * - prefers-reduced-motion 時は最初から描き終わった状態
 * ========================================================= */

type Props = {
  mode?: 'scroll' | 'play';
  /** play 時の描画時間（秒） */
  duration?: number;
  /** 線の太さ */
  strokeWidth?: number;
  color?: string;
  /** 線ごとの時間差（play 時・秒） */
  stagger?: number;
};

export function SVGPathDraw({ mode = 'scroll', duration = 2.4, strokeWidth = 3, color = '#6366f1', stagger = 0.3 }: Props) {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const lines = gsap.utils.toArray<SVGGeometryElement>('[data-draw]');
      if (mode === 'scroll') {
        gsap
          .timeline({ scrollTrigger: { trigger: '[data-svg]', start: 'top 80%', end: 'bottom 40%', scrub: 0.5 } })
          .fromTo(lines, { drawSVG: '0%' }, { drawSVG: '100%', ease: 'none', stagger: 0.25 });
      } else {
        gsap.fromTo(lines, { drawSVG: '0%' }, { drawSVG: '100%', duration, ease: 'power2.inOut', stagger, scrollTrigger: { trigger: '[data-svg]', start: 'top 75%', once: true } });
      }
      // 点（丸）は線を描き終わる頃にポンと出す
      gsap.from('[data-dot]', { scale: 0, transformOrigin: '50% 50%', ease: 'back.out(3)', duration: 0.5, stagger: 0.15, scrollTrigger: { trigger: '[data-svg]', start: mode === 'scroll' ? 'center 50%' : 'top 75%', toggleActions: 'play none none reverse' }, delay: mode === 'play' ? duration * 0.8 : 0 });
    },
    { scope: rootRef, dependencies: [mode, duration, stagger], revertOnUpdate: true },
  );

  return (
    <main ref={rootRef} className="bg-stone-50 text-stone-900 dark:bg-neutral-950 dark:text-white">
      <section className="flex h-[65vh] flex-col justify-end px-8 pb-10 sm:px-16">
        <p className="text-xs font-semibold tracking-[0.3em] text-indigo-600 dark:text-indigo-400">SVG PATH DRAW</p>
        <h1 className="mt-3 text-4xl font-black sm:text-6xl">線が、道すじを描く。</h1>
      </section>
      <section className="mx-auto max-w-5xl px-6 pb-[40vh]">
        <svg data-svg viewBox="0 0 1000 520" className="h-auto w-full" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" role="img" aria-label="スタートからゴールまでの道のりを示す線画">
          {/* 道のり */}
          <path data-draw d="M40 440 C 180 440 180 300 320 300 S 460 140 600 160 S 780 360 960 80" />
          {/* 山 */}
          <path data-draw d="M620 420 L720 260 L780 340 L840 230 L960 420" opacity="0.7" />
          {/* 旗 */}
          <path data-draw d="M960 80 L960 20 L1000 36 L960 52" />
          {/* 太陽 */}
          <circle data-draw cx="140" cy="120" r="46" opacity="0.8" />
          {/* 通過点 */}
          {[
            [40, 440],
            [320, 300],
            [600, 160],
          ].map(([cx, cy]) => (
            <circle key={cx} data-dot cx={cx} cy={cy} r="10" fill={color} stroke="none" />
          ))}
        </svg>
        <div className="mt-6 flex justify-between text-xs font-semibold tracking-widest text-stone-500">
          <span>START</span>
          <span>GOAL</span>
        </div>
      </section>
    </main>
  );
}

export default function App() {
  return <SVGPathDraw />;
}
