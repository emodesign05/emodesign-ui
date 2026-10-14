import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, PointerEvent as ReactPointerEvent } from 'react';
import {
  animate,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
} from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/* =========================================================
 * ビフォーアフタースライダー（Before / After Slider）
 * - 2枚の画像を重ね、上の画像（Before）を clip-path: inset() で切り抜いて比較する
 *   位置は framer-motion の MotionValue で持つので、ドラッグ中も React の再描画なしでなめらかに動く
 * - 仕組み：コンテナ上の pointerdown → setPointerCapture → pointermove で位置を更新（マウス・タッチ・ペン共通）
 *   クリックした位置へはスプリングで「スッ」と移動し、ドラッグ中は指にぴったり追従する
 * - direction で横（左右比較）/ 縦（上下比較）を切り替え。ハンドルの見た目は handleStyle で 3 種類
 * - 初回表示（画面に入った時）につまみが少し左右に揺れて「動かせる」ことを伝える（hint）
 * - アクセシビリティ：つまみは role="slider"（aria-valuenow / aria-orientation）
 *   矢印キーで 1%、Shift+矢印 / PageUp・PageDown で 10%、Home / End で端まで
 * - prefers-reduced-motion 時はヒントの揺れとスプリング移動をやめ、即時に位置を変える
 * ========================================================= */

type Props = {
  /** つまみの初期位置（0〜100 %） */
  initial?: number;
  /** 比較の方向（horizontal = 左右 / vertical = 上下） */
  direction?: 'horizontal' | 'vertical';
  /** ハンドルの見た目（circle = 丸ボタン / line = 細線＋小さなつまみ / pill = 縦長カプセル） */
  handleStyle?: 'circle' | 'line' | 'pill';
  /** 初回表示でつまみを左右に揺らしてヒントを出す */
  hint?: boolean;
  /** Before / After のラベルを表示する */
  showLabels?: boolean;
  /** Before 側の画像 URL */
  beforeSrc?: string;
  /** After 側の画像 URL */
  afterSrc?: string;
  /** Before 側に掛ける CSS filter（同じ写真で「補正前」を表現する時に使う） */
  beforeFilter?: string;
  /** 画像の縦横比（CSS aspect-ratio） */
  aspect?: string;
};

const PHOTO = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1800&q=80';

const clamp = (n: number) => Math.min(100, Math.max(0, n));

