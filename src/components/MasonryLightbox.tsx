import { useCallback, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';

/* =========================================================
 * ライトボックス＋石積みギャラリー（Masonry Gallery + Lightbox）
 * - CSS columns による石積み（Masonry）レイアウト。画像ごとに縦横比を持たせ、読み込み前からレイアウトが確定する
 * - スクロールで画面に入った画像から順に、下からマスクを外すように表示（framer-motion whileInView・一度だけ）
 * - クリックで拡大：framer-motion の layoutId で、一覧のサムネイルがそのままの形で画面中央へ伸びる（共有要素トランジション）
 *   閉じると元の位置へ戻る。拡大中に前後送りした場合は横スライドで切り替え、閉じる時はフェードで消える
 * - 操作：← → キー / 前後ボタン / スワイプ（drag="x"）で前後送り、Esc・背景クリック・× で閉じる
 * - アクセシビリティ：role="dialog" aria-modal、開いたら × ボタンへフォーカス、Tab はダイアログ内でループ（フォーカストラップ）
 *   閉じたら開いたサムネイルへフォーカスを戻す。背面のスクロールはロック
 * - prefers-reduced-motion 時は出現・拡大・スライドの動きをなくし、フェードのみ
 * ========================================================= */

type Props = {
  /** PC 表示時の最大列数（2〜4。スマホは 1 列、タブレットは 2 列） */
  columns?: 2 | 3 | 4;
  /** 画像同士の間隔（px） */
  gap?: number;
  /** 表示時の時間差（秒） */
  stagger?: number;
  /** 最後の次は最初へ戻る（ループ） */
  loop?: boolean;
  /** 一覧にキャプションを重ねて表示する */
  captions?: boolean;
};

type Item = { id: string; title: string; place: string; w: number; h: number; tint: string };

const ITEMS: Item[] = [
  { id: 'photo-1506744038136-46273834b3fb', title: '夜明けの湖畔', place: 'LAKE', w: 4, h: 5, tint: 'from-sky-300 to-indigo-400' },
  { id: 'photo-1501785888041-af3ef285b470', title: 'エメラルドの湖', place: 'LAKE', w: 3, h: 2, tint: 'from-emerald-300 to-teal-500' },
  { id: 'photo-1500530855697-b586d89ba3ee', title: '赤い岩山を抜ける道', place: 'ROAD', w: 1, h: 1, tint: 'from-amber-300 to-rose-400' },
  { id: 'photo-1519681393784-d120267933ba', title: '星空と雪の稜線', place: 'NIGHT', w: 2, h: 3, tint: 'from-indigo-400 to-slate-700' },
  { id: 'photo-1507525428034-b723cf961d3e', title: '夕陽の渚', place: 'BEACH', w: 3, h: 2, tint: 'from-cyan-300 to-sky-500' },
  { id: 'photo-1441974231531-c6227db76b6e', title: '木漏れ日の森', place: 'FOREST', w: 4, h: 5, tint: 'from-lime-300 to-emerald-600' },
  { id: 'photo-1470071459604-3b5ec3a7fe05', title: '雲海と断崖', place: 'CLIFF', w: 3, h: 4, tint: 'from-slate-300 to-slate-500' },
  { id: 'photo-1472214103451-9374bd1c798e', title: '夕暮れの丘', place: 'HILL', w: 16, h: 10, tint: 'from-green-300 to-lime-500' },
  { id: 'photo-1500534314209-a25ddb2bd429', title: '重なる山並み', place: 'MOUNTAIN', w: 1, h: 1, tint: 'from-orange-300 to-amber-500' },
  { id: 'photo-1513622470522-26c3c8a854bc', title: '運河沿いの色彩', place: 'TOWN', w: 2, h: 3, tint: 'from-violet-300 to-fuchsia-500' },
  { id: 'photo-1504829857797-ddff29c27927', title: '黒い砂浜と岩山', place: 'COAST', w: 3, h: 2, tint: 'from-rose-300 to-orange-500' },
  { id: 'photo-1578469645742-46cae010e5d4', title: '高台の古寺', place: 'KYOTO', w: 4, h: 5, tint: 'from-red-300 to-amber-600' },
];

const src = (id: string, w: number) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;
const COLS: Record<number, string> = {
  2: 'columns-1 sm:columns-2',
  3: 'columns-1 sm:columns-2 lg:columns-3',
  4: 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4',
};
const EASE = [0.22, 1, 0.36, 1] as const;
const FADE = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.3 } };

