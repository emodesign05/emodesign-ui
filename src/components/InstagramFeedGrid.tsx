import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Bookmark, Camera, ChevronLeft, ChevronRight, Heart, MessageCircle, X } from 'lucide-react';

/* =========================================================
 * Instagram風フィードグリッド（Instagram-style Feed Grid）
 * - 正方形サムネイルの 3 列グリッド（aspect-square）。投稿データは posts 配列 props で差し替え可能
 * - ホバー（またはキーボードフォーカス）で、いいね数・コメント数を半透明オーバーレイで表示
 * - クリックで拡大モーダル：前後ボタン／←→キーで送り、Esc・背景クリック・×で閉じる
 *   モーダルは role="dialog" aria-modal、開いたら閉じるボタンへフォーカス、閉じたら元のサムネイルへ戻す、
 *   Tab はモーダル内でループ（簡易フォーカストラップ）、表示中は背面スクロールを止める
 * - 特定サービスの公式ロゴは使わず、lucide の汎用アイコン（Camera / Heart / MessageCircle）を使用
 * - prefers-reduced-motion 時はモーダルの拡大・スライドを無効化（フェードのみ・ほぼ即時）
 * ========================================================= */

export type FeedPost = {
  id: string;
  image: string;
  caption: string;
  likes: number;
  comments: number;
  date: string;
};

