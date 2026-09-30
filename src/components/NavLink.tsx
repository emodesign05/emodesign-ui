import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Menu, X, ArrowRight } from 'lucide-react';

// --- ナビゲーションリンクのデータ構造定義 ---
interface NavLink {
  label: string;
  href: string;
}

const NAV_LINKS: NavLink[] = [
  { label: 'ホーム', href: '#' },
  { label: '特徴・機能', href: '#' },
  { label: '料金プラン', href: '#' },
  { label: '導入事例', href: '#' },
  { label: 'ドキュメント', href: '#' },
];

// --- レスポンシブ グラスモーフィズム ヘッダー コンポーネント ---
const ACCENTS = {
  indigo: { logo: 'bg-indigo-600 shadow-indigo-200', cta: 'bg-indigo-600 shadow-indigo-200 hover:bg-indigo-700', link: 'hover:text-indigo-600 dark:hover:text-indigo-400' },
  rose: { logo: 'bg-rose-600 shadow-rose-200', cta: 'bg-rose-600 shadow-rose-200 hover:bg-rose-700', link: 'hover:text-rose-600 dark:hover:text-rose-400' },
  emerald: { logo: 'bg-emerald-600 shadow-emerald-200', cta: 'bg-emerald-600 shadow-emerald-200 hover:bg-emerald-700', link: 'hover:text-emerald-600 dark:hover:text-emerald-400' },
  slate: { logo: 'bg-slate-800 shadow-slate-300', cta: 'bg-slate-800 shadow-slate-300 hover:bg-slate-900', link: 'hover:text-slate-900 dark:hover:text-white' },
} as const;

export interface HeaderProps {
  accent?: keyof typeof ACCENTS;
  brandName?: string;
  blur?: number;
  bgOpacity?: number;
  menuDuration?: number;
  menuOffset?: number;
}

export const ResponsiveGlassmorphismHeader = memo(({
  accent = 'indigo',
  brandName = 'AI Library',
  blur = 12,
  bgOpacity = 0.7,
  menuDuration = 0.2,
  menuOffset = 10,
}: HeaderProps) => {
  const ac = ACCENTS[accent];
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    // ★ relative を付与して、スマホメニューをヘッダー基準で上に重ねて配置できるようにします
    <header
      style={{ backgroundColor: `rgba(255,255,255,${bgOpacity})`, backdropFilter: `blur(${blur}px)`, WebkitBackdropFilter: `blur(${blur}px)` }}
      className="relative sticky top-0 z-50 w-full border-b border-slate-200/80 transition-colors dark:border-slate-800/80"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        
        {/* 1. ブランドロゴ */}
        <a href="#" className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-md dark:shadow-none ${ac.logo}`}>
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-base font-bold text-slate-800 sm:text-lg dark:text-slate-100">
            {brandName}
          </span>
        </a>

        {/* 2. PC用ナビゲーションリンク */}
        <nav className="hidden items-center space-x-1 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={`rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100/80 dark:text-slate-300 dark:hover:bg-slate-800/80 ${ac.link}`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* 3. PC用 CTAボタン */}
        <div className="hidden items-center space-x-3 md:flex">
          <button className="rounded-xl px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
            ログイン
          </button>
          <button className={`flex items-center space-x-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-md transition-all dark:shadow-none ${ac.cta}`}>
            <span>無料体験する</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* 4. スマホ用 ハンバーガーボタン */}
        <button
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white/80 text-slate-600 shadow-sm md:hidden dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300"
          aria-label="モバイルメニューを開く"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* 5. スマホ用 ドロップダウンメニュー（★メインコンテンツに「かぶせる」絶対配置仕様） */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -menuOffset }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -menuOffset }}
            transition={{ duration: menuDuration, ease: 'easeOut' }}
            // ★ absolute top-full left-0 right-0 でメインコンテンツの上に重ねて表示
            className="absolute left-0 right-0 top-full z-50 overflow-hidden border-b border-slate-200/80 bg-white/95 shadow-2xl backdrop-blur-xl md:hidden dark:border-slate-800/80 dark:bg-slate-950/95"
          >
            <div className="space-y-1.5 px-4 pb-6 pt-3">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 dark:text-slate-200 dark:hover:bg-slate-800/60 dark:hover:text-indigo-400"
                >
                  {link.label}
                </a>
              ))}

              {/* スマホ用 ボタンエリア */}
              <div className="mt-4 flex flex-col space-y-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                <button className="w-full rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800">
                  ログイン
                </button>
                <button className={`flex w-full items-center justify-center space-x-1.5 rounded-xl py-2.5 text-xs font-bold text-white shadow-md dark:shadow-none ${ac.cta}`}>
                  <span>無料体験する</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
});

ResponsiveGlassmorphismHeader.displayName = 'ResponsiveGlassmorphismHeader';

// --- メインコンポーネント（重なり確認用のデモ画面） ---
export function HeaderDemo(props: HeaderProps) {
  return (
    <div className="min-h-[200vh] bg-slate-50 dark:bg-slate-950">
      {/* ヘッダーコンポーネント */}
      <ResponsiveGlassmorphismHeader {...props} />

      {/* メインコンテンツ（メニュー開閉時に下が位置ズレしないことを確認できます） */}
      <main className="mx-auto max-w-4xl px-4 py-12 text-center sm:px-6">
        <h2 className="text-2xl font-bold text-slate-800 sm:text-3xl dark:text-slate-100">
          重なり表示（オーバーレイ）の確認デモ
        </h2>
        <p className="mt-3 text-xs leading-relaxed text-slate-500 sm:text-sm dark:text-slate-400">
          スマホサイズで右上のハンバーガーボタンを押しても、このテキストや下のカードの位置が下に押し下げられず、メニューが上にかぶさるように展開されます。
        </p>

        {/* サンプルカード群 */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="h-48 rounded-3xl bg-gradient-to-tr from-indigo-500 to-purple-500 p-6 text-white shadow-lg flex items-center justify-center font-bold">
            メインコンテンツ A
          </div>
          <div className="h-48 rounded-3xl bg-gradient-to-tr from-rose-500 to-amber-500 p-6 text-white shadow-lg flex items-center justify-center font-bold">
            メインコンテンツ B
          </div>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return <HeaderDemo />;
}
