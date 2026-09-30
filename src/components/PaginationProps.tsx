import { useState, memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

// --- インタラクティブ ページネーション コンポーネント ---
interface PaginationProps {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export const InteractivePagination = memo(
  ({ totalPages, currentPage, onPageChange }: PaginationProps) => {
    // ページ番号の可視リスト（... 省略記号含む）を計算生成するロジック
    const paginationRange = useMemo(() => {
      const delta = 1; // 現在ページの前後に表示するページ数
      const range: (number | string)[] = [];
      const rangeWithDots: (number | string)[] = [];

      for (let i = 1; i <= totalPages; i++) {
        if (
          i === 1 ||
          i === totalPages ||
          (i >= currentPage - delta && i <= currentPage + delta)
        ) {
          range.push(i);
        }
      }

      let l: number | null = null;
      for (const i of range) {
        if (typeof i === 'number') {
          if (l) {
            if (i - l === 2) {
              rangeWithDots.push(l + 1);
            } else if (i - l !== 1) {
              rangeWithDots.push('...');
            }
          }
          rangeWithDots.push(i);
          l = i;
        }
      }

      return rangeWithDots;
    }, [totalPages, currentPage]);

    return (
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
        {/* 最初へ移動ボタン */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:disabled:hover:bg-slate-900"
          aria-label="最初のページへ"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>

        {/* 前へ移動ボタン */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:disabled:hover:bg-slate-900"
          aria-label="前のページへ"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* ページ番号ボタンエリア */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {paginationRange.map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`dots-${index}`}
                  className="flex h-9 w-7 items-center justify-center text-xs font-bold text-slate-400"
                >
                  •••
                </span>
              );
            }

            const isCurrent = page === currentPage;

            return (
              <button
                key={page}
                onClick={() => onPageChange(page as number)}
                className={`relative flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold transition-colors ${
                  isCurrent
                    ? 'text-white'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/60'
                }`}
              >
                {/* アクティブ時に位置が追従する背景アニメーション */}
                {isCurrent && (
                  <motion.div
                    layoutId="activePagination"
                    className="absolute inset-0 rounded-xl bg-indigo-600 shadow-md shadow-indigo-200 dark:bg-indigo-500 dark:shadow-none"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{page}</span>
              </button>
            );
          })}
        </div>

        {/* 次へ移動ボタン */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:disabled:hover:bg-slate-900"
          aria-label="次のページへ"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* 最後へ移動ボタン */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:disabled:hover:bg-slate-900"
          aria-label="最後のページへ"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>
    );
  }
);

InteractivePagination.displayName = 'InteractivePagination';

// --- メインコンポーネント（デモ画面） ---
export default function App() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 12; // 全12ページの設定例

  // デモ用のダミーリストデータ
  const sampleItems = Array.from({ length: 5 }, (_, i) => ({
    id: i + 1 + (currentPage - 1) * 5,
    title: `コンポーネントアイテム #${i + 1 + (currentPage - 1) * 5}`,
    category: ['UIパーツ', 'アニメーション', 'フォーム', 'ナビゲーション'][i % 4],
  }));

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 sm:p-6 dark:bg-slate-950">
      <div className="w-full max-w-md">
        {/* ヘッダータイトル */}
        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold text-slate-800 sm:text-2xl dark:text-slate-100">
            <span className="block sm:inline">インタラクティブ ページネーション</span>
            <span className="block sm:inline">（Interactive Pagination）</span>
          </h2>
          <p className="mt-1.5 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
            <span className="block sm:inline">クリック時に移動するアクティブ背景と</span>
            <span className="block sm:inline">省略記号（...）表示付きのページ切替UI。</span>
          </p>
        </div>

        {/* デモ用コンテンツカード */}
        <div className="mb-6 space-y-2.5">
          {sampleItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all dark:border-slate-800 dark:bg-slate-900"
            >
              <span className="text-xs font-bold text-slate-800 sm:text-sm dark:text-slate-100">
                {item.title}
              </span>
              <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                {item.category}
              </span>
            </div>
          ))}
        </div>

        {/* 現在のページ状態表示 */}
        <div className="mb-4 text-center text-xs text-slate-400">
          全 {totalPages} ページ中 {currentPage} ページ目を表示中
        </div>

        {/* ページネーションコンポーネント */}
        <InteractivePagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>
    </div>
  );
}