const u = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&h=800&q=80`;

const DEFAULT_POSTS: FeedPost[] = [
  { id: 'p1', image: u('photo-1495474472287-4d71bcdd2085'), caption: '朝いちばんの一杯。今日の豆はエチオピアの浅煎りです。', likes: 1284, comments: 42, date: '2日前' },
  { id: 'p2', image: u('photo-1441974231531-c6227db76b6e'), caption: '週末は森の中で撮影でした。光がとてもきれい。', likes: 932, comments: 18, date: '3日前' },
  { id: 'p3', image: u('photo-1513735492246-483525079686'), caption: '新しい器が届きました。手びねりの風合いが好き。', likes: 2103, comments: 67, date: '5日前' },
  { id: 'p4', image: u('photo-1507525428034-b723cf961d3e'), caption: '海辺のアトリエで打ち合わせ。', likes: 1540, comments: 31, date: '1週間前' },
  { id: 'p5', image: u('photo-1523275335684-37898b6baf30'), caption: '撮影用の小物を整理中。', likes: 688, comments: 12, date: '1週間前' },
  { id: 'p6', image: u('photo-1470071459604-3b5ec3a7fe05'), caption: '朝霧の山。少し早起きしたご褒美。', likes: 3021, comments: 104, date: '2週間前' },
  { id: 'p7', image: u('photo-1556228720-195a672e8a03'), caption: 'パッケージデザインの試作が完成しました。', likes: 1177, comments: 29, date: '2週間前' },
  { id: 'p8', image: u('photo-1501785888041-af3ef285b470'), caption: '湖畔でひと休み。', likes: 845, comments: 15, date: '3週間前' },
  { id: 'p9', image: u('photo-1526170375885-4d8ecf77b99f'), caption: 'フィルムカメラ、久しぶりに現像に出しました。', likes: 1962, comments: 53, date: '3週間前' },
  { id: 'p10', image: u('photo-1519681393784-d120267933ba'), caption: '冬の星空。', likes: 4410, comments: 160, date: '1か月前' },
  { id: 'p11', image: u('photo-1542291026-7eec264c27ff'), caption: '赤いスニーカーで出かけよう。', likes: 721, comments: 9, date: '1か月前' },
  { id: 'p12', image: u('photo-1500530855697-b586d89ba3ee'), caption: '夕暮れのドライブ。', likes: 1388, comments: 37, date: '1か月前' },
];

// 画像が読み込めない場合でも寂しくならないよう、マスごとに淡いグラデーションを敷く
const FALLBACK = [
  'from-rose-200 to-amber-100', 'from-emerald-200 to-teal-100', 'from-indigo-200 to-sky-100',
  'from-amber-200 to-orange-100', 'from-fuchsia-200 to-pink-100', 'from-slate-300 to-slate-100',
];

const fmt = (n: number) => (n >= 10000 ? `${(n / 10000).toFixed(1)}万` : n.toLocaleString('ja-JP'));

export interface InstagramFeedGridProps {
  /** 表示する投稿の配列（省略時はダミー 12 件） */
  posts?: FeedPost[];
  /** 表示件数（posts の先頭から） */
  count?: number;
  /** マス同士の隙間（px） */
  gap?: number;
  /** サムネイルの角丸（px） */
  radius?: number;
  /** ホバー時オーバーレイの濃さ（0〜1） */
  overlayOpacity?: number;
  /** モーダルの前後送りで端からループするか */
  loop?: boolean;
  /** アカウント名（架空） */
  account?: string;
}

export function InstagramFeedGrid({
  posts = DEFAULT_POSTS,
  count = 9,
  gap = 4,
  radius = 0,
  overlayOpacity = 0.45,
  loop = true,
  account = 'atelier_hibi',
}: InstagramFeedGridProps) {
  const list = posts.slice(0, Math.max(1, count));
  const [index, setIndex] = useState<number | null>(null);
  const [dir, setDir] = useState(1);
  const reduce = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);

  const go = useCallback(
    (delta: number) => {
      setDir(delta);
      setIndex((i) => {
        if (i === null) return i;
        const n = list.length;
        const next = i + delta;
        if (loop) return (next + n) % n;
        return Math.min(n - 1, Math.max(0, next));
      });
    },
    [list.length, loop],
  );

  const close = useCallback(() => {
    setIndex(null);
    // 閉じたら元のサムネイルへフォーカスを戻す
    requestAnimationFrame(() => lastTrigger.current?.focus());
  }, []);

  const isOpen = index !== null;

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'Tab' && dialogRef.current) {
        // 簡易フォーカストラップ
        const f = dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]');
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, close, go]);

  const post = index !== null ? list[index] : null;
  const atStart = !loop && index === 0;
  const atEnd = !loop && index === list.length - 1;
  const totalLikes = list.reduce((s, p) => s + p.likes, 0);

  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* プロフィールヘッダー（架空アカウント） */}
      <div className="mb-8 flex items-center gap-5 px-4 sm:gap-8 sm:px-0">
        <div className="rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-fuchsia-600 p-[3px]">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-slate-100 sm:h-24 sm:w-24 dark:border-slate-950 dark:bg-slate-800">
            <Camera className="h-6 w-6 text-slate-500 sm:h-8 sm:w-8 dark:text-slate-300" aria-hidden />
          </div>
        </div>
        <div className="min-w-0">
          <p className="truncate text-lg font-bold text-slate-800 sm:text-xl dark:text-slate-100">{account}</p>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm dark:text-slate-400">デザインと暮らしの記録 ｜ 架空のアカウントです</p>
          <dl className="mt-3 flex gap-5 text-xs text-slate-600 sm:text-sm dark:text-slate-300">
            <div><dt className="sr-only">投稿</dt><dd><b className="font-bold text-slate-800 dark:text-white">{list.length}</b> 投稿</dd></div>
            <div><dt className="sr-only">合計いいね</dt><dd><b className="font-bold text-slate-800 dark:text-white">{fmt(totalLikes)}</b> いいね</dd></div>
          </dl>
        </div>
      </div>

      <ul className="grid grid-cols-3" style={{ gap }}>
        {list.map((p, i) => (
          <li key={p.id}>
            <button
              type="button"
              onClick={(e) => {
                lastTrigger.current = e.currentTarget;
                setDir(1);
                setIndex(i);
              }}
              aria-label={`投稿を拡大：${p.caption}（いいね ${p.likes}件・コメント ${p.comments}件）`}
              className={`group relative block aspect-square w-full overflow-hidden bg-gradient-to-br focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 ${FALLBACK[i % FALLBACK.length]}`}
              style={{ borderRadius: radius }}
            >
              <img src={p.image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
              <span
                aria-hidden
                className="absolute inset-0 flex items-center justify-center gap-4 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 sm:gap-6"
                style={{ backgroundColor: `rgb(0 0 0 / ${overlayOpacity})` }}
              >
                <span className="flex items-center gap-1.5 text-xs font-bold sm:text-base">
                  <Heart className="h-4 w-4 fill-current sm:h-5 sm:w-5" /> {fmt(p.likes)}
                </span>
                <span className="flex items-center gap-1.5 text-xs font-bold sm:text-base">
                  <MessageCircle className="h-4 w-4 fill-current sm:h-5 sm:w-5" /> {fmt(p.comments)}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <AnimatePresence>
        {post && index !== null && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0.01 : 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm sm:p-8"
            onClick={close}
          >
            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-label={`投稿 ${index + 1} / ${list.length}`}
              initial={{ scale: reduce ? 1 : 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: reduce ? 1 : 0.96, opacity: 0 }}
              transition={{ duration: reduce ? 0.01 : 0.25, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              className="relative flex max-h-full w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl md:flex-row dark:bg-slate-900"
            >
              <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-slate-200 md:w-[60%] dark:bg-slate-800">
                <AnimatePresence initial={false} custom={dir} mode="popLayout">
                  <motion.img
                    key={post.id}
                    src={post.image}
                    alt={post.caption}
                    custom={dir}
                    initial={{ opacity: 0, x: reduce ? 0 : dir * 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: reduce ? 0 : dir * -40 }}
                    transition={{ duration: reduce ? 0.01 : 0.25 }}
                    className={`absolute inset-0 h-full w-full bg-gradient-to-br object-cover ${FALLBACK[index % FALLBACK.length]}`}
                  />
                </AnimatePresence>
              </div>

              <div className="flex min-h-0 flex-1 flex-col">
                <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 md:pr-14 dark:border-slate-800">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                    <Camera className="h-4 w-4 text-slate-500" aria-hidden />
                  </span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{account}</span>
                  <span className="ml-auto text-xs text-slate-400">{index + 1} / {list.length}</span>
                </div>
                <p className="flex-1 overflow-y-auto px-4 py-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">{post.caption}</p>
                <div className="border-t border-slate-100 px-4 py-3 dark:border-slate-800">
                  <div className="flex items-center gap-4 text-slate-700 dark:text-slate-200">
                    <Heart className="h-5 w-5" aria-hidden />
                    <MessageCircle className="h-5 w-5" aria-hidden />
                    <Bookmark className="ml-auto h-5 w-5" aria-hidden />
                  </div>
                  <p className="mt-2 text-sm font-bold text-slate-800 dark:text-slate-100">いいね {post.likes.toLocaleString('ja-JP')}件</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">コメント {post.comments}件 ・ {post.date}</p>
                </div>
              </div>

              <button
                type="button"
                autoFocus
                onClick={close}
                aria-label="閉じる"
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition-colors hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => go(-1)}
                disabled={atStart}
                aria-label="前の投稿"
                className="absolute left-3 top-[30%] flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-lg transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 disabled:opacity-30 sm:top-1/2 md:left-3"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                disabled={atEnd}
                aria-label="次の投稿"
                className="absolute right-3 top-[30%] flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-lg transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 disabled:opacity-30 sm:top-1/2 md:left-[calc(60%-3.25rem)] md:right-auto"
              >
                <ChevronRight className="h-5 w-5" aria-hidden />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function InstagramFeedGridDemo(props: InstagramFeedGridProps) {
  return (
    <main className="min-h-screen bg-white py-12 sm:px-6 sm:py-20 dark:bg-slate-950">
      <InstagramFeedGrid {...props} />
    </main>
  );
}

export default function App() {
  return <InstagramFeedGridDemo />;
}
