import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, PenSquare, Image, Share2, FileText } from 'lucide-react';

// --- サブアクションボタンのデータ構造定義 ---
interface ActionItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
  onClick: () => void;
}

// --- フローティングアクションボタン メインコンポーネント ---
export const ExpandableFAB = memo(({ stagger = 0.04, itemDuration = 0.2, size = 56, side = 'right' }: { stagger?: number; itemDuration?: number; size?: number; side?: 'left' | 'right' }) => {
  const [isOpen, setIsOpen] = useState(false);

  // トグル開閉ハンドラー
  const toggleOpen = () => setIsOpen((prev) => !prev);

  // 各サブボタンのアクション定義
  const actions: ActionItem[] = [
    {
      id: 'post',
      label: '新規記事を作成',
      icon: PenSquare,
      colorClass: 'bg-indigo-600 text-white hover:bg-indigo-700',
      onClick: () => alert('「新規記事を作成」がクリックされました'),
    },
    {
      id: 'upload',
      label: '画像をアップロード',
      icon: Image,
      colorClass: 'bg-emerald-600 text-white hover:bg-emerald-700',
      onClick: () => alert('「画像をアップロード」がクリックされました'),
    },
    {
      id: 'doc',
      label: 'ドキュメント追加',
      icon: FileText,
      colorClass: 'bg-amber-500 text-white hover:bg-amber-600',
      onClick: () => alert('「ドキュメント追加」がクリックされました'),
    },
    {
      id: 'share',
      label: 'ページを共有',
      icon: Share2,
      colorClass: 'bg-rose-600 text-white hover:bg-rose-700',
      onClick: () => alert('「ページを共有」がクリックされました'),
    },
  ];

  return (
    <>
      {/* 開いている時の背景透過レイヤー（画面外クリックで閉じる） */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-[1px] transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* FAB本体固定コンテナ（画面右下に配置） */}
      <div className={`fixed bottom-6 z-50 flex flex-col space-y-3 ${side === 'right' ? 'right-6 items-end' : 'left-6 items-start'}`}>
        {/* サブアクションボタンリスト（開閉アニメーション付き） */}
        <AnimatePresence>
          {isOpen && (
            <div className={`flex flex-col space-y-3 pb-1 ${side === 'right' ? 'items-end' : 'items-start'}`}>
              {actions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <motion.div
                    key={action.id}
                    initial={{ opacity: 0, y: 15, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.8 }}
                    transition={{
                      duration: itemDuration,
                      delay: (actions.length - 1 - index) * stagger, // 下から順に時間差で浮き上がる
                    }}
                    className={`flex items-center space-x-3 ${side === 'left' ? 'flex-row-reverse space-x-reverse' : ''}`}
                  >
                    {/* 説明テキストラベル（ツールチップ） */}
                    <span className="rounded-lg bg-slate-900/90 px-3 py-1.5 text-xs font-semibold text-white shadow-md backdrop-blur-md dark:bg-slate-100 dark:text-slate-900">
                      {action.label}
                    </span>

                    {/* サブアイコンボタン */}
                    <button
                      onClick={() => {
                        action.onClick();
                        setIsOpen(false);
                      }}
                      className={`flex h-11 w-11 items-center justify-center rounded-full shadow-lg transition-transform active:scale-90 ${action.colorClass}`}
                      aria-label={action.label}
                    >
                      <Icon className="h-5 w-5" />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>

        {/* メイン開閉トリガーボタン（＋アイコンが×へ回転） */}
        <button
          onClick={toggleOpen}
          style={{ width: size, height: size }}
          className="relative flex items-center justify-center rounded-full bg-slate-900 text-white shadow-xl transition-all hover:bg-slate-800 active:scale-95 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
          aria-label="アクションメニューを開く"
          aria-expanded={isOpen}
        >
          <motion.div
            animate={{ rotate: isOpen ? 135 : 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <Plus className="h-7 w-7" />
          </motion.div>
        </button>
      </div>
    </>
  );
});

ExpandableFAB.displayName = 'ExpandableFAB';

// --- メインコンポーネント ---
export default function App() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 sm:p-6 dark:bg-slate-950">
      <div className="max-w-md text-center">
        <h2 className="text-xl font-bold text-slate-800 sm:text-2xl dark:text-slate-100">
          <span className="block sm:inline">フローティングアクションボタン</span>
          <span className="block sm:inline">（Expandable FAB）</span>
        </h2>
        <p className="mt-2 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
          画面右下の黒い「＋」ボタンをクリックして、サブメニューの展開アニメーションをお試しください。
        </p>
      </div>

      {/* FABコンポーネントの実装 */}
      <ExpandableFAB />
    </div>
  );
}