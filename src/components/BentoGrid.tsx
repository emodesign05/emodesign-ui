import React from 'react';
import { motion } from 'framer-motion';
import { Zap, ShieldCheck, TrendingUp, Users, ArrowUpRight } from 'lucide-react';

// ==========================================
// 1. ベントーグリッドコンポーネント本体
// ==========================================
export const BentoGridFeatures: React.FC<{ gap?: number; rowHeight?: number; radius?: number; lift?: number }> = ({ gap = 24, rowHeight = 240, radius = 24, lift = 5 }) => {
  return (
    <section className="w-full max-w-6xl mx-auto py-16 px-4">
      {/* セクションヘッダー */}
      <div className="text-center mb-12 space-y-3">
        <h2 className="text-sm font-semibold tracking-widest text-indigo-400 uppercase">
          Powerful Features
        </h2>
        <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          次世代の開発を実現する4つの強み
        </p>
      </div>

      {/* ベントーグリッドグリッド構造 */}
      <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap, gridAutoRows: rowHeight }}>
        {/* カード1: 大サイズ（横2マス分） */}
        <motion.div
          whileHover={{ y: -lift }}
          transition={{ duration: 0.2 }}
          style={{ borderRadius: radius }}
          className="md:col-span-2 md:row-span-1 bg-slate-900/80 border border-slate-800 p-8 flex flex-col justify-between relative overflow-hidden group hover:border-indigo-500/50 transition-colors shadow-xl"
        >
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all pointer-events-none" />
          <div className="flex justify-between items-start z-10">
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400">
              <Zap className="w-6 h-6" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
          </div>
          <div className="z-10 space-y-2">
            <h3 className="text-xl font-bold text-white">超高速AI処理エンジン</h3>
            <p className="text-slate-400 text-sm max-w-md leading-relaxed">
              ミリ秒単位でコードとUI構造を解析。従来の開発スピードを最大10倍に加速させます。
            </p>
          </div>
        </motion.div>

        {/* カード2: 右上（縦1マス） */}
        <motion.div
          whileHover={{ y: -lift }}
          transition={{ duration: 0.2 }}
          style={{ borderRadius: radius }}
          className="bg-slate-900/80 border border-slate-800 p-8 flex flex-col justify-between relative overflow-hidden group hover:border-purple-500/50 transition-colors shadow-xl"
        >
          <div className="flex justify-between items-start z-10">
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-purple-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
          </div>
          <div className="z-10 space-y-2">
            <h3 className="text-lg font-bold text-white">堅牢なセキュリティ</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              SOC2準拠の暗号化により、機密データを安全に保護。
            </p>
          </div>
        </motion.div>

        {/* カード3: 左下（縦1マス） */}
        <motion.div
          whileHover={{ y: -lift }}
          transition={{ duration: 0.2 }}
          style={{ borderRadius: radius }}
          className="bg-slate-900/80 border border-slate-800 p-8 flex flex-col justify-between relative overflow-hidden group hover:border-emerald-500/50 transition-colors shadow-xl"
        >
          <div className="flex justify-between items-start z-10">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
          </div>
          <div className="z-10 space-y-2">
            <h3 className="text-lg font-bold text-white">リアルタイム分析</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              ユーザーの反応やパフォーマンスを瞬時に可視化します。
            </p>
          </div>
        </motion.div>

        {/* カード4: 大サイズ（右下横2マス分） */}
        <motion.div
          whileHover={{ y: -lift }}
          transition={{ duration: 0.2 }}
          style={{ borderRadius: radius }}
          className="md:col-span-2 md:row-span-1 bg-slate-900/80 border border-slate-800 p-8 flex flex-col justify-between relative overflow-hidden group hover:border-pink-500/50 transition-colors shadow-xl"
        >
          <div className="absolute bottom-0 right-0 -mb-8 -mr-8 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl group-hover:bg-pink-500/20 transition-all pointer-events-none" />
          <div className="flex justify-between items-start z-10">
            <div className="p-3 bg-pink-500/10 border border-pink-500/20 rounded-2xl text-pink-400">
              <Users className="w-6 h-6" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
          </div>
          <div className="z-10 space-y-2">
            <h3 className="text-xl font-bold text-white">シームレスなチームコラボレーション</h3>
            <p className="text-slate-400 text-sm max-w-md leading-relaxed">
              同一プロジェクト内でのリアルタイム同時編集や、プロンプトの共有を簡単に行えます。
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// ==========================================
// 2. メインアプリケーション実行
// ==========================================
export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <BentoGridFeatures />
    </div>
  );
}