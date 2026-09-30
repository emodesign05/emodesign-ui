import { useRef } from 'react';
import type { RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* =========================================================
 * プログレスバー（Top Scroll Progress Bar）
 * - 画面上部に、記事をどこまで読んだかを示す細いバーを固定表示
 * - scaleX（transform）で伸縮するので、レイアウト再計算が起きず軽い
 * - GSAP ScrollTrigger の scrub（秒）でなめらかに追従（reduced-motion 時は直結）
 * - role="progressbar" と aria-valuenow で支援技術にも進捗を伝える
 * - 対象を記事要素に限定（target）も可能。未指定ならページ全体
 * ========================================================= */

export function ScrollProgressBar({ target, height = 4, scrub = 0.4, colors = ['#6366f1', '#d946ef', '#fbbf24'] }: { target?: RefObject<HTMLElement | null>; height?: number; scrub?: number; colors?: [string, string, string] }) {
  const barRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const el = target?.current;
      gsap.fromTo(
        '[data-fill]',
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: el ?? document.documentElement,
            start: 'top top',
            end: el ? 'bottom bottom' : 'max',
            scrub: reduce || !scrub ? true : scrub,
            // aria-valuenow は整数%で更新（DOM を直接更新して再レンダーを避ける）
            onUpdate: (self) => barRef.current?.setAttribute('aria-valuenow', String(Math.round(self.progress * 100))),
          },
        },
      );
    },
    { scope: barRef, dependencies: [scrub, target], revertOnUpdate: true },
  );

  return (
    <div
      ref={barRef}
      role="progressbar"
      aria-label="記事の読了率"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
      style={{ height }}
      className="fixed inset-x-0 top-0 z-50 bg-slate-200/60 dark:bg-slate-800/60"
    >
      <div
        data-fill
        style={{ transform: 'scaleX(0)', backgroundImage: `linear-gradient(to right, ${colors[0]}, ${colors[1]}, ${colors[2]})` }}
        className="h-full origin-left"
      />
    </div>
  );
}

const PARAGRAPH =
  'デザインの良し悪しは、細部の積み重ねで決まります。余白の取り方、文字の大きさ、色のコントラスト、そして動きのタイミング。ひとつひとつは小さな判断でも、それらが揃ったときにはじめて、使う人にとって心地よい体験が生まれます。';

export default function App() {
  const articleRef = useRef<HTMLElement>(null);
  return (
    <main className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <ScrollProgressBar target={articleRef} />
      <header className="mx-auto max-w-2xl px-6 pb-10 pt-24">
        <p className="text-xs font-semibold tracking-[0.3em] text-indigo-600 dark:text-indigo-400">JOURNAL</p>
        <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-5xl">細部に宿る、体験の質。</h1>
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">2026.09.29 ・ 約5分で読めます</p>
      </header>
      <article ref={articleRef} className="mx-auto max-w-2xl space-y-8 px-6 pb-40 text-base leading-loose text-slate-700 dark:text-slate-300">
        {Array.from({ length: 14 }, (_, i) => (
          <section key={i}>
            {i % 4 === 0 && <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">第{i / 4 + 1}章</h2>}
            <p>{PARAGRAPH}</p>
          </section>
        ))}
      </article>
    </main>
  );
}
