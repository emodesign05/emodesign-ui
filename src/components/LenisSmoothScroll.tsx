import { useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);
import { ArrowUp, Waves } from 'lucide-react';

/* =========================================================
 * スムーススクロール（Smooth Scroll / Lerp Scroll）
 * - Lenis でホイールスクロールに慣性（lerp）をかけ、なめらかな体験にする
 * - ページ内リンクも Lenis の scrollTo でイージング付き移動
 * - ON / OFF を切り替えて体感を比較できるデモ
 * - GSAP 連携：Lenis を gsap.ticker で駆動し、スクロールのたびに ScrollTrigger.update() → ScrollTrigger の演出と完全に同期
 *   （デモでは各チャプターの図形が ScrollTrigger の scrub で動く）
 * - アンマウント時に destroy（他ページへ影響を残さない）
 * - prefers-reduced-motion 時は初期状態 OFF
 * ========================================================= */

type SmoothOptions = {
  /** 追従の強さ（0.05〜0.2）。小さいほど“ぬるっと”長く滑る */
  lerp: number;
  /** ホイール1回あたりの移動量の倍率 */
  wheelMultiplier: number;
};

function useLenis(enabled: boolean, { lerp, wheelMultiplier }: SmoothOptions, anchorDuration = 1.4) {
  const lenisRef = useRef<Lenis | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    const lenis = new Lenis({ lerp, wheelMultiplier, smoothWheel: true, anchors: false });
    lenisRef.current = lenis;
    // Lenis のスクロール → ScrollTrigger に通知
    lenis.on('scroll', ScrollTrigger.update);
    // Lenis の更新を GSAP の ticker に一本化（requestAnimationFrame を二重に回さない）
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [enabled, lerp, wheelMultiplier]);

  // 進捗は ON / OFF どちらでも ScrollTrigger から取得
  useGSAP(() => {
    ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (self) => setProgress(self.progress) });
  });

  const scrollTo = (target: string | number) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, { duration: anchorDuration, easing: (t) => 1 - Math.pow(1 - t, 4) });
    } else if (typeof target === 'number') {
      window.scrollTo({ top: target });
    } else {
      document.querySelector(target)?.scrollIntoView();
    }
  };

  return { progress, scrollTo };
}

const CHAPTERS = [
  { id: 'intro', title: 'Intro', color: 'from-indigo-500 to-sky-400' },
  { id: 'flow', title: 'Flow', color: 'from-fuchsia-500 to-rose-400' },
  { id: 'inertia', title: 'Inertia', color: 'from-amber-400 to-orange-500' },
  { id: 'finish', title: 'Finish', color: 'from-emerald-400 to-teal-500' },
];

export function LenisSmoothScroll({ lerp = 0.08, wheelMultiplier = 1, anchorDuration = 1.4 }: { lerp?: number; wheelMultiplier?: number; anchorDuration?: number }) {
  const [enabled, setEnabled] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const rootRef = useRef<HTMLElement>(null);

  // 各チャプターの図形を ScrollTrigger（scrub）で回転・移動。Lenis ON だとこの動きも慣性付きになる
  useGSAP(
    () => {
      gsap.utils.toArray<HTMLElement>('[data-shape]').forEach((el, i) => {
        gsap.fromTo(el, { rotate: i % 2 ? 8 : -8, yPercent: 12 }, { rotate: i % 2 ? -8 : 8, yPercent: -12, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
      });
    },
    { scope: rootRef },
  );
  const { progress, scrollTo } = useLenis(enabled, { lerp, wheelMultiplier }, anchorDuration);

  const onAnchor = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    scrollTo(`#${id}`);
  };

  return (
    <main ref={rootRef} className="bg-white text-slate-900 dark:bg-slate-950 dark:text-white">
      {/* 固定コントロール */}
      <div className="fixed right-4 top-4 z-50 flex items-center gap-3 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs shadow-lg backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
        <Waves className="h-4 w-4 text-indigo-500" aria-hidden />
        <span className="font-semibold">Smooth</span>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={() => setEnabled((v) => !v)}
          className={`relative h-6 w-11 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${enabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
        >
          <span className="sr-only">スムーススクロール</span>
          <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-5' : ''}`} />
        </button>
        <span className="w-10 text-right tabular-nums text-slate-500 dark:text-slate-400">{Math.round(progress * 100)}%</span>
      </div>

      <nav aria-label="チャプター" className="fixed left-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-3 text-xs font-semibold md:flex">
        {CHAPTERS.map((c) => (
          <a key={c.id} href={`#${c.id}`} onClick={(e) => onAnchor(e, c.id)} className="rounded px-2 py-1 text-slate-500 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:text-white">
            {c.title}
          </a>
        ))}
      </nav>

      {CHAPTERS.map((c, i) => (
        <section key={c.id} id={c.id} className="flex min-h-screen items-center px-8 md:px-32">
          <div className="grid w-full items-center gap-10 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold tracking-[0.3em] text-indigo-600 dark:text-indigo-400">CHAPTER 0{i + 1}</p>
              <h2 className="mt-3 text-5xl font-black sm:text-7xl">{c.title}</h2>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                右上のスイッチで ON / OFF を切り替えて、ホイールを回したときの手触りを比べてみてください。左のリンクはイージング付きで移動します。
              </p>
            </div>
            <div data-shape className={`aspect-[4/3] rounded-3xl bg-gradient-to-br ${c.color}`} aria-hidden />
          </div>
        </section>
      ))}

      <div className="flex justify-center pb-24">
        <button
          type="button"
          onClick={() => scrollTo(0)}
          className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-5 py-2.5 text-sm font-medium hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:hover:bg-slate-900"
        >
          <ArrowUp className="h-4 w-4" /> トップへ戻る
        </button>
      </div>
    </main>
  );
}


export default function App() {
  return <LenisSmoothScroll />;
}
