import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Layers, CheckCircle2 } from 'lucide-react';

// ==========================================
// 1. ライトモード向けグラスモーフィズムコンテナ本体
// ==========================================
export const GlassmorphismCardLight: React.FC<{ blur?: number; cardOpacity?: number; radius?: number; lift?: number; orbStrength?: number }> = ({ blur = 40, cardOpacity = 0.5, radius = 24, lift = 8, orbStrength = 1 }) => {
  return (
    <div className="relative flex items-center justify-center min-h-[600px] w-full p-6 bg-slate-50 overflow-hidden rounded-3xl">
      
      {/* 背景：すりガラス効果を引き立てる鮮やかなメッシュグラデーションオーブ */}
      <div className="pointer-events-none absolute inset-0" style={{ opacity: orbStrength }}>
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-tr from-pink-400 to-rose-300 rounded-full blur-[70px] opacity-70 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/3 translate-y-1/3 w-96 h-96 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full blur-[80px] opacity-60 pointer-events-none" />
      <div className="absolute top-1/2 right-1/3 -translate-y-1/2 w-64 h-64 bg-amber-300 rounded-full blur-[60px] opacity-50 pointer-events-none" />
      </div>

      {/* グラスモーフィズムカード本体 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -lift, scale: 1.01 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        style={{ borderRadius: radius, backgroundColor: `rgba(255,255,255,${cardOpacity})`, backdropFilter: `blur(${blur}px)`, WebkitBackdropFilter: `blur(${blur}px)` }}
        className="relative w-full max-w-md p-8 border border-white/80 shadow-[0_20px_50px_rgba(0,0,0,0.08)] overflow-hidden group"
      >
        {/* ガラス上面の薄いハイライト反射光 */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />

        {/* カード内コンテンツ */}
        <div className="relative z-10 space-y-6">
          {/* 上部タグ・アイコン */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/80 text-indigo-600 border border-white/90 shadow-sm backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Light Glassmorphism
            </span>
            <div className="p-2.5 rounded-2xl bg-white/60 border border-white/80 text-slate-700 shadow-sm">
              <Layers className="w-4 h-4" />
            </div>
          </div>

          {/* タイトルと説明文 */}
          <div className="space-y-2">
            <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">
              美しいすりガラスの質感
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              背後のメッシュグラデーションがリアルタイムで綺麗に透けて見えます。可読性を維持しつつ高級感を演出できます。
            </p>
          </div>

          {/* 特徴箇条書き */}
          <div className="space-y-2.5 pt-2 border-t border-slate-900/5">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span>鮮やかな背景を透かす `backdrop-blur-2xl`</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span>白鏡面反射をのせた立体境界線</span>
            </div>
          </div>

          {/* アクションボタン */}
          <button className="w-full py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-xl shadow-slate-900/10 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer group/btn">
            <span>コンポーネントを試す</span>
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ==========================================
// 2. メインアプリケーション実行
// ==========================================
export default function App() {
  return (
    <div className="min-h-screen bg-slate-200 flex items-center justify-center p-4">
      <GlassmorphismCardLight />
    </div>
  );
}