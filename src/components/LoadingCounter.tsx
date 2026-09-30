import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { RotateCcw } from 'lucide-react';

gsap.registerPlugin(useGSAP);

/* =========================================================
 * プリローダー（Loading Counter）
 * - 0 → 100 の大きなカウンターとプログレスバーでローディングを演出
 * - 数値は「最初速く・最後ゆっくり」のイージングで増え、期待感を演出
 * - 100 到達後、画面が上へスライドして抜け、本編の見出しが立ち上がる
 * - GSAP タイムラインで「カウント → 待機 → 100 → 退場」を1本に連結（順番・間の調整が簡単）
 * - 実際の読み込み（画像・フォントなど）と連動させる場合は waitFor に Promise を渡す（90 で一時停止して待つ）
 * - role="progressbar" で進捗を支援技術にも通知
 * - prefers-reduced-motion 時は短いフェードのみ
 * ========================================================= */

type PreloaderProps = {
  /** カウントにかける最短時間（秒） */
  duration?: number;
  /** 完了を待つ処理（任意）。カウンターは 90 で待機し、解決後に 100 へ */
  waitFor?: Promise<unknown>;
  /** 退場アニメーションが終わった時に呼ばれる */
  onDone: () => void;
};

export function Preloader({ duration = 2.6, waitFor, onDone }: PreloaderProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  // onDone が再生成されてもカウントを最初からやり直さないよう ref で保持
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useGSAP(
    () => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const num = rootRef.current?.querySelector('[data-num]');
      const bar = rootRef.current?.querySelector('[role=progressbar]');
      const state = { v: 0 };
      const render = () => {
        const v = Math.round(state.v);
        if (num) num.textContent = String(v).padStart(3, '0');
        bar?.setAttribute('aria-valuenow', String(v));
      };
      const done = () => onDoneRef.current();

      if (reduce) {
        gsap.timeline({ onComplete: done }).set(state, { v: 100, onUpdate: render }).set('[data-fill]', { scaleX: 1 }).to(rootRef.current, { autoAlpha: 0, duration: 0.3, delay: 0.3 });
        return;
      }

      const tl = gsap.timeline({ onComplete: done });
      tl.to(state, { v: 90, duration: duration * 0.8, ease: 'expo.out', onUpdate: render }, 0)
        .to('[data-fill]', { scaleX: 0.9, duration: duration * 0.8, ease: 'expo.out' }, 0);
      // 実際の読み込みを待つ：90 で一時停止 → 解決したら再開
      if (waitFor) tl.addPause('+=0', () => void waitFor.then(() => tl.resume()));
      tl.to(state, { v: 100, duration: duration * 0.2, ease: 'power2.out', onUpdate: render })
        .to('[data-fill]', { scaleX: 1, duration: duration * 0.2, ease: 'power2.out' }, '<')
        // 退場：少し間を置いて上へスライド
        .to(rootRef.current, { yPercent: -100, duration: 1, ease: 'power4.inOut' }, '+=0.25');
    },
    { scope: rootRef, dependencies: [duration, waitFor] },
  );

  return (
    <div ref={rootRef} className="fixed inset-0 z-50 flex flex-col justify-between bg-neutral-950 p-8 text-neutral-100 sm:p-12">
      <div className="flex items-center justify-between text-xs tracking-[0.3em] text-neutral-400">
        <span>EMODESIGN</span>
        <span>LOADING</span>
      </div>
      <div className="flex items-end justify-between gap-6">
        <p className="max-w-xs text-sm leading-relaxed text-neutral-400">体験の準備をしています。</p>
        <span data-num aria-hidden className="text-[22vw] font-black leading-[0.8] tabular-nums tracking-tighter sm:text-[16vw]">
          000
        </span>
      </div>
      <div role="progressbar" aria-label="読み込み状況" aria-valuemin={0} aria-valuemax={100} aria-valuenow={0} className="absolute inset-x-0 bottom-0 h-1 bg-white/10">
        <div data-fill className="h-full origin-left scale-x-0 bg-gradient-to-r from-indigo-500 to-fuchsia-500" />
      </div>
    </div>
  );
}

/** 本編の見出し：プリローダーが抜けたら下からせり上がる */
function Hero({ ready, onReplay }: { ready: boolean; onReplay: () => void }) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      if (!ready) return;
      gsap
        .timeline()
        .from('h1', { yPercent: 100, duration: 1, ease: 'expo.out' })
        .from('p', { opacity: 0, duration: 0.8 }, 0.35);
    },
    { scope: ref, dependencies: [ready] },
  );
  return (
    <section ref={ref} className="flex min-h-screen flex-col justify-center px-8 sm:px-16">
      <div className="overflow-hidden">
        <h1 className="text-5xl font-black leading-[1.05] tracking-tight sm:text-8xl">Welcome.</h1>
      </div>
      <p className="mt-6 max-w-md text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
        カウンターが 100 に達すると、ローディング画面が上へ抜けて本編が始まります。
      </p>
      <button
        type="button"
        onClick={onReplay}
        className="mt-10 inline-flex w-fit items-center gap-2 rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-medium hover:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-neutral-700 dark:hover:bg-neutral-800"
      >
        <RotateCcw className="h-4 w-4" /> もう一度見る
      </button>
    </section>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [run, setRun] = useState(0);
  return (
    <main className="min-h-screen bg-stone-100 text-neutral-900 dark:bg-neutral-900 dark:text-white">
      {loading && <Preloader key={run} onDone={() => setLoading(false)} />}
      <Hero
        key={run}
        ready={!loading}
        onReplay={() => {
          setRun((n) => n + 1);
          setLoading(true);
        }}
      />
    </main>
  );
}
