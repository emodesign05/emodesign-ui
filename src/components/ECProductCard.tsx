import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Sparkles, Tag } from 'lucide-react';

// ==========================================
// 1. ECサイト向け商品カードコンポーネント本体
// ==========================================
interface ProductCardLightProps {
  imageSrc?: string;
  brand?: string;
  title?: string;
  price?: number;
  originalPrice?: number;
  discountBadge?: string;
}

export const ProductCardLight: React.FC<ProductCardLightProps> = ({
  // 「画像アドレスをコピー（画像リンクをコピー）」のリンクを貼る
  imageSrc = 'https://images.unsplash.com/photo-1598554793905-075f7b355cd9?q=80&w=1587&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  brand = 'URBAN STYLE',
  title = 'リラックスフィット コットン タンクトップ',
  price = 4800,
  originalPrice = 6000,
  discountBadge = '20% OFF',
}) => {
  // お気に入り（ハート）ボタンの状態管理
  const [isLiked, setIsLiked] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="group relative w-full max-w-sm rounded-2xl bg-white border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
    >
      {/* 1. 商品画像エリア */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <motion.img
          src={imageSrc}
          alt={title}
          whileHover={{ scale: 1.06 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full h-full object-cover"
        />

        {/* 割引セールバッジ（左上） */}
        {discountBadge && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500 text-white shadow-sm">
              <Tag className="w-3 h-3" />
              {discountBadge}
            </span>
          </div>
        )}

        {/* お気に入り（ハート）ボタン（右上） */}
        <button
          onClick={() => setIsLiked(!isLiked)}
          className="absolute top-3 right-3 p-2.5 rounded-full bg-white/90 hover:bg-white text-slate-600 shadow-md backdrop-blur-md transition-transform active:scale-90 cursor-pointer"
          aria-label="お気に入りに追加"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isLiked ? 'fill-rose-500 text-rose-500' : 'text-slate-600'
            }`}
          />
        </button>
      </div>

      {/* 2. 商品情報エリア */}
      <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          {/* ブランド名 */}
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {brand}
          </p>

          {/* 商品タイトル */}
          <h3 className="text-base font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
            {title}
          </h3>
        </div>

        {/* 3. 価格 & カート追加アクション */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          {/* 価格表示 */}
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-slate-900">
              ¥{price.toLocaleString()}
            </span>
            {originalPrice && (
              <span className="text-xs text-slate-400 line-through font-medium">
                ¥{originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* カートに入れるボタン */}
          <button className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs shadow-md transition-all duration-200 flex items-center gap-1.5 cursor-pointer active:scale-95">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>カートに追加</span>
          </button>
        </div>
      </div>
    </motion.article>
  );
};

// ==========================================
// 2. 動作確認・表示用メインアプリケーション
// ==========================================
export default function App() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6 space-y-8">
      {/* ヘッダー */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          EC Product Card Showcase
        </h2>
        <p className="text-sm text-slate-500">
          ECサイト向け商品カード
        </p>
      </div>

      {/* 商品カード表示エリア */}
      <div className="flex flex-wrap gap-6 items-center justify-center max-w-4xl w-full">
        <ProductCardLight />
      </div>
    </div>
  );
}