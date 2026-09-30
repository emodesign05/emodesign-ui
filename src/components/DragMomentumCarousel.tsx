import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { animate, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform } from 'framer-motion';
import { ArrowLeft, ArrowRight, Hand } from 'lucide-react';

/* =========================================================
 * ドラッグスクロール＋慣性（Drag Scroll Carousel with Momentum）
 * - マウス／タッチでつかんで横に投げると、慣性で滑ってからゆっくり止まる
 * - 端では弾性（ゴムのような戻り）
 * - ドラッグ中はカードのクリックを無効化（誤タップ防止）
 * - 前後ボタン・キーボード（← →）でも1枚ずつ移動
 * - 下部の進捗バーがスクロール位置に連動
 * ========================================================= */

const SLIDES = [
  { title: 'Kyoto', sub: '静けさの設計', img: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=900&q=80' },
  { title: 'Reykjavík', sub: '光と余白', img: 'https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=900&q=80' },
  { title: 'Lisbon', sub: '色彩のリズム', img: 'https://images.unsplash.com/photo-1513735492246-483525079686?w=900&q=80' },
  { title: 'Marrakech', sub: '素材の手触り', img: 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=900&q=80' },
  { title: 'Copenhagen', sub: '機能と美しさ', img: 'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=900&q=80' },
  { title: 'Santorini', sub: '白と青の対比', img: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=900&q=80' },
];

const CARD_W = 320;
const GAP = 24;

export function DragMomentumCarousel({ cardW = CARD_W, gap = GAP, elastic = 0.12, power = 0.35, timeConstant = 320 }: { cardW?: number; gap?: number; elastic?: number; power?: number; timeConstant?: number }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const [minX, setMinX] = useState(0);
  const minXMv = useMotionValue(0);
  const dragging = useRef(false);

  // 移動可能な範囲（右端）をビューポート幅から算出
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const update = () => {
      const trackW = SLIDES.length * cardW + (SLIDES.length - 1) * gap;
      const m = Math.min(0, el.clientWidth - trackW);
      setMinX(m);
      minXMv.set(m);
    };
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [minXMv, cardW, gap]);

  // 両方の MotionValue から進捗を算出（再レンダー不要）
  const progress = useTransform(() => (minXMv.get() === 0 ? 0 : x.get() / minXMv.get()));
  const [index, setIndex] = useState(0);
  useMotionValueEvent(x, 'change', (v) => {
    const i = Math.round(-v / (cardW + gap));
    setIndex((prev) => (prev === i ? prev : Math.max(0, Math.min(SLIDES.length - 1, i))));
  });

  const goTo = (i: number) => {
    const target = Math.max(minX, Math.min(0, -i * (cardW + gap)));
    if (reduceMotion) x.set(target);
    else animate(x, target, { type: 'spring', stiffness: 200, damping: 30 });
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      goTo(index + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goTo(index - 1);
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-neutral-100 py-20 text-neutral-900 dark:bg-neutral-950 dark:text-white">
      <div className="mx-auto flex max-w-6xl items-end justify-between gap-6 px-6">
        <div>
          <p className="text-xs font-semibold tracking-[0.3em] text-indigo-600 dark:text-indigo-400">DRAG CAROUSEL</p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">つかんで、投げる。</h1>
          <p className="mt-3 flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
            <Hand className="h-4 w-4" aria-hidden /> ドラッグで慣性スクロール ／ ← → キーでも移動
          </p>
        </div>
        <div className="flex gap-2">
          {[
            { label: '前へ', icon: ArrowLeft, to: index - 1, disabled: index === 0 },
            { label: '次へ', icon: ArrowRight, to: index + 1, disabled: index >= SLIDES.length - 1 },
          ].map(({ label, icon: Icon, to, disabled }) => (
            <button
              key={label}
              type="button"
              aria-label={label}
              disabled={disabled}
              onClick={() => goTo(to)}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-neutral-300 transition hover:bg-neutral-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-current dark:border-neutral-700 dark:hover:bg-white dark:hover:text-neutral-900"
            >
              <Icon className="h-5 w-5" />
            </button>
          ))}
        </div>
      </div>

      <div
        ref={viewportRef}
        tabIndex={0}
        role="region"
        aria-roledescription="カルーセル"
        aria-label="旅の記録"
        onKeyDown={onKeyDown}
        className="mx-auto mt-10 max-w-6xl px-6 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        <motion.ul
          drag="x"
          style={{ x }}
          dragConstraints={{ left: minX, right: 0 }}
          dragElastic={elastic}
          dragTransition={{ power, timeConstant, bounceStiffness: 260, bounceDamping: 30 }}
          onDragStart={() => (dragging.current = true)}
          onDragEnd={() => setTimeout(() => (dragging.current = false), 0)}
          className="flex cursor-grab touch-pan-y select-none active:cursor-grabbing"
        >
          {SLIDES.map((s, i) => (
            <li key={s.title} className="shrink-0" style={{ width: cardW, marginRight: i === SLIDES.length - 1 ? 0 : gap }} aria-label={`${i + 1} / ${SLIDES.length}`}>
              <a
                href="#"
                draggable={false}
                onClick={(e) => dragging.current && e.preventDefault()}
                className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-neutral-300 dark:bg-neutral-800">
                  <img src={s.img} alt="" draggable={false} className="pointer-events-none h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="mt-4 flex items-baseline justify-between">
                  <h2 className="text-xl font-bold">{s.title}</h2>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">{s.sub}</span>
                </div>
              </a>
            </li>
          ))}
        </motion.ul>
      </div>

      {/* 進捗バー */}
      <div className="mx-auto mt-10 max-w-6xl px-6">
        <div className="h-0.5 w-full bg-neutral-300 dark:bg-neutral-800">
          <motion.div style={{ scaleX: progress }} className="h-full origin-left bg-indigo-600 dark:bg-indigo-400" />
        </div>
        <p className="mt-3 text-xs tabular-nums text-neutral-500" aria-live="polite">
          {String(index + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
        </p>
      </div>
    </main>
  );
}


export default function App() {
  return <DragMomentumCarousel />;
}
