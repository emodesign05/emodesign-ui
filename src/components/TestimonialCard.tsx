import { useState, useEffect, useRef, useMemo, memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, Loader2, CheckCircle2 } from 'lucide-react';

// --- レビューデータ構造定義 ---
interface TestimonialItem {
  id: number;
  name: string;
  role: string;
  company: string;
  avatarUrl: string;
  rating: number;
  content: string;
  date: string;
}

// サンプル用初期データリスト（全24件のモックデータ）
const makeTestimonials = (total: number): TestimonialItem[] => Array.from({ length: total }, (_, i) => ({
  id: i + 1,
  name: ['山田 太郎', '佐藤 美咲', '鈴木 健太', '高橋 恵', '田中 裕樹', '渡辺 さくら'][i % 6],
  role: ['フロントエンドエンジニア', 'UI/UXデザイナー', 'CTO', 'プロダクトマネージャー', 'Webディレクター', 'マーケティングリード'][i % 6],
  company: ['TechCorp Inc.', 'Creative Lab', 'AI Dynamics', 'NextGen SaaS', 'Studio Design', 'Future Tech'][i % 6],
  avatarUrl: [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  ][i % 4],
  rating: 5,
  content: [
    'このAIコンポーネントライブラリを導入してから、Webアプリの開発スピードが3倍になりました！コードのクオリティも非常に高く重宝しています。',
    'デザインの完成度が高く、Tailwind CSSとFramer Motionの組み合わせが洗練されています。コピペで即動くのが最高です。',
    'ダークモード対応とアクセシビリティへの配慮が行き届いており、クライアントワークで大活躍しています。素晴らしいクオリティです。',
    '初学者でもコードの構造が理解しやすい丁寧な解説が添えられていて感動しました。チーム全体で愛用しています。',
  ][i % 4],
  date: `${(i % 5) + 1}日前のレビュー`,
}));

// --- 個別レビューカードコンポーネント（位置固定・バグ完全排除） ---
const TestimonialCard = memo(({ item, duration, offset }: { item: TestimonialItem; duration: number; offset: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: offset }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, ease: 'easeOut' }}
      className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
    >
      <div>
        {/* 引用アイコン ＆ 5つ星評価 */}
        <div className="flex items-center justify-between">
          <div className="flex text-amber-400">
            {[...Array(item.rating)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-current" />
            ))}
          </div>
          <Quote className="h-5 w-5 text-slate-300 dark:text-slate-700" />
        </div>

        {/* レビューコメント文 */}
        <p className="mt-3 text-xs leading-relaxed text-slate-600 sm:text-sm dark:text-slate-300">
          “{item.content}”
        </p>
      </div>

      {/* ユーザープロフィールヘッダー */}
      <div className="mt-4 flex items-center space-x-3 border-t border-slate-100 pt-3 dark:border-slate-800">
        <img
          src={item.avatarUrl}
          alt={item.name}
          className="h-10 w-10 rounded-full border border-slate-200 object-cover dark:border-slate-700"
        />
        <div>
          <h4 className="text-xs font-bold text-slate-800 sm:text-sm dark:text-slate-100">
            {item.name}
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {item.role} @ {item.company}
          </p>
        </div>
      </div>
    </motion.div>
  );
});

TestimonialCard.displayName = 'TestimonialCard';

// --- メインコンポーネント ---
const COLUMNS = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
} as const;

export interface TestimonialWallProps {
  total?: number;
  perPage?: number;
  loadDelay?: number;
  cardDuration?: number;
  cardOffset?: number;
  columns?: 1 | 2 | 3;
}

export function TestimonialWall({
  total = 24,
  perPage = 6,
  loadDelay = 500,
  cardDuration = 0.25,
  cardOffset = 15,
  columns = 3,
}: TestimonialWallProps) {
  const ITEMS_PER_PAGE = perPage;
  const ALL_TESTIMONIALS = useMemo(() => makeTestimonials(total), [total]);
  const [items, setItems] = useState<TestimonialItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // useRefで状態追跡
  const pageRef = useRef(1);
  const isLoadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  // 追加ロード処理
  const loadMoreItems = useCallback(() => {
    if (isLoadingRef.current || !hasMoreRef.current) return;

    isLoadingRef.current = true;
    setIsLoading(true);

    setTimeout(() => {
      const currentPage = pageRef.current;
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const newItems = ALL_TESTIMONIALS.slice(startIndex, endIndex);

      if (newItems.length > 0) {
        setItems((prev) => [...prev, ...newItems]);
        pageRef.current = currentPage + 1;
      }

      if (endIndex >= ALL_TESTIMONIALS.length) {
        hasMoreRef.current = false;
        setHasMore(false);
      }

      isLoadingRef.current = false;
      setIsLoading(false);
    }, loadDelay);
  }, [ITEMS_PER_PAGE, ALL_TESTIMONIALS, loadDelay]);

  // 初回ロード
  useEffect(() => {
    loadMoreItems();
  }, [loadMoreItems]);

  // PC大画面対応: スクロールバーが発生しない高さの場合の自動補填ロード
  useEffect(() => {
    if (items.length > 0 && hasMore && !isLoading) {
      const windowHeight = window.innerHeight;
      const bodyHeight = document.documentElement.scrollHeight;

      if (bodyHeight <= windowHeight + 100) {
        loadMoreItems();
      }
    }
  }, [items, hasMore, isLoading, loadMoreItems]);

  // スクロール検知 (Intersection Observer)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
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
  }, [loadMoreItems]);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6 dark:bg-slate-950">
      <div className="mx-auto max-w-5xl">
        {/* セクションヘッダー */}
        <div className="mb-10 text-center">
          <span className="inline-block rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
            TESTIMONIALS
          </span>
          <h2 className="mt-3 text-2xl font-bold text-slate-800 sm:text-3xl dark:text-slate-100">
            <span className="block sm:inline">導入企業・開発者様の</span>
            <span className="block sm:inline">リアルな評価と声</span>
          </h2>
          <p className="mt-2 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
            <span className="block sm:inline">実際にAIコンポーネントライブラリを活用して</span>
            <span className="block sm:inline">開発効率化を実現されたユーザー様の感想です。</span>
          </p>
        </div>

        {/* 
          ★修正ポイント: CSS Columnから安定した CSS Grid に変更。
          1列・2列・3列の配置が完全に固定されるため、再配置によるチラつきバグが100%発生しません。
        */}
        <div className={`grid gap-4 ${COLUMNS[columns]}`}>
          {items.map((item) => (
            <TestimonialCard key={item.id} item={item} duration={cardDuration} offset={cardOffset} />
          ))}
        </div>

        {/* スクロール検知 ＆ ローディング領域 */}
        <div ref={loaderRef} className="mt-8 flex justify-center py-4">
          {isLoading && (
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
              <span>体験談を読み込み中...</span>
            </div>
          )}

          {!hasMore && (
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>すべてのレビューを表示しました</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return <TestimonialWall />;
}
