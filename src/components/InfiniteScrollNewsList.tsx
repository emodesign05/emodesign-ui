import { useState, useEffect, useRef, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, CheckCircle, Clock } from 'lucide-react';

// --- モックデータ構造 ---
interface NewsItem {
  id: number;
  title: string;
  category: string;
  date: string;
}

// 初期用サンプルデータ（全15件）
const makeNews = (total: number): NewsItem[] =>
  Array.from({ length: total }, (_, i) => ({
    id: i + 1,
    title: `最新のフロントエンド開発トレンド解説 Vol.${i + 1}`,
    category: i % 2 === 0 ? 'テクノロジー' : 'デザイン',
    date: `${Math.floor(i / 2) + 1}日前`,
  }));

// --- 1. 個別ニュースカード（memo化＋Framer Motion固定） ---
const NewsCard = memo(({ item, duration, offset }: { item: NewsItem; duration: number; offset: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: offset }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration }}
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <span className="inline-block rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
        {item.category}
      </span>
      <h3 className="mt-2 text-base font-bold text-slate-800 dark:text-slate-100">
        {item.title}
      </h3>
      <div className="mt-3 flex items-center space-x-1 text-xs text-slate-400">
        <Clock className="h-3 w-3" />
        <span>{item.date}</span>
      </div>
    </motion.div>
  );
});

NewsCard.displayName = 'NewsCard';

// --- 2. スケルトンパーツ（読み込み中表示） ---
const SkeletonCard = ({ duration }: { duration: number }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <div className="relative overflow-hidden bg-slate-200 dark:bg-slate-700 h-4 w-20 rounded mb-3">
      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent"
        animate={{ translateX: ['-100%', '100%'] }}
        transition={{ repeat: Infinity, duration, ease: 'easeInOut' }}
      />
    </div>
    <div className="relative overflow-hidden bg-slate-200 dark:bg-slate-700 h-6 w-5/6 rounded mb-2">
      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent"
        animate={{ translateX: ['-100%', '100%'] }}
        transition={{ repeat: Infinity, duration, ease: 'easeInOut' }}
      />
    </div>
    <div className="relative overflow-hidden bg-slate-200 dark:bg-slate-700 h-3.5 w-24 rounded">
      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent"
        animate={{ translateX: ['-100%', '100%'] }}
        transition={{ repeat: Infinity, duration, ease: 'easeInOut' }}
      />
    </div>
  </div>
);

// --- 3. メインコンポーネント ---
export interface NewsListProps {
  total?: number;
  perPage?: number;
  loadDelay?: number;
  cardDuration?: number;
  cardOffset?: number;
  shimmerDuration?: number;
  skeletonCount?: number;
}

export function InfiniteScrollNewsList({
  total = 15,
  perPage = 6,
  loadDelay = 1000,
  cardDuration = 0.25,
  cardOffset = 15,
  shimmerDuration = 1.5,
  skeletonCount = 2,
}: NewsListProps) {
  const ITEMS_PER_PAGE = perPage;
  const ALL_NEWS_DATA = useMemo(() => makeNews(total), [total]);
  const [items, setItems] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // useRef で状態を追跡（IntersectionObserverの無駄な再生成を完全に防止）
  const pageRef = useRef(1);
  const isLoadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  // 1. データ読み込み処理
  const loadMoreItems = () => {
    if (isLoadingRef.current || !hasMoreRef.current) return;

    // ロード中フラグの更新
    isLoadingRef.current = true;
    setIsLoading(true);

    setTimeout(() => {
      const currentPage = pageRef.current;
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const newItems = ALL_NEWS_DATA.slice(startIndex, endIndex);

      if (newItems.length > 0) {
        // 既存のリストの後ろに新しいデータだけを追加
        setItems((prevItems) => [...prevItems, ...newItems]);
        
        // ページ番号の更新
        pageRef.current = currentPage + 1;
      }

      // 全データロード完了判定
      if (endIndex >= ALL_NEWS_DATA.length) {
        hasMoreRef.current = false;
        setHasMore(false);
      }

      // ロード中フラグの解除
      isLoadingRef.current = false;
      setIsLoading(false);
    }, loadDelay);
  };

  // 2. 初回データロード
  useEffect(() => {
    loadMoreItems();
  }, []);

  // 3. スクロール検知（Intersection Observerを1度だけ登録）
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting) {
          loadMoreItems();
        }
      },
      { threshold: 0.1 }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, []); // 依存配列を空にしてObserverの解体・再生成を完全に排除

  // リセット処理
  const handleReset = () => {
    setItems([]);
    pageRef.current = 1;
    isLoadingRef.current = false;
    hasMoreRef.current = true;
    setIsLoading(false);
    setHasMore(true);
    loadMoreItems();
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-slate-50 p-6 dark:bg-slate-950">
      <div className="w-full max-w-md">
        {/* ヘッダー */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              無限スクロールニュース
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              表示中: {items.length} / {ALL_NEWS_DATA.length} 件
            </p>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center space-x-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>リセット</span>
          </button>
        </div>

        {/* ニュースリスト（既存アイテムは絶対再ロードされません） */}
        <div className="space-y-4">
          {items.map((item) => (
            <NewsCard key={item.id} item={item} duration={cardDuration} offset={cardOffset} />
          ))}
        </div>

        {/* スクロール検知 ＆ スケルトン領域 */}
        <div ref={loaderRef} className="mt-4 pt-2">
          {isLoading && (
            <div className="space-y-4">
              {Array.from({ length: skeletonCount }, (_, i) => (
                <SkeletonCard key={i} duration={shimmerDuration} />
              ))}
            </div>
          )}

          {!hasMore && (
            <div className="my-8 flex flex-col items-center justify-center text-slate-400">
              <CheckCircle className="mb-1 h-6 w-6 text-emerald-500" />
              <p className="text-xs font-medium">すべてのコンテンツを読み込みました</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return <InfiniteScrollNewsList />;
}
