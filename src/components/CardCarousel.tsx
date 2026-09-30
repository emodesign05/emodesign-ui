import { useState, memo } from 'react';
import { motion, type PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, ArrowRight } from 'lucide-react';

// --- カードデータ型定義 ---
interface CardData {
  id: number;
  title: string;
  category: string;
  price: string;
  rating: number;
  imageUrl: string;
}

// サンプルデータ（3番目の画像URLを修正済み）
const CAROUSEL_ITEMS: CardData[] = [
  {
    id: 1,
    title: 'アドバンスド ナイトセラム',
    category: '美容液',
    price: '¥8,800',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 2,
    title: 'ディープモイスト ローション',
    category: '化粧水',
    price: '¥5,200',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 3,
    title: 'リペア フェイシャルクリーム',
    category: '保湿クリーム',
    price: '¥9,500',
    rating: 4.9,
    // ★画像リンクエラーを解消した新しい画像URL
    imageUrl: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 4,
    title: 'UVプロテクト エッセンス',
    category: '日焼け止め',
    price: '¥4,100',
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=600&q=80',
  },
];

// --- タッチ対応カルーセルコンポーネント（外枠なし・修正版） ---
export interface CarouselProps {
  stiffness?: number;
  damping?: number;
  swipeThreshold?: number;
  dragElastic?: number;
}

export const TouchEnabledCarousel = memo(({
  stiffness = 300,
  damping = 30,
  swipeThreshold = 50,
  dragElastic = 0.2,
}: CarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // 前のカードへ戻る
  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? CAROUSEL_ITEMS.length - 1 : prev - 1));
  };

  // 次のカードへ進む
  const handleNext = () => {
    setCurrentIndex((prev) => (prev === CAROUSEL_ITEMS.length - 1 ? 0 : prev + 1));
  };

  // ドラッグ終了時のスワイプ検知判定
  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -swipeThreshold) {
      handleNext();
    } else if (info.offset.x > swipeThreshold) {
      handlePrev();
    }
  };

  return (
    // ★修正ポイント: 一番外側の囲みカード枠（border, bg-white, p-6等）を削除しシンプルに保持
    <div className="relative w-full max-w-xl">
      
      {/* カルーセル表示エリア */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl">
        <motion.div
          className="flex cursor-grab active:cursor-grabbing"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={dragElastic}
          onDragEnd={handleDragEnd}
          animate={{ translateX: `-${currentIndex * 100}%` }}
          transition={{ type: 'spring', stiffness, damping }}
        >
          {CAROUSEL_ITEMS.map((item) => (
            <div
              key={item.id}
              className="w-full shrink-0"
            >
              {/* 商品カード本体 */}
              <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                {/* 商品画像 */}
                <div className="relative h-56 w-full overflow-hidden rounded-xl bg-slate-100 sm:h-64 dark:bg-slate-800">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    draggable={false}
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-800 backdrop-blur-md dark:bg-slate-900/90 dark:text-slate-100">
                    {item.category}
                  </span>
                </div>

                {/* カードテキストコンテンツ */}
                <div className="mt-3 p-1">
                  <div className="flex items-center space-x-1 text-xs font-bold text-amber-500">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <span>{item.rating}</span>
                  </div>

                  <h3 className="mt-1 text-base font-bold text-slate-800 sm:text-lg dark:text-slate-100">
                    {item.title}
                  </h3>

                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                    <span className="text-lg font-extrabold text-rose-600 dark:text-rose-400">
                      {item.price}
                    </span>
                    <button className="flex items-center space-x-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
                      <span>詳細を見る</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ナビゲーション操作エリア（前へ/次へボタン ＆ ドットインジケーター） */}
      <div className="mt-4 flex items-center justify-between px-1">
        {/* ドットインジケーター */}
        <div className="flex items-center space-x-1.5">
          {CAROUSEL_ITEMS.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-6 bg-rose-600 dark:bg-rose-400'
                  : 'w-2 bg-slate-300 hover:bg-slate-400 dark:bg-slate-700'
              }`}
              aria-label={`スライド ${index + 1} へ移動`}
            />
          ))}
        </div>

        {/* 左右矢印ボタン */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrev}
            className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            aria-label="前へ"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={handleNext}
            className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            aria-label="次へ"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
});

TouchEnabledCarousel.displayName = 'TouchEnabledCarousel';

// --- メインコンポーネント ---
export default function App() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 sm:p-6 dark:bg-slate-950">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-slate-800 sm:text-2xl dark:text-slate-100">
          <span className="block sm:inline">タッチ対応スライダー</span>
          <span className="block sm:inline">（Touch-Enabled Carousel）</span>
        </h2>
        <p className="mt-1.5 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
          <span className="block sm:inline">ボタン操作および指でのフリック、</span>
          <span className="block sm:inline">マウスドラッグでカードを切り替えられます。</span>
        </p>
      </div>

      <TouchEnabledCarousel />
    </div>
  );
}