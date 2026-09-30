import { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, ShoppingBag, Sparkles, Check } from 'lucide-react';

// --- モーダル本体コンポーネント（美容商品用） ---
export interface ModalTuning {
  duration?: number;
  startScale?: number;
  offset?: number;
  overlayOpacity?: number;
  blur?: number;
  radius?: number;
  closeDelay?: number;
}

interface BeautyProductModalProps extends ModalTuning {
  isOpen: boolean;
  onClose: () => void;
}

export const BeautyProductModal = memo(({
  isOpen,
  onClose,
  duration = 0.2,
  startScale = 0.95,
  offset = 10,
  overlayOpacity = 0.6,
  blur = 4,
  radius = 24,
  closeDelay = 1200,
}: BeautyProductModalProps) => {
  const [isAdded, setIsAdded] = useState(false);

  // Esc キーでモーダルを閉じる処理 ＆ 背面スクロールの固定
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // カート追加ボタンのクリックハンドラー
  const handleAddToCart = () => {
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, closeDelay);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* 1. 背景オーバーレイ（黒透過 ＋ クリックで閉じる） */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration }}
            onClick={onClose}
            style={{ backgroundColor: `rgba(15,23,42,${overlayOpacity})`, backdropFilter: `blur(${blur}px)`, WebkitBackdropFilter: `blur(${blur}px)` }}
            className="fixed inset-0"
            aria-hidden="true"
          />

          {/* 2. モーダルコンテンツ */}
          <motion.div
            initial={{ opacity: 0, scale: startScale, y: offset }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: startScale, y: offset }}
            transition={{ duration, ease: 'easeOut' }}
            style={{ borderRadius: radius }}
            className="relative z-10 max-h-[90vh] w-full max-w-xl overflow-y-auto border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            role="dialog"
            aria-modal="true"
          >
            {/* 閉じるボタン（右上） */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-20 rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-800 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100"
              aria-label="モーダルを閉じる"
            >
              <X className="h-5 w-5" />
            </button>

            {/* 商品画像領域 */}
            <div className="relative h-64 w-full overflow-hidden rounded-2xl bg-rose-50 dark:bg-slate-800">
              <img
                src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80"
                alt="アドバンスド ナイト セラム"
                className="h-full w-full object-cover"
              />
              <span className="absolute left-3 top-3 inline-flex items-center space-x-1 rounded-full bg-rose-500/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5" />
                <span>人気No.1 美容液</span>
              </span>
            </div>

            {/* 商品詳細情報 */}
            <div className="mt-5 space-y-4">
              {/* タイトル ＆ 価格 */}
              <div>
                <div className="flex items-center space-x-2 text-xs font-medium text-amber-500">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="font-bold text-slate-700 dark:text-slate-300">4.9</span>
                  <span className="text-slate-400">(248件のレビュー)</span>
                </div>

                <h3 className="mt-1 text-xl font-bold text-slate-800 dark:text-slate-100">
                  アドバンスド モイスチャー ナイトセラム (30ml)
                </h3>
                
                <div className="mt-2 flex items-baseline space-x-2">
                  <span className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
                    ¥8,800
                  </span>
                  <span className="text-xs text-slate-400">（税込 / 送料無料）</span>
                </div>
              </div>

              {/* 主要成分タグ */}
              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">注目の配合成分</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {['ナイアシンアミド', '高濃度ヒアルロン酸', 'セラミドComplex', 'レチノール誘導体'].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 dark:bg-rose-950/50 dark:text-rose-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* 商品説明文 */}
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                睡眠中の肌にたっぷりと潤いを与え、ハリとツヤのある輝く素肌へ導く高保湿美容液。みずみずしいテクスチャーが角質層のすみずみまで浸透し、乾燥による小じわを目立たなくします。
              </p>

              {/* 使用方法ミニガイド */}
              <div className="rounded-xl bg-slate-50 p-3.5 dark:bg-slate-800/50">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">ご使用方法</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  夜のお手入れ時、化粧水で肌を整えた後、スポイト1回分（100円玉大）を手に取り、顔全体から首筋にかけて優しくなじませてください。
                </p>
              </div>

              {/* アクションエリア（カート追加ボタン） */}
              <div className="pt-2">
                <button
                  onClick={handleAddToCart}
                  disabled={isAdded}
                  className={`flex w-full items-center justify-center space-x-2 rounded-xl py-3.5 text-sm font-semibold transition-all ${
                    isAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-rose-600 text-white shadow-lg shadow-rose-200 hover:bg-rose-700 dark:shadow-none'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>カートに追加しました！</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="h-4 w-4" />
                      <span>カートに追加する</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
});

BeautyProductModal.displayName = 'BeautyProductModal';

// --- メインコンポーネント ---
export function ModalDemo(props: ModalTuning) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 dark:bg-slate-950">
      <div className="text-center">
        <h2 className="mb-2 text-2xl font-bold text-slate-800 dark:text-slate-100">
          美容コスメ商品カード
        </h2>
        <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
          「詳細を見る」ボタンをクリックすると商品の詳細説明モーダルが開きます。
        </p>

        {/* 商品トリガーカード */}
        <div className="mx-auto w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="h-48 w-full overflow-hidden rounded-xl bg-slate-100">
            <img
              src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=500&q=80"
              alt="商品サムネイル"
              className="h-full w-full object-cover"
            />
          </div>
          <h3 className="mt-3 text-sm font-bold text-slate-800 dark:text-slate-100">
            ナイトセラム (30ml)
          </h3>
          <p className="mt-1 text-sm font-extrabold text-rose-600 dark:text-rose-400">¥8,800</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-3 w-full rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            詳細を見る
          </button>
        </div>
      </div>

      {/* 美容系商品詳細モーダル */}
      <BeautyProductModal
        {...props}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return <ModalDemo />;
}
