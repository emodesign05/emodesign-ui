import { useState, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Bookmark, Share2 } from 'lucide-react';

const ShimmerContext = createContext(1.5);

// --- スケルトン基本パーツ（Shimmerアニメーション付き） ---
const Skeleton = ({ className = '' }: { className?: string }) => {
  const shimmerDuration = useContext(ShimmerContext);
  return (
    <div
      className={`relative overflow-hidden bg-slate-200 dark:bg-slate-700 ${className}`}
    >
      {/* 光が左から右へ流れるShimmer（シャイニー）アニメーション */}
      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent"
        animate={{
          translateX: ['-100%', '100%'],
        }}
        transition={{
          repeat: Infinity,
          duration: shimmerDuration,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
};

// --- 1. ニュース記事カードのスケルトンUI ---
const ArticleCardSkeleton = () => {
  return (
    <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* サムネイル画像領域 */}
      <Skeleton className="h-48 w-full rounded-xl" />

      {/* メインコンテンツ領域 */}
      <div className="mt-4 space-y-3">
        {/* カテゴリバッジ */}
        <Skeleton className="h-5 w-20 rounded-full" />

        {/* 記事タイトル（2行分） */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-full rounded" />
          <Skeleton className="h-5 w-3/4 rounded" />
        </div>

        {/* 記事概要文（2行分） */}
        <div className="space-y-2 pt-1">
          <Skeleton className="h-3.5 w-full rounded" />
          <Skeleton className="h-3.5 w-5/6 rounded" />
        </div>

        {/* 投稿者情報・メタデータ領域 */}
        <div className="mt-6 flex items-center justify-between pt-2">
          <div className="flex items-center space-x-3">
            {/* 投稿者アバター */}
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="space-y-1.5">
              {/* 投稿者名 */}
              <Skeleton className="h-3.5 w-24 rounded" />
              {/* 投稿日時 */}
              <Skeleton className="h-3 w-16 rounded" />
            </div>
          </div>
          {/* アイコンボタン領域 */}
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  );
};

// --- 2. 実際のニュース記事カード（データ読み込み完了時） ---
const ArticleCard = () => {
  return (
    <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      {/* サムネイル画像 */}
      <div className="relative h-48 w-full overflow-hidden rounded-xl">
        <img
          src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80"
          alt="テクノロジー記事サムネイル"
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>

      {/* メインコンテンツ */}
      <div className="mt-4 space-y-3">
        {/* カテゴリバッジ */}
        <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
          テクノロジー
        </span>

        {/* 記事タイトル */}
        <h3 className="line-clamp-2 text-lg font-bold text-slate-800 dark:text-slate-100">
          次世代AI技術がもたらすWeb開発の未来と最新トレンド
        </h3>

        {/* 記事概要文 */}
        <p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
          AIツールの進化によりWebデザインやフロントエンド開発の手法が大きく変わりつつあります。注目の技術を解説します。
        </p>

        {/* 投稿者情報・メタデータ */}
        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
              alt="著者アバター"
              className="h-9 w-9 rounded-full object-cover"
            />
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                山田 太郎
              </p>
              <div className="flex items-center space-x-1 text-xs text-slate-500 dark:text-slate-400">
                <Clock className="h-3 w-3" />
                <span>2時間前</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button
              className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              aria-label="ブックマーク"
            >
              <Bookmark className="h-4 w-4" />
            </button>
            <button
              className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              aria-label="シェア"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- メインアプリケーション component ---
export interface ShimmerDemoProps {
  shimmerDuration?: number;
  fadeDuration?: number;
  startLoading?: boolean;
}

export function ShimmerDemo({ shimmerDuration = 1.5, fadeDuration = 0.3, startLoading = true }: ShimmerDemoProps) {
  const [isLoading, setIsLoading] = useState(startLoading);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 dark:bg-slate-950">
      {/* 管理用コントローラー（トグル切替ボタン） */}
      <div className="mb-8 flex items-center space-x-4 rounded-xl bg-white p-3 shadow-sm dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          表示モード:
        </span>
        <button
          onClick={() => setIsLoading(!isLoading)}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
            isLoading
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none'
              : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          {isLoading ? 'スケルトン表示中 (Clickで解除)' : '実データ表示中 (Clickでスケルトン)'}
        </button>
      </div>

      {/* スケルトン ↔ コンテンツの滑らかな切替アニメーション */}
      <div className="w-full max-w-sm">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: fadeDuration }}
            >
              <ShimmerContext.Provider value={shimmerDuration}>
                <ArticleCardSkeleton />
              </ShimmerContext.Provider>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: fadeDuration }}
            >
              <ArticleCard />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function App() {
  return <ShimmerDemo />;
}
