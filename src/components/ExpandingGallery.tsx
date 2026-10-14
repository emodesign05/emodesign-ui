import { useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

/* =========================================================
 * 横に広がる画像アコーディオン（Expanding Panels Gallery）
 * - 縦長のパネルが横に並び、ホバー / フォーカス / タップしたパネルが横に広がって見出しと説明が出る
 * - 仕組み：各パネルは flex: <grow> 1 0。アクティブなパネルだけ flex-grow を大きくし、
 *   transition-[flex-grow] でなめらかに補間（幅を JS で計算しないので、どの画面幅でも崩れない）
 * - 文字は広がり始めてから少し遅れて、下からマスクで立ち上がる（framer-motion の stagger）
 * - 閉じているパネルには縦書きの見出し＋番号。画像はアクティブ時にわずかにズームアウトして奥行きを出す
 * - スマホ（640px 未満）は縦積み。同じ仕組みで高さ方向に広がる
 * - アクセシビリティ：各パネルは button（aria-expanded / aria-controls）。左右（上下）の矢印キーで隣のパネルへ移動
 * - trigger="click" にするとホバーでは開かず、クリック / タップ / Enter でのみ開く
 * - prefers-reduced-motion 時は広がる動きとテキストの立ち上がりをなくし、即時に切り替え
 * ========================================================= */

type Props = {
  /** 開いたパネルの広がり（閉じたパネルを 1 としたときの比率） */
  expandRatio?: number;
  /** 広がるアニメーションの時間（秒） */
  duration?: number;
  /** 開くきっかけ（hover = ホバー/フォーカス/タップ、click = クリック/タップのみ） */
  trigger?: 'hover' | 'click';
  /** ギャラリーの高さ（PC 表示時、px） */
  height?: number;
  /** パネル同士の隙間（px） */
  gap?: number;
  /** 最初に開いておくパネル（0 始まり） */
  defaultIndex?: number;
};

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=80`;

const PANELS = [
  { title: '山並みの朝', en: 'Morning Ridge', body: '霧が晴れる数分間だけの光。稜線の重なりを、そのまま余白として使う。', src: img('photo-1506744038136-46273834b3fb'), tint: 'from-sky-700 to-indigo-900' },
  { title: '湖畔の静けさ', en: 'Still Lake', body: '水面に映る景色で上下対称の構図に。ブランドの「落ち着き」を表す一枚。', src: img('photo-1501785888041-af3ef285b470'), tint: 'from-emerald-700 to-teal-900' },
  { title: '海辺の記憶', en: 'Coastline', body: '波打ち際のやわらかな階調。夏のキャンペーンビジュアルに採用。', src: img('photo-1507525428034-b723cf961d3e'), tint: 'from-cyan-600 to-blue-900' },
  { title: '森の小径', en: 'Forest Path', body: '木漏れ日の粒を残すため、ハイライトを抑えて現像。', src: img('photo-1441974231531-c6227db76b6e'), tint: 'from-lime-700 to-emerald-950' },
  { title: '星降る夜', en: 'Starfield', body: '長時間露光で捉えた夜空。暗部の黒を締めて、星の数を際立たせる。', src: img('photo-1519681393784-d120267933ba'), tint: 'from-indigo-800 to-slate-950' },
];

const EASE = [0.22, 1, 0.36, 1] as const;
// 縦書きは和文フォントを明示（フォールバック任せだと環境によって字が重なることがある）
const VERTICAL_FONT = '"Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", "Noto Sans CJK JP", "Yu Gothic", Meiryo, sans-serif';

export function ExpandingGallery({
  expandRatio = 5,
  duration = 0.8,
  trigger = 'hover',
  height = 560,
  gap = 12,
  defaultIndex = 0,
}: Props) {
  const [active, setActive] = useState(Math.min(Math.max(0, defaultIndex), PANELS.length - 1));
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const reduce = useReducedMotion();
  const dur = reduce ? 0 : duration;

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const next = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: PANELS.length - 1 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    const n = (next + PANELS.length) % PANELS.length;
    btnRefs.current[n]?.focus();
    setActive(n);
  };

  return (
    <div
      className="flex h-[78vh] max-h-[680px] min-h-[460px] w-full flex-col sm:h-[var(--h)] sm:max-h-none sm:min-h-0 sm:flex-row"
      style={{ gap, ['--h' as string]: `${height}px` }}
      role="group"
      aria-label="作品ギャラリー"
    >
      {PANELS.map((p, i) => {
        const isActive = i === active;
        return (
          <button
            key={p.title}
            ref={(el) => {
              btnRefs.current[i] = el;
            }}
            type="button"
            aria-expanded={isActive}
            aria-controls={`eg-panel-${i}`}
            onClick={() => setActive(i)}
            onFocus={() => {
              if (trigger === 'hover') setActive(i);
            }}
            onPointerEnter={(e) => {
              if (trigger === 'hover' && e.pointerType === 'mouse') setActive(i);
            }}
            onKeyDown={(e) => onKeyDown(e, i)}
            data-panel={i}
            className={`group relative min-h-0 min-w-0 basis-0 overflow-hidden rounded-[22px] bg-gradient-to-br ${p.tint} text-left text-white outline-none ring-offset-2 ring-offset-white transition-[flex-grow,box-shadow] focus-visible:ring-2 focus-visible:ring-indigo-400 dark:ring-offset-slate-950 ${
              isActive ? 'shadow-2xl shadow-slate-900/30' : 'shadow-md'
            }`}
            style={{
              flexGrow: isActive ? expandRatio : 1,
              transitionDuration: `${dur}s`,
              transitionTimingFunction: `cubic-bezier(${EASE.join(',')})`,
            }}
          >
            <img
              src={p.src}
              alt=""
              draggable={false}
              className="absolute inset-0 h-full w-full object-cover transition-[scale,filter] ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{
                scale: isActive ? 1 : 1.18,
                filter: isActive ? 'saturate(1) brightness(1)' : 'saturate(0.6) brightness(0.75)',
                transitionDuration: `${dur * 1.4}s`,
              }}
            />
            <span
              aria-hidden
              className={`absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent transition-opacity ${isActive ? 'opacity-100' : 'opacity-60'}`}
              style={{ transitionDuration: `${dur}s` }}
            />

            {/* 閉じている時：番号＋縦書き見出し（スマホは横書き） */}
            <span
              aria-hidden={isActive}
              className={`absolute flex items-center gap-3 transition-opacity sm:bottom-6 sm:left-1/2 sm:-translate-x-1/2 sm:[writing-mode:vertical-rl] max-sm:left-5 max-sm:top-1/2 max-sm:-translate-y-1/2 ${
                isActive ? 'opacity-0' : 'opacity-100 delay-200'
              }`}
              style={{ transitionDuration: `${dur * 0.5}s`, fontFamily: VERTICAL_FONT }}
            >
              <span className="font-mono text-[11px] tracking-widest text-white/70">{String(i + 1).padStart(2, '0')}</span>
              <span className="whitespace-nowrap text-sm font-semibold tracking-[0.2em]">{p.title}</span>
            </span>

            {/* 開いた時の本文 */}
            <span id={`eg-panel-${i}`} className="absolute inset-x-0 bottom-0 block p-5 sm:p-8">
              <AnimatePresence>
                {isActive && (
                  <motion.span
                    className="block max-w-md"
                    initial="hide"
                    animate="show"
                    exit="hide"
                    variants={{
                      show: { transition: { staggerChildren: reduce ? 0 : 0.07, delayChildren: reduce ? 0 : dur * 0.45 } },
                      hide: { transition: { staggerChildren: 0 } },
                    }}
                  >
                    {[
                      <span key="en" className="font-mono text-[11px] tracking-[0.3em] text-white/70">
                        {String(i + 1).padStart(2, '0')} — {p.en.toUpperCase()}
                      </span>,
                      <span key="t" className="mt-2 flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-4xl">
                        {p.title}
                        <ArrowUpRight className="size-5 opacity-70 sm:size-7" aria-hidden />
                      </span>,
                      <span key="b" className="mt-3 text-sm leading-relaxed text-white/85 max-sm:line-clamp-2 sm:text-base">
                        {p.body}
                      </span>,
                    ].map((child) => (
                      <span key={child.key} className="block overflow-hidden">
                        <motion.span
                          className="block"
                          variants={{
                            hide: { y: reduce ? 0 : '110%', opacity: 0, transition: { duration: reduce ? 0 : 0.2 } },
                            show: { y: '0%', opacity: 1, transition: { duration: reduce ? 0 : 0.7, ease: EASE } },
                          }}
                        >
                          {child}
                        </motion.span>
                      </span>
                    ))}
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default function App() {
  return (
    <main className="min-h-screen bg-stone-100 px-4 py-14 text-stone-900 sm:px-10 dark:bg-stone-950 dark:text-stone-100">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-xs tracking-[0.3em] text-stone-500">SELECTED WORKS / 2026</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">風景を、ブランドの言葉に。</h1>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-stone-600 dark:text-stone-400">
            パネルにカーソルを合わせる（スマホはタップ）と広がります。矢印キーでも切り替えられます。
          </p>
        </div>
        <ExpandingGallery />
      </div>
    </main>
  );
}