export function MasonryLightbox({ columns = 3, gap = 16, stagger = 0.08, loop = true, captions = true }: Props) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState<number | null>(null);
  // layoutId でつなぐ対象（開いた画像）。前後送りしたら null にして「戻り」のモーフを無効化
  const [linked, setLinked] = useState<string | null>(null);
  const [dir, setDir] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const lastOpenedRef = useRef<string | null>(null);
  const isOpenRef = useRef(false);
  // 戻りのモーフ中だけ、そのサムネイルを他の画像より手前に出す
  const [raised, setRaised] = useState<string | null>(null);

  const open = (i: number) => {
    lastOpenedRef.current = ITEMS[i].id;
    isOpenRef.current = true;
    setLinked(ITEMS[i].id);
    setRaised(ITEMS[i].id);
    setDir(0);
    setIndex(i);
  };
  const close = useCallback(() => {
    isOpenRef.current = false;
    setIndex(null);
  }, []);
  const go = useCallback(
    (d: number) => {
      setIndex((cur) => {
        if (cur === null) return cur;
        const n = cur + d;
        if (!loop && (n < 0 || n >= ITEMS.length)) return cur;
        return (n + ITEMS.length) % ITEMS.length;
      });
      setDir(d);
      setLinked(null);
    },
    [loop],
  );

  const isOpen = index !== null;

  // 背面スクロールのロック・開いたら × へフォーカス
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const t = window.setTimeout(() => closeRef.current?.focus({ preventScroll: true }), 30);
    return () => {
      document.body.style.overflow = prev;
      window.clearTimeout(t);
    };
  }, [isOpen]);

  const onDialogKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'ArrowRight') {
      go(1);
    } else if (e.key === 'ArrowLeft') {
      go(-1);
    } else if (e.key === 'Tab') {
      const nodes = dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled])');
      if (!nodes || nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const swipe = info.offset.x + info.velocity.x * 0.2;
    if (swipe < -80) go(1);
    else if (swipe > 80) go(-1);
  };

  const current = index !== null ? ITEMS[index] : null;
  // 画面に収まる最大幅（縦長の画像は高さ基準で縮める）
  const stageWidth = current ? `min(100%, calc((100dvh - 9rem) * ${current.w / current.h}), 1100px)` : undefined;
  const canPrev = loop || (index ?? 0) > 0;
  const canNext = loop || (index ?? 0) < ITEMS.length - 1;

  return (
    <LayoutGroup>
      <ul className={`${COLS[columns] ?? COLS[3]}`} style={{ columnGap: gap }}>
        {ITEMS.map((item, i) => (
          <motion.li
            key={item.id}
            className="relative break-inside-avoid"
            style={{ marginBottom: gap, zIndex: raised === item.id ? 30 : undefined }}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 56, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '0px 0px -8% 0px' }}
            transition={{ duration: reduce ? 0.3 : 0.9, ease: EASE, delay: (i % columns) * stagger }}
          >
            <button
              type="button"
              ref={(el) => {
                if (el) triggerRefs.current.set(item.id, el);
                else triggerRefs.current.delete(item.id);
              }}
              onClick={() => open(i)}
              aria-label={`${item.title}（${item.place}）を拡大表示`}
              data-thumb={i}
              className="group relative block w-full rounded-[18px] outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950"
            >
              <motion.div
                layoutId={`ml-${item.id}`}
                className={`overflow-hidden rounded-[18px] bg-gradient-to-br ${item.tint}`}
                style={{ aspectRatio: `${item.w} / ${item.h}`, borderRadius: 18 }}
                transition={{ duration: reduce ? 0 : 0.6, ease: EASE }}
                onLayoutAnimationComplete={() => {
                  if (!isOpenRef.current) setRaised(null);
                }}
              >
                <img
                  src={src(item.id, 900)}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover transition-[scale] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                />
              </motion.div>
              <span className="pointer-events-none absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white/80 text-slate-900 opacity-0 backdrop-blur transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                <Maximize2 className="size-4" aria-hidden />
              </span>
              {captions && (
                <span
                  className={`pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between rounded-b-[18px] bg-gradient-to-t from-black/60 to-transparent p-4 pt-10 text-left text-white transition-opacity duration-300 ${
                    raised === item.id ? 'opacity-0' : 'opacity-100'
                  }`}
                >
                  <span className="text-sm font-semibold">{item.title}</span>
                  <span className="font-mono text-[11px] tracking-widest text-white/70">{item.place}</span>
                </span>
              )}
            </button>
          </motion.li>
        ))}
      </ul>

      <AnimatePresence
        onExitComplete={() => {
          const id = lastOpenedRef.current;
          if (linked === null) setRaised(null);
          if (id) triggerRefs.current.get(id)?.focus({ preventScroll: true });
        }}
      >
        {current && (
          <motion.div
            key="lightbox"
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={`${current.title}（${index! + 1} / ${ITEMS.length}）`}
            onKeyDown={onDialogKey}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-10"
          >
            <motion.div
              aria-hidden
              data-backdrop
              onClick={close}
              className="absolute inset-0 bg-zinc-950/85 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            />

            <AnimatePresence initial={false} custom={dir} mode="popLayout" propagate>
              <motion.figure
                key={current.id}
                custom={dir}
                variants={{
                  enter: (d: number) => ({ x: reduce ? 0 : d * 120, opacity: 0 }),
                  center: { x: 0, opacity: 1 },
                  exit: (d: number) => ({ x: reduce ? 0 : d * -120, opacity: 0 }),
                }}
                initial="enter"
                animate="center"
                exit={linked === current.id ? undefined : 'exit'}
                transition={{ duration: reduce ? 0.2 : 0.5, ease: EASE }}
                drag={reduce ? false : 'x'}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.6}
                onDragEnd={onDragEnd}
                className="relative z-10 flex max-h-full w-full cursor-grab flex-col items-center active:cursor-grabbing"
              >
                <motion.div
                  layoutId={linked === current.id ? `ml-${current.id}` : undefined}
                  className={`relative overflow-hidden bg-gradient-to-br ${current.tint} shadow-2xl shadow-black/50`}
                  style={{
                    aspectRatio: `${current.w} / ${current.h}`,
                    width: stageWidth,
                    borderRadius: 14,
                  }}
                  transition={{ duration: reduce ? 0 : 0.6, ease: EASE }}
                >
                  <img src={src(current.id, 1800)} alt={`${current.title}（${current.place}）`} draggable={false} className="h-full w-full object-cover" />
                </motion.div>
                <motion.figcaption
                  style={{ width: stageWidth }}
                  className="mt-4 flex max-w-full items-baseline justify-between gap-4 text-white"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.25, duration: 0.4 } }}
                  exit={{ opacity: 0, transition: { duration: 0.1 } }}
                >
                  <span className="text-base font-semibold sm:text-lg">
                    {current.title}
                    <span className="ml-3 text-sm font-normal text-white/60">{current.place}</span>
                  </span>
                  <span className="font-mono text-xs tracking-widest text-white/60">
                    {String(index! + 1).padStart(2, '0')} / {String(ITEMS.length).padStart(2, '0')}
                  </span>
                </motion.figcaption>
              </motion.figure>
            </AnimatePresence>

              <motion.button
                {...FADE}
                ref={closeRef}
                type="button"
                onClick={close}
                aria-label="閉じる"
                data-close
                className="absolute right-4 top-4 z-20 grid size-11 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <X className="size-5" aria-hidden />
              </motion.button>
              <motion.button
                {...FADE}
                type="button"
                onClick={() => go(-1)}
                disabled={!canPrev}
                aria-label="前の画像"
                data-prev
                className="absolute left-3 top-1/2 z-20 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-30 max-sm:top-auto max-sm:bottom-4 max-sm:translate-y-0 sm:left-6"
              >
                <ChevronLeft className="size-5" aria-hidden />
              </motion.button>
              <motion.button
                {...FADE}
                type="button"
                onClick={() => go(1)}
                disabled={!canNext}
                aria-label="次の画像"
                data-next
                className="absolute right-3 top-1/2 z-20 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-30 max-sm:top-auto max-sm:bottom-4 max-sm:translate-y-0 sm:right-6"
              >
                <ChevronRight className="size-5" aria-hidden />
              </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </LayoutGroup>
  );
}

export default function App() {
  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-16 text-zinc-900 sm:px-8 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto max-w-6xl">
        <header className="mb-12 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-xs tracking-[0.3em] text-zinc-500">PHOTO ARCHIVE — 12 SHOTS</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">旅の途中で見つけた景色</h1>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            写真をクリックすると拡大します。← → キーやスワイプで前後に送れます。
          </p>
        </header>
        <MasonryLightbox />
      </div>
    </main>
  );
}
