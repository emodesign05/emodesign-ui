import { memo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, CheckCircle2, Play, Code, Cpu, ShieldCheck } from 'lucide-react';

// --- スプリットレイアウト ヒーローセクション メインコンポーネント ---
const ACCENTS = {
  indigo: { badge: 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-950/80 dark:text-indigo-400 dark:border-indigo-900', cta: 'bg-indigo-600 shadow-indigo-200 hover:bg-indigo-700', orb: 'bg-indigo-500/10' },
  rose: { badge: 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/80 dark:text-rose-400 dark:border-rose-900', cta: 'bg-rose-600 shadow-rose-200 hover:bg-rose-700', orb: 'bg-rose-500/10' },
  emerald: { badge: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/80 dark:text-emerald-400 dark:border-emerald-900', cta: 'bg-emerald-600 shadow-emerald-200 hover:bg-emerald-700', orb: 'bg-emerald-500/10' },
  violet: { badge: 'bg-violet-50 text-violet-600 border-violet-100 dark:bg-violet-950/80 dark:text-violet-400 dark:border-violet-900', cta: 'bg-violet-600 shadow-violet-200 hover:bg-violet-700', orb: 'bg-violet-500/10' },
} as const;

export interface SplitHeroProps {
  accent?: keyof typeof ACCENTS;
  line1?: string;
  line2?: string;
  enterDuration?: number;
  slide?: number;
  floatDistance?: number;
  floatDuration?: number;
}

export const SplitLayoutHero = memo(({
  accent = 'indigo',
  line1 = 'Webアプリ開発を',
  line2 = '10倍アップデートする',
  enterDuration = 0.5,
  slide = 20,
  floatDistance = 12,
  floatDuration = 4,
}: SplitHeroProps) => {
  const ac = ACCENTS[accent];
  return (
    <div className="relative min-h-[85vh] w-full max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-12 dark:border-slate-800 dark:bg-slate-900">
      {/* 背景の光沢グラデーション演出 */}
      <div className={`absolute -left-20 -top-20 h-72 w-72 rounded-full blur-3xl ${ac.orb}`} />
      <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-rose-500/10 blur-3xl" />

      {/* 左右2列のスプリットレイアウト */}
      <div className="relative z-10 grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-12">
        {/* ================================================== */}
        {/* 左側コンテンツエリア（キャッチコピー ＆ CTAボタン） */}
        {/* ================================================== */}
        <motion.div
          initial={{ opacity: 0, x: -slide }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: enterDuration }}
          className="flex flex-col items-start space-y-6"
        >
          {/* 1. アナウンスバッジ */}
          <div className={`inline-flex items-center space-x-2 rounded-full border px-3.5 py-1.5 text-xs font-bold ${ac.badge}`}>
            <Sparkles className="h-3.5 w-3.5" />
            <span>次世代AI開発コンポーネント V2.0 リリース</span>
          </div>

          {/* 2. メインキャッチコピー */}
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl dark:text-white">
            <span className="block">{line1}</span>
            <span className="mt-1 block bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600 bg-clip-text text-transparent">
              {line2}
            </span>
          </h1>

          {/* 3. サブ説明文 */}
          <p className="text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-300">
            React, Tailwind CSS, Framer Motion に完全対応。コピー＆ペーストで即動作する高品質なUIコンポーネントライブラリでプロダクト制作を加速します。
          </p>

          {/* 4. チェックポイントリスト */}
          <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-slate-700 sm:text-sm dark:text-slate-300">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>商用利用OK</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>TypeScript完全対応</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>ダークモード対応</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>レスポンシブ最適化</span>
            </div>
          </div>

          {/* 5. CTAアクションボタンエリア */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button className={`flex items-center space-x-2 rounded-2xl px-6 py-3.5 text-xs font-bold text-white shadow-lg transition-all sm:text-sm dark:shadow-none ${ac.cta}`}>
              <span>ライブラリを試す</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button className="flex items-center space-x-2 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100 sm:text-sm dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
              <Play className="h-4 w-4 fill-current text-slate-500 dark:text-slate-400" />
              <span>デモ動画を見る</span>
            </button>
          </div>
        </motion.div>

        {/* ================================================== */}
        {/* 右側ビジュアルエリア（ゆらゆら浮遊するデモカード） */}
        {/* ================================================== */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: enterDuration, delay: 0.2 }}
          className="relative flex justify-center"
        >
          {/* ゆらゆら浮遊するメインカード */}
          <motion.div
            animate={{ y: [0, -floatDistance, 0] }}
            transition={{ duration: floatDuration, repeat: Infinity, ease: 'easeInOut' }}
            className="w-full max-w-md rounded-3xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-6 shadow-2xl dark:border-slate-800 dark:from-slate-800/80 dark:to-slate-900"
          >
            {/* カードヘッダー */}
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-4 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="flex h-3 w-3 rounded-full bg-rose-400" />
                <div className="flex h-3 w-3 rounded-full bg-amber-400" />
                <div className="flex h-3 w-3 rounded-full bg-emerald-400" />
              </div>
              <span className="text-xs font-mono text-slate-400">App.tsx</span>
            </div>

            {/* コード風デモ表示領域 */}
            <div className="mt-4 space-y-3 font-mono text-xs">
              <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
                <Code className="h-4 w-4" />
                <span className="font-bold">AI Component Core</span>
              </div>
              <div className="rounded-xl bg-slate-900 p-3.5 text-slate-200 shadow-inner">
                <p className="text-slate-400">// コピペで即動作するコード生成</p>
                <p className="mt-1 text-emerald-400">&lt;HeroSection layout=&quot;split&quot; /&gt;</p>
              </div>
            </div>

            {/* ミニステータスカード群 */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="flex items-center space-x-2.5 rounded-2xl bg-white p-3 border border-slate-100 shadow-sm dark:bg-slate-800/60 dark:border-slate-800">
                <Cpu className="h-5 w-5 text-indigo-500" />
                <div>
                  <p className="text-[10px] text-slate-400">応答速度</p>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100">0.02秒超高速</p>
                </div>
              </div>

              <div className="flex items-center space-x-2.5 rounded-2xl bg-white p-3 border border-slate-100 shadow-sm dark:bg-slate-800/60 dark:border-slate-800">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                <div>
                  <p className="text-[10px] text-slate-400">型安全性</p>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100">TS 100%パス</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
});

SplitLayoutHero.displayName = 'SplitLayoutHero';

// --- メインコンポーネント ---
export function SplitHeroDemo(props: SplitHeroProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 sm:p-6 dark:bg-slate-950">
      <SplitLayoutHero {...props} />
    </div>
  );
}

export default function App() {
  return <SplitHeroDemo />;
}