export function BeforeAfterSlider({
  initial = 50,
  direction = 'horizontal',
  handleStyle = 'circle',
  hint = true,
  showLabels = true,
  beforeSrc = PHOTO,
  afterSrc = PHOTO,
  beforeFilter = 'grayscale(1) contrast(0.85) brightness(0.9)',
  aspect = '16 / 10',
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const reduce = useReducedMotion();
  const vertical = direction === 'vertical';

  const pos = useMotionValue(clamp(initial));
  const [value, setValue] = useState(Math.round(clamp(initial)));
  const [dragging, setDragging] = useState(false);
  useMotionValueEvent(pos, 'change', (v) => setValue(Math.round(v)));

  // Before（上の層）は「つまみより手前側」だけ見せる
  const clip = useTransform(pos, (p) => (vertical ? `inset(0 0 ${100 - p}% 0)` : `inset(0 ${100 - p}% 0 0)`));
  const handlePos = useMotionTemplate`${pos}%`;
  // ラベルはつまみが近づくとフェード
  const beforeOpacity = useTransform(pos, [4, 18], [0, 1]);
  const afterOpacity = useTransform(pos, [82, 96], [1, 0]);

  // 初回表示のヒント（画面に入ったら一度だけ）
  const inView = useInView(rootRef, { once: true, amount: 0.5 });
  useEffect(() => {
    if (!inView || !hint || reduce) return;
    const base = pos.get();
    const ctrl = animate(pos, [base, clamp(base - 9), clamp(base + 7), clamp(base - 3), base], {
      duration: 1.8,
      delay: 0.4,
      ease: [0.45, 0, 0.2, 1],
      times: [0, 0.3, 0.62, 0.85, 1],
    });
    return () => ctrl.stop();
  }, [inView, hint, reduce, pos]);

  const moveTo = (target: number, smooth: boolean) => {
    const t = clamp(target);
    if (!smooth || reduce) {
      pos.stop();
      pos.set(t);
      return;
    }
    animate(pos, t, { type: 'spring', stiffness: 420, damping: 42 });
  };

  const fromPointer = (e: ReactPointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return vertical ? ((e.clientY - r.top) / r.height) * 100 : ((e.clientX - r.left) / r.width) * 100;
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    draggingRef.current = true;
    setDragging(true);
    moveTo(fromPointer(e), true);
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    moveTo(fromPointer(e), false);
  };
  const endDrag = () => {
    draggingRef.current = false;
    setDragging(false);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const big = e.shiftKey ? 10 : 1;
    const cur = pos.get();
    const map: Record<string, number> = {
      ArrowLeft: cur - big,
      ArrowDown: vertical ? cur + big : cur - big,
      ArrowRight: cur + big,
      ArrowUp: vertical ? cur - big : cur + big,
      PageDown: cur - 10,
      PageUp: cur + 10,
      Home: 0,
      End: 100,
    };
    if (!(e.key in map)) return;
    e.preventDefault();
    moveTo(map[e.key], true);
  };

  const lineCls = vertical ? 'inset-x-0 h-0.5 -translate-y-1/2' : 'inset-y-0 w-0.5 -translate-x-1/2';

  return (
    <div
      ref={rootRef}
      className={`group relative isolate w-full touch-none select-none overflow-hidden rounded-3xl bg-gradient-to-br from-slate-300 via-slate-200 to-slate-400 shadow-2xl shadow-slate-900/20 ring-1 ring-black/5 dark:from-slate-800 dark:via-slate-700 dark:to-slate-900 ${
        vertical ? 'cursor-row-resize' : 'cursor-col-resize'
      }`}
      style={{ aspectRatio: aspect }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      {/* After（下の層） */}
      <img src={afterSrc} alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover" />

      {/* Before（上の層・clip-path で切り抜き） */}
      <motion.div className="absolute inset-0 bg-gradient-to-br from-slate-500 to-slate-700" style={{ clipPath: clip }}>
        <img
          src={beforeSrc}
          alt=""
          draggable={false}
          className="h-full w-full object-cover"
          style={{ filter: beforeFilter }}
        />
      </motion.div>

      {showLabels && (
        <>
          <motion.span
            style={{ opacity: beforeOpacity }}
            className={`pointer-events-none absolute rounded-full bg-black/45 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-white backdrop-blur-md ${
              vertical ? 'left-4 top-4' : 'left-4 top-4 sm:left-6 sm:top-6'
            }`}
          >
            BEFORE
          </motion.span>
          <motion.span
            style={{ opacity: afterOpacity }}
            className={`pointer-events-none absolute rounded-full bg-white/80 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-slate-900 backdrop-blur-md ${
              vertical ? 'bottom-4 left-4' : 'right-4 top-4 sm:right-6 sm:top-6'
            }`}
          >
            AFTER
          </motion.span>
        </>
      )}

      {/* 区切り線＋つまみ */}
      <motion.div
        className={`pointer-events-none absolute ${lineCls} bg-white/90 shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_0_24px_rgba(0,0,0,0.35)]`}
        style={vertical ? { top: handlePos } : { left: handlePos }}
      />
      <motion.div
        role="slider"
        tabIndex={0}
        aria-label="比較位置（Before と After の境目）"
        aria-orientation={vertical ? 'vertical' : 'horizontal'}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        aria-valuetext={`Before ${value}% / After ${100 - value}%`}
        onKeyDown={onKeyDown}
        data-handle
        className={`absolute grid place-items-center outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-500 ${
          vertical ? 'left-1/2 -translate-x-1/2 -translate-y-1/2' : 'top-1/2 -translate-x-1/2 -translate-y-1/2'
        } ${
          handleStyle === 'circle'
            ? 'size-12 rounded-full bg-white/95 text-slate-900 shadow-xl shadow-black/30 sm:size-14'
            : handleStyle === 'pill'
              ? `${vertical ? 'h-7 w-16' : 'h-16 w-7'} rounded-full bg-white text-slate-900 shadow-xl shadow-black/30`
              : 'size-4 rounded-full bg-white shadow-lg ring-4 ring-white/30'
        } transition-[scale,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          dragging ? 'scale-90' : 'group-hover:scale-110'
        }`}
        style={vertical ? { top: handlePos } : { left: handlePos }}
      >
        {handleStyle !== 'line' && (
          <span className={`flex items-center ${vertical ? 'rotate-90' : ''} ${handleStyle === 'pill' ? 'flex-col gap-0' : ''}`}>
            {handleStyle === 'circle' ? (
              <>
                <ChevronLeft className="size-4 -mr-0.5" aria-hidden />
                <ChevronRight className="size-4 -ml-0.5" aria-hidden />
              </>
            ) : (
              <span className="flex gap-1" aria-hidden>
                <span className="h-5 w-0.5 rounded bg-slate-400" />
                <span className="h-5 w-0.5 rounded bg-slate-400" />
              </span>
            )}
          </span>
        )}
      </motion.div>
    </div>
  );
}

export default function App() {
  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_#e0e7ff,_#f8fafc_60%)] px-4 py-16 text-slate-900 sm:px-8 dark:bg-[radial-gradient(ellipse_at_top,_#1e1b4b,_#020617_60%)] dark:text-white">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-semibold tracking-[0.3em] text-indigo-500">RETOUCH CASE STUDY</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">色調補正で、写真の空気感まで変える。</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-300">
          つまみを左右にドラッグして、補正前と補正後を比べてみてください。キーボードでは矢印キーで操作できます。
        </p>
        <div className="mt-10">
          <BeforeAfterSlider />
        </div>
        <div className="mt-6 grid gap-4 text-sm text-slate-600 sm:grid-cols-3 dark:text-slate-300">
          {[
            ['露出', '+0.4 EV'],
            ['彩度', '+18'],
            ['トーンカーブ', 'S 字（弱）'],
          ].map(([k, v]) => (
            <div key={k} className="rounded-2xl bg-white/70 p-4 ring-1 ring-black/5 backdrop-blur dark:bg-white/5 dark:ring-white/10">
              <p className="text-xs text-slate-500 dark:text-slate-400">{k}</p>
              <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{v}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
