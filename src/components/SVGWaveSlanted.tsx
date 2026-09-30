import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Layers } from 'lucide-react';

// ==========================================
// 1. 型定義とSVGパスデータ
// ==========================================
type DividerType = 'wave' | 'slanted' | 'curve';

interface SectionDividerLightProps {
  type?: DividerType;
  fillColor?: string; // Tailwindの文字色/背景色クラスまたはHEX指定
  className?: string;
}

// 各区切り線のSVGパスデータ
const dividerPaths: Record<DividerType, string> = {
  // 波型 (Wave)
  wave: 'M0,32L48,42.7C96,53,192,75,288,80C384,85,480,75,576,64C672,53,768,43,864,48C960,53,1056,75,1152,80C1248,85,1344,75,1392,70L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z',
  // 斜め切り (Slanted)
  slanted: 'M0,120 L1440,32 L1440,120 Z',
  // 大きなカーブ (Curve)
  curve: 'M0,120 Q720,0 1440,120 L1440,120 L0,120 Z',
};

// ==========================================
// 2. ディバイダーコンポーネント本体
// ==========================================
export const SectionDividerLight: React.FC<SectionDividerLightProps> = ({
  type = 'wave',
  fillColor = 'text-white',
  className = '',
}) => {
  return (
    <div className={`w-full overflow-hidden leading-none ${className}`}>
      <motion.svg
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        viewBox="0 0 1440 120"
        className="relative block w-full h-12 sm:h-20 md:h-28 preserve-3d"
        preserveAspectRatio="none"
      >
        <path
          d={dividerPaths[type]}
          className={`${fillColor} transition-all duration-300`}
          fill="currentColor"
        />
      </motion.svg>
    </div>
  );
};

// ==========================================
// 3. 動作確認・プレビュー表示用メインアプリケーション
// ==========================================
export default function App() {
  const [activeType, setActiveType] = useState<DividerType>('wave');

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col justify-between font-sans">
      
      {/* 1. 上部セクション（ヘッダー・ヒーローエリア） */}
      <section className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white pt-16 pb-12 px-6 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-amber-300" />
          Section Divider Component
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          Webサイトを飾る波型・斜めディバイダー
        </h1>
        <p className="text-indigo-100 max-w-lg mx-auto text-sm leading-relaxed">
          下のボタンを押して、区切り線の形状（Wave / Slanted / Curve）をリアルタイムで切り替えてみてください。
        </p>

        {/* タイプ切替ボタン */}
        <div className="flex justify-center gap-3 pt-4">
          {(['wave', 'slanted', 'curve'] as DividerType[]).map((type) => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                activeType === type
                  ? 'bg-white text-indigo-600 shadow-lg scale-105'
                  : 'bg-indigo-700/50 text-indigo-100 hover:bg-indigo-700'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </section>

      {/* 2. セクション境界線のディバイダー（上部の濃い色から下部の白背景へつなぐ） */}
      <SectionDividerLight type={activeType} fillColor="text-white" />

      {/* 3. 下部セクション（コンテンツエリア） */}
      <section className="bg-white flex-1 py-12 px-6 flex flex-col items-center justify-center text-center space-y-4">
        <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 mb-2">
          <Layers className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">
          シームレスなセクションの繋がり
        </h2>
        <p className="text-slate-500 max-w-md text-sm leading-relaxed">
          SVGコードを利用しているため、画面サイズが変わっても画像がぼやけることなく滑らかな曲線を維持します。
        </p>
      </section>

    </div>
  );
}