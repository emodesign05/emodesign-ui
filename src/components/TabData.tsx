import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Sparkles, Star, HelpCircle } from 'lucide-react';

// --- タブ構造データ型定義 ---
interface TabData {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  content: React.ReactNode;
}

// サンプルデータ
const TAB_ITEMS: TabData[] = [
  {
    id: 'overview',
    label: '商品概要',
    icon: FileText,
    content: (
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-slate-800 sm:text-base dark:text-slate-100">
          夜の間にハリとツヤを与える濃密美容液
        </h4>
        <p className="text-xs leading-relaxed text-slate-600 sm:text-sm dark:text-slate-300">
          厳選された成分が肌の角質層まで浸透し、睡眠中の肌リズムを整えます。翌朝、手に吸い付くような潤いと透明感を実感していただけます。
        </p>
      </div>
    ),
  },
  {
    id: 'ingredients',
    label: '成分・使い方',
    icon: Sparkles,
    content: (
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-slate-800 sm:text-base dark:text-slate-100">
          配合成分 ＆ お手入れ方法
        </h4>
        <p className="text-xs leading-relaxed text-slate-600 sm:text-sm dark:text-slate-300">
          【主要成分】高濃度ヒアルロン酸、ナイアシンアミド、セラミドComplex<br />
          【使用方法】洗顔後、化粧水で肌を整えた後に適量（スポイト1回分）を手にとり、顔全体に優しくなじませてください。
        </p>
      </div>
    ),
  },
  {
    id: 'reviews',
    label: 'レビュー (248)',
    icon: Star,
    content: (
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <div className="flex text-amber-500">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-current sm:h-4 sm:w-4" />
            ))}
          </div>
          <span className="text-xs font-bold text-slate-700 sm:text-sm dark:text-slate-200">
            4.9 / 5.0
          </span>
        </div>
        <p className="text-xs leading-relaxed text-slate-600 sm:text-sm dark:text-slate-300">
          「使った翌朝の肌のもちもち感に驚きました！テクスチャーもべたつかず、すっと馴染みます。」（30代女性）
        </p>
      </div>
    ),
  },
  {
    id: 'faq',
    label: 'よくある質問',
    icon: HelpCircle,
    content: (
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-slate-800 sm:text-base dark:text-slate-100">
          FAQ
        </h4>
        <p className="text-xs leading-relaxed text-slate-600 sm:text-sm dark:text-slate-300">
          Q. 敏感肌でも使用できますか？<br />
          A. パッチテスト済みですが、お肌に合わない場合は使用を中止してください。無香料・パラベンフリー処方です。
        </p>
      </div>
    ),
  },
];

const ACCENT = {
  rose: { text: 'text-rose-600 dark:text-rose-400', bar: 'bg-rose-600 dark:bg-rose-400' },
  indigo: { text: 'text-indigo-600 dark:text-indigo-400', bar: 'bg-indigo-600 dark:bg-indigo-400' },
  emerald: { text: 'text-emerald-600 dark:text-emerald-400', bar: 'bg-emerald-600 dark:bg-emerald-400' },
  amber: { text: 'text-amber-600 dark:text-amber-400', bar: 'bg-amber-600 dark:bg-amber-400' },
} as const;

export interface TabsProps {
  accent?: keyof typeof ACCENT;
  stiffness?: number;
  damping?: number;
  contentDuration?: number;
  contentOffset?: number;
}

// --- 完全レスポンシブ調整済み タブコンポーネント ---
export const AnimatedUnderlineTabs = memo(({
  accent = 'rose',
  stiffness = 380,
  damping = 30,
  contentDuration = 0.2,
  contentOffset = 8,
}: TabsProps) => {
  const ac = ACCENT[accent];
  const [activeTabId, setActiveTabId] = useState<string>(TAB_ITEMS[0].id);

  const activeTab = TAB_ITEMS.find((tab) => tab.id === activeTabId) || TAB_ITEMS[0];

  return (
    <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6 dark:border-slate-800 dark:bg-slate-900">
      {/* タブナビゲーション領域 */}
      <div className="relative flex border-b border-slate-200 overflow-x-auto sm:overflow-x-visible [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden dark:border-slate-800">
        {TAB_ITEMS.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === activeTabId;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`relative flex items-center justify-center space-x-1.5 px-3 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors shrink-0 sm:shrink sm:flex-1 sm:space-x-2 sm:px-2 sm:py-3 sm:text-sm ${
                isActive
                  ? ac.text
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
              <span>{tab.label}</span>

              {/* アクティブ時の下線 */}
              {isActive && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className={`absolute bottom-0 left-0 right-0 h-0.5 ${ac.bar}`}
                  transition={{ type: 'spring', stiffness, damping }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* コンテンツ領域 */}
      <div className="mt-4 min-h-[100px] sm:mt-6 sm:min-h-[120px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab.id}
            initial={{ opacity: 0, y: contentOffset }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -contentOffset }}
            transition={{ duration: contentDuration }}
          >
            {activeTab.content}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
});

AnimatedUnderlineTabs.displayName = 'AnimatedUnderlineTabs';

// --- メインコンポーネント ---
export default function App() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 sm:p-6 dark:bg-slate-950">
      <div className="mb-6 text-center">
        {/* 改行位置をレスポンシブでコントロールしたタイトル */}
        <h2 className="text-xl font-bold text-slate-800 sm:text-2xl dark:text-slate-100">
          <span className="block sm:inline">アニメーションタブ</span>
          <span className="block sm:inline">（PC/SP表示最適化）</span>
        </h2>
        
        {/* 改行位置をレスポンシブでコントロールした説明文 */}
        <p className="mt-1.5 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
          <span className="block sm:inline">PCサイズでは均等配置、</span>
          <span className="block sm:inline">スマホサイズでは横スワイプに対応しています。</span>
        </p>
      </div>

      <AnimatedUnderlineTabs />
    </div>
  );
}