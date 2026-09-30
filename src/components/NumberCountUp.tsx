import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* =========================================================
 * 数値カウントアップ（Number Count Up）
 * - 実績の数字（導入社数・満足度など）が、画面に入った時に 0 から目標値まで増える
 * - GSAP：数値オブジェクトを tween し、onUpdate で桁区切り（toLocaleString）＋小数桁を整えて描画
 * - 複数の数字は stagger で少しずつずらして開始
 * - 数字の幅が変わってガタつかないよう tabular-nums（等幅数字）
 * - 読み上げは最終値（aria-label）、prefers-reduced-motion 時は最初から最終値
 * ========================================================= */

type CountProps = {
  value: number;
  /** 小数点以下の桁数 */
  decimals?: number;
  prefix?: string;
  suffix?: string;
  /** 再生時間（秒） */
  duration?: number;
  /** 開始までの遅延（秒） */
  delay?: number;
  /** イージング（GSAP の ease 名） */
  ease?: string;
  className?: string;
};

export function CountUp({ value, decimals = 0, prefix = '', suffix = '', duration = 2, delay = 0, ease = 'expo.out', className = '' }: CountProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const format = (n: number) => `${prefix}${n.toLocaleString('ja-JP', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`;

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        el.textContent = format(value);
        return;
      }
      const state = { n: 0 };
      el.textContent = format(0);
      gsap.to(state, {
        n: value,
        duration,
        delay,
        ease,
        onUpdate: () => {
          el.textContent = format(state.n);
        },
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      });
    },
    { dependencies: [value, decimals, prefix, suffix, duration, delay, ease], revertOnUpdate: true },
  );

  return (
    <span className={`tabular-nums ${className}`} aria-label={format(value)}>
      <span ref={ref} aria-hidden>
        {format(value)}
      </span>
    </span>
  );
}

const STATS = [
  { value: 1280, suffix: '社', label: '導入企業数' },
  { value: 98.6, decimals: 1, suffix: '%', label: '顧客満足度' },
  { value: 3.2, decimals: 1, prefix: '×', label: '平均CV改善率' },
  { value: 24, suffix: 'h', label: 'サポート対応' },
];

export function StatsSection({ duration = 2, stagger = 0.15, ease = 'expo.out' }: { duration?: number; stagger?: number; ease?: string }) {
  return (
    <section className="mx-auto grid max-w-5xl grid-cols-2 gap-10 px-6 py-24 md:grid-cols-4">
      {STATS.map((s, i) => (
        <div key={s.label} className="border-t border-slate-200 pt-6 dark:border-slate-800">
          <CountUp {...s} duration={duration} delay={i * stagger} ease={ease} className="block text-4xl font-black tracking-tight text-slate-900 sm:text-5xl dark:text-white" />
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{s.label}</p>
        </div>
      ))}
    </section>
  );
}

export default function App() {
  return (
    <main className="min-h-screen bg-white dark:bg-slate-950">
      <section className="flex h-[70vh] flex-col justify-end px-8 pb-10 sm:px-16">
        <p className="text-xs font-semibold tracking-[0.3em] text-indigo-600 dark:text-indigo-400">NUMBER COUNT UP</p>
        <h1 className="mt-3 text-4xl font-black text-slate-900 sm:text-6xl dark:text-white">数字で、信頼を伝える。</h1>
        <p className="mt-3 text-sm text-slate-500">↓ スクロールすると数字がカウントアップします</p>
      </section>
      <StatsSection />
      <div className="h-[40vh]" />
    </main>
  );
}
