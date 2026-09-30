import { useRef, useState } from 'react';
import gsap from 'gsap';
import { Flip } from 'gsap/Flip';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(Flip, useGSAP);

/* =========================================================
 * 並び替えアニメーション（Layout / FLIP Filter Grid）
 * - カテゴリで絞り込むと、残るカードは新しい位置へなめらかに移動し、消えるカードは縮んで消え、現れるカードは膨らんで出る
 * - GSAP Flip プラグイン：「変更前の位置を記録（getState）→ React が並びを更新 → 差分をアニメーション（Flip.from）」
 *   レイアウトは CSS Grid のまま。位置計算を自分で書く必要がない
 * - ボタンの位置は固定。グリッドの高さも一緒に補間するので、下のコンテンツが急に動かない
 * - 絞り込みボタンは aria-pressed で現在の選択を伝える
 * - prefers-reduced-motion 時はアニメーションなしで即時切り替え
 * ========================================================= */

type Cat = 'all' | 'web' | 'brand' | 'motion';

const ITEMS: { id: number; title: string; cat: Exclude<Cat, 'all'>; color: string; tall?: boolean }[] = [
  { id: 1, title: 'Aurora', cat: 'web', color: 'from-indigo-500 to-sky-400', tall: true },
  { id: 2, title: 'Kumo', cat: 'brand', color: 'from-rose-500 to-orange-400' },
  { id: 3, title: 'Mori', cat: 'motion', color: 'from-emerald-500 to-lime-400' },
  { id: 4, title: 'Nami', cat: 'web', color: 'from-fuchsia-500 to-violet-500' },
  { id: 5, title: 'Hoshi', cat: 'brand', color: 'from-amber-400 to-yellow-300', tall: true },
  { id: 6, title: 'Sora', cat: 'motion', color: 'from-cyan-500 to-teal-400' },
  { id: 7, title: 'Tsuki', cat: 'web', color: 'from-slate-600 to-slate-400' },
  { id: 8, title: 'Kaze', cat: 'motion', color: 'from-pink-500 to-rose-300' },
];

const FILTERS: { key: Cat; label: string }[] = [
  { key: 'all', label: 'すべて' },
  { key: 'web', label: 'Web' },
  { key: 'brand', label: 'Branding' },
  { key: 'motion', label: 'Motion' },
];

type Props = {
  /** 移動にかける時間（秒） */
  duration?: number;
  /** カードごとの時間差（秒） */
  stagger?: number;
  /** 移動のイージング */
  ease?: string;
};

export function FlipFilterGrid({ duration = 0.7, stagger = 0.03, ease = 'power3.inOut' }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<Cat>('all');
  // 並びを変える直前の状態（位置・サイズ）
  const flipState = useRef<Flip.FlipState | null>(null);
  // 並び替え前のグリッドの高さ（高さも一緒になめらかに変えて、下のコンテンツや画面の位置がガタつかないようにする）
  const prevHeight = useRef(0);

  // filter が変わって DOM が更新された直後に、記録しておいた位置からアニメーション
  useGSAP(
    () => {
      const state = flipState.current;
      if (!state) return;
      flipState.current = null;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const grid = rootRef.current?.querySelector<HTMLElement>('[data-grid]');
      if (grid && !reduce) {
        const next = grid.offsetHeight;
        gsap.fromTo(grid, { height: prevHeight.current }, { height: next, duration, ease, clearProps: 'height' });
      }
      Flip.from(state, {
        targets: '[data-flip]',
        duration: reduce ? 0 : duration,
        ease,
        stagger,
        absolute: true, // 消えるカードを absolute にしてレイアウトを崩さない
        onEnter: (els) => gsap.fromTo(els, { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: reduce ? 0 : duration * 0.8, delay: reduce ? 0 : duration * 0.3 }),
        onLeave: (els) => gsap.to(els, { autoAlpha: 0, scale: 0.6, duration: reduce ? 0 : duration * 0.6 }),
      });
    },
    { scope: rootRef, dependencies: [filter] },
  );

  const choose = (key: Cat) => {
    if (key === filter) return;
    // 変更前の状態を記録してから、React の state を更新
    flipState.current = Flip.getState(rootRef.current?.querySelectorAll('[data-flip]') ?? []);
    prevHeight.current = rootRef.current?.querySelector<HTMLElement>('[data-grid]')?.offsetHeight ?? 0;
    setFilter(key);
  };

  const visible = ITEMS.filter((i) => filter === 'all' || i.cat === filter);

  return (
    <div ref={rootRef} className="mx-auto w-full max-w-5xl">
      <div role="group" aria-label="カテゴリで絞り込み" className="relative z-10 mb-8 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            aria-pressed={filter === f.key}
            onClick={() => choose(f.key)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              filter === f.key ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <ul data-grid className="relative grid auto-rows-[160px] grid-cols-2 gap-4 overflow-hidden md:grid-cols-4">
        {visible.map((item) => (
          <li key={item.id} data-flip data-flip-id={item.id} className={`overflow-hidden rounded-2xl bg-gradient-to-br ${item.color} ${item.tall ? 'row-span-2' : ''}`}>
            <div className="flex h-full flex-col justify-end p-5 text-white">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80">{item.cat}</p>
              <p className="text-xl font-bold">{item.title}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function App() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-20 dark:bg-slate-950">
      <div className="mx-auto mb-10 max-w-5xl">
        <p className="text-xs font-semibold tracking-[0.3em] text-indigo-600 dark:text-indigo-400">FLIP FILTER GRID</p>
        <h1 className="mt-3 text-4xl font-black text-slate-900 sm:text-5xl dark:text-white">絞り込むと、並び直す。</h1>
      </div>
      <FlipFilterGrid />
    </main>
  );
}
