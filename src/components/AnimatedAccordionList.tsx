import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

// --- アコーディオンのデータ型定義 ---
interface AccordionItemData {
  id: number;
  question: string;
  answer: string;
}

// サンプルデータ（FAQリスト）
const FAQ_ITEMS: AccordionItemData[] = [
  {
    id: 1,
    question: '商用利用は可能ですか？',
    answer: 'はい、個人利用・商用利用を問わず、すべてのプロジェクトでご自由にご利用いただけます。クレジッ表示も不要です。',
  },
  {
    id: 2,
    question: '他のライブラリを追加でインストールする必要はありますか？',
    answer: 'いいえ、前提スタックである React, Tailwind CSS, Framer Motion, Lucide React が導入されていれば、コードをコピー＆ペーストするだけで即座に動作します。',
  },
  {
    id: 3,
    question: 'ダークモードに対応していますか？',
    answer: 'はい、Tailwind CSSの `dark:` クラスに対応しているため、OSやアプリケーションのダークモード設定に合わせて自動で配色が切り替わります。',
  },
  {
    id: 4,
    question: '開閉のアニメーション速度を変更することはできますか？',
    answer: 'はい、Framer Motionの `transition` プロパティ（`duration` の値）を変更することで、お好みのスピードに調整可能です。',
  },
];

// --- 個別アコーディオンアイテム（memo化） ---
const AccordionItem = memo(
  ({
    item,
    isOpen,
    onToggle,
    duration,
    radius,
  }: {
    item: AccordionItemData;
    isOpen: boolean;
    onToggle: () => void;
    duration: number;
    radius: number;
  }) => {
    return (
      <div style={{ borderRadius: radius }} className="overflow-hidden border border-slate-200 bg-white transition-colors dark:border-slate-800 dark:bg-slate-900">
        {/* ヘッダーボタン（クリックで開閉） */}
        <button
          onClick={onToggle}
          className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
          aria-expanded={isOpen}
        >
          <span className="flex items-center space-x-3 text-base font-bold text-slate-800 dark:text-slate-100">
            <HelpCircle className="h-5 w-5 text-indigo-500 shrink-0" />
            <span>{item.question}</span>
          </span>
          
          {/* 矢印アイコン（開閉に合わせて180度回転） */}
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="text-slate-400 shrink-0 ml-2"
          >
            <ChevronDown className="h-5 w-5" />
          </motion.div>
        </button>

        {/* コンテンツ領域（高さの可変アニメーション） */}
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              key="content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration, ease: 'easeInOut' }}
            >
              <div className="border-t border-slate-100 p-5 pt-3 text-sm leading-relaxed text-slate-600 dark:border-slate-800/80 dark:text-slate-300">
                {item.answer}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

AccordionItem.displayName = 'AccordionItem';

// --- メインコンポーネント ---
export function AnimatedAccordionList({
  duration = 0.3,
  singleOpen = true,
  radius = 16,
  heading = 'よくある質問（FAQ）',
}: {
  duration?: number;
  singleOpen?: boolean;
  radius?: number;
  heading?: string;
}) {
  // 開いている項目のIDを保持（空配列ならすべて閉じている状態）
  const [openIds, setOpenIds] = useState<number[]>([1]); // 初期状態で1番目を開く

  const handleToggle = (id: number) => {
    setOpenIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : singleOpen ? [id] : [...prev, id]));
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 dark:bg-slate-950">
      <div className="w-full max-w-lg">
        {/* セクションタイトル */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{heading}</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            ご不明な点がございましたら、以下の回答をご確認ください。
          </p>
        </div>

        {/* アコーディオンリスト */}
        <div className="space-y-3">
          {FAQ_ITEMS.map((item) => (
            <AccordionItem
              key={item.id}
              item={item}
              isOpen={openIds.includes(item.id)}
              onToggle={() => handleToggle(item.id)}
              duration={duration}
              radius={radius}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return <AnimatedAccordionList />;
}
