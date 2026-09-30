import { useState, useRef, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, ChevronRight, MoreHorizontal } from 'lucide-react';

// --- パンくずリストのアイテム型定義 ---
interface BreadcrumbItem {
  id: string;
  label: string;
  href?: string;
}

// サンプルデータ（深い階層構造の例）
const BREADCRUMB_ITEMS: BreadcrumbItem[] = [
  { id: 'home', label: 'ホーム', href: '/' },
  { id: 'products', label: 'コンポーネントライブラリ', href: '/products' },
  { id: 'category', label: 'UIパーツ', href: '/products/ui' },
  { id: 'subcategory', label: 'ナビゲーション', href: '/products/ui/navigation' },
  { id: 'current', label: 'パンくずリスト（Breadcrumbs）' }, // 現在地（hrefなし）
];

// --- アクセシブル パンくずリスト コンポーネント ---
const CURRENT = {
  indigo: 'text-indigo-600 dark:text-indigo-400',
  rose: 'text-rose-600 dark:text-rose-400',
  emerald: 'text-emerald-600 dark:text-emerald-400',
  amber: 'text-amber-600 dark:text-amber-400',
} as const;

export interface BreadcrumbsProps {
  tail?: number;
  accent?: keyof typeof CURRENT;
  duration?: number;
  offset?: number;
}

export const AccessibleBreadcrumbs = memo(({
  tail = 2,
  accent = 'indigo',
  duration = 0.15,
  offset = 8,
}: BreadcrumbsProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);

  // 枠外クリックでドロップダウンを閉じる処理
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 階層データの分割（先頭、中間折りたたみ対象、末尾2つ）
  const firstItem = BREADCRUMB_ITEMS[0];
  const lastItems = BREADCRUMB_ITEMS.slice(-tail);
  const hiddenItems = BREADCRUMB_ITEMS.slice(1, -tail); // ドロップダウンに隠す階層

  return (
    <nav aria-label="Breadcrumb" className="w-full max-w-2xl">
      <ol className="flex flex-wrap items-center space-x-1.5 text-xs font-medium sm:space-x-2 sm:text-sm">
        {/* 1. 先頭アイテム（ホーム） */}
        <li className="inline-flex items-center">
          <a
            href={firstItem.href}
            className="inline-flex items-center space-x-1.5 text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            <Home className="h-4 w-4 shrink-0" />
            <span>{firstItem.label}</span>
          </a>
        </li>

        {/* 区切りアイコン */}
        <li className="text-slate-300 dark:text-slate-600" aria-hidden="true">
          <ChevronRight className="h-4 w-4" />
        </li>

        {/* 2. 中間階層のドロップダウン表示エリア */}
        {hiddenItems.length > 0 && (
          <li className="relative inline-flex items-center" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              aria-label="隠れている階層を表示"
              aria-expanded={isDropdownOpen}
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>

            {/* ドロップダウンポップオーバー */}
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: offset }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: offset }}
                  transition={{ duration }}
                  className="absolute left-0 top-full z-50 mt-2 min-w-[180px] rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex flex-col space-y-1">
                    {hiddenItems.map((item) => (
                      <a
                        key={item.id}
                        href={item.href}
                        onClick={() => setIsDropdownOpen(false)}
                        className="rounded-xl px-3 py-2 text-xs text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                      >
                        {item.label}
                      </a>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 区切りアイコン */}
            <span className="ml-1.5 text-slate-300 sm:ml-2 dark:text-slate-600" aria-hidden="true">
              <ChevronRight className="h-4 w-4" />
            </span>
          </li>
        )}

        {/* 3. 末尾近くの階層および現在地 */}
        {lastItems.map((item, index) => {
          const isCurrent = index === lastItems.length - 1;

          return (
            <li key={item.id} className="inline-flex items-center space-x-1.5 sm:space-x-2">
              {isCurrent ? (
                // 現在地（リンクなし・強調表示）
                <span
                  className={`font-bold ${CURRENT[accent]}`}
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                // 中間リンク
                <>
                  <a
                    href={item.href}
                    className="text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                  >
                    {item.label}
                  </a>
                  <span className="text-slate-300 dark:text-slate-600" aria-hidden="true">
                    <ChevronRight className="h-4 w-4" />
                  </span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
});

AccessibleBreadcrumbs.displayName = 'AccessibleBreadcrumbs';

// --- メインコンポーネント（デモ画面） ---
export default function App() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 sm:p-6 dark:bg-slate-950">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-800 sm:text-2xl dark:text-slate-100">
            <span className="block sm:inline">パンくずリスト</span>
            <span className="block sm:inline">（Accessible Breadcrumbs）</span>
          </h2>
          <p className="mt-1.5 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
            <span className="block sm:inline">深い階層構造を「...」ボタンで折りたたむ</span>
            <span className="block sm:inline">アクセシブルなナビゲーションコンポーネントです。</span>
          </p>
        </div>

        {/* パンくずリストの実装 */}
        <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
          <AccessibleBreadcrumbs />
        </div>
      </div>
    </div>
  );
}