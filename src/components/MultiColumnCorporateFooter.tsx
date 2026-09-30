import { useState, memo } from 'react';
import { motion } from 'framer-motion';
// ★アイコンのインポート名をLucide Reactの標準仕様に合わせて修正
import { Sparkles, Globe, Code2, Share2, MessageSquare, Send, Heart } from 'lucide-react';

// --- コーポレート フッター メインコンポーネント ---
const ACCENTS = {
  indigo: { brand: 'text-indigo-400', sns: 'hover:border-indigo-500 hover:bg-indigo-600', link: 'hover:text-indigo-400', btn: 'bg-indigo-600 hover:bg-indigo-500' },
  rose: { brand: 'text-rose-400', sns: 'hover:border-rose-500 hover:bg-rose-600', link: 'hover:text-rose-400', btn: 'bg-rose-600 hover:bg-rose-500' },
  emerald: { brand: 'text-emerald-400', sns: 'hover:border-emerald-500 hover:bg-emerald-600', link: 'hover:text-emerald-400', btn: 'bg-emerald-600 hover:bg-emerald-500' },
  amber: { brand: 'text-amber-400', sns: 'hover:border-amber-500 hover:bg-amber-600', link: 'hover:text-amber-400', btn: 'bg-amber-600 hover:bg-amber-500' },
} as const;

export interface FooterProps {
  accent?: keyof typeof ACCENTS;
  brandName?: string;
  showNewsletter?: boolean;
  showSns?: boolean;
  subscribedMs?: number;
}

export const MultiColumnCorporateFooter = memo(({
  accent = 'indigo',
  brandName = 'AI Component Library',
  showNewsletter = true,
  showSns = true,
  subscribedMs = 3000,
}: FooterProps) => {
  const ac = ACCENTS[accent];
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  // メルマガ送信ハンドラー
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      setIsSubscribed(true);
      setTimeout(() => {
        setIsSubscribed(false);
        setEmail('');
      }, subscribedMs);
    }
  };

  return (
    <footer className="w-full border-t border-slate-800 bg-slate-950 text-slate-400">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 sm:py-16">
        {/* ================================================== */}
        {/* メインフッターエリア（多列グリッド配置） */}
        {/* ================================================== */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5 lg:gap-8">
          
          {/* 列1: ブランドロゴ ＆ 会社概要（2列分使用） */}
          <div className="lg:col-span-2 space-y-4">
            <div className={`flex items-center space-x-2 ${ac.brand}`}>
              <Sparkles className="h-6 w-6" />
              <span className="text-xl font-bold text-white">{brandName}</span>
            </div>

            <p className="max-w-sm text-xs leading-relaxed text-slate-400 sm:text-sm">
              React、Tailwind CSS、Framer Motionを活用し、コピペで即動作する高品質なUIコンポーネントを提供する次世代ライブラリ。開発スピードを最大化します。
            </p>

            {/* SNS・コミュニティ アイコンリンク */}
            {showSns && <div className="flex items-center space-x-3 pt-2">
              {[
                { icon: Globe, href: '#', label: 'Webサイト' },
                { icon: Code2, href: '#', label: 'リポジトリ' },
                { icon: Share2, href: '#', label: 'シェア' },
                { icon: MessageSquare, href: '#', label: 'コミュニティ' },
              ].map((sns) => {
                const Icon = sns.icon;
                return (
                  <a
                    key={sns.label}
                    href={sns.href}
                    aria-label={sns.label}
                    className={`flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/80 text-slate-400 transition-all hover:text-white ${ac.sns}`}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>}
          </div>

          {/* 列2: プロダクト / サービスナビ */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 sm:text-sm">
              プロダクト
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              {['コンポーネント一覧', 'テンプレート', '料金プラン', '更新履歴 (Changelog)', 'ロードマップ'].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className={`transition-colors hover:underline hover:underline-offset-4 ${ac.link}`}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* 列3: 会社情報 / リソース */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 sm:text-sm">
              企業情報
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              {['会社概要', '採用情報 (Careers)', '公式ブログ', 'お問い合わせ', 'パートナーシップ'].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className={`transition-colors hover:underline hover:underline-offset-4 ${ac.link}`}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* 列4: メルマガ登録ミニフォーム */}
          {showNewsletter && <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 sm:text-sm">
              最新情報をお届け
            </h3>
            <p className="text-xs text-slate-400">
              新着コンポーネントや開発ノウハウを毎週無料でお届けします。
            </p>

            <form onSubmit={handleSubscribe} className="mt-2 space-y-2">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2.5 pl-3.5 pr-10 text-xs text-white placeholder-slate-500 outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className={`absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-lg text-white transition-all ${ac.btn}`}
                  aria-label="送信"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>

              {isSubscribed && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[11px] font-semibold text-emerald-400"
                >
                  ご登録ありがとうございます！
                </motion.p>
              )}
            </form>
          </div>}
        </div>

        {/* ================================================== */}
        {/* 最下部エリア（コピーライト ＆ 法的リンク） */}
        {/* ================================================== */}
        <div className="mt-12 flex flex-col items-center justify-between border-t border-slate-800/80 pt-8 gap-4 sm:flex-row text-xs">
          {/* コピーライト */}
          <p className="flex items-center space-x-1 text-slate-500">
            <span>© 2026 AI Component Library Inc. Crafted with</span>
            <Heart className="h-3.5 w-3.5 text-rose-500 fill-current inline" />
            <span>for developers.</span>
          </p>

          {/* 法的規約リンク */}
          <div className="flex flex-wrap items-center gap-4 text-slate-500">
            <a href="#" className="hover:text-slate-300 transition-colors">プライバシーポリシー</a>
            <a href="#" className="hover:text-slate-300 transition-colors">利用規約</a>
            <a href="#" className="hover:text-slate-300 transition-colors">特定商取引法に基づく表記</a>
            <a href="#" className="hover:text-slate-300 transition-colors">クッキー設定</a>
          </div>
        </div>
      </div>
    </footer>
  );
});

MultiColumnCorporateFooter.displayName = 'MultiColumnCorporateFooter';

// --- メインコンポーネント（デモ画面） ---
export function FooterDemo(props: FooterProps) {
  return (
    <div className="flex min-h-screen flex-col justify-between bg-slate-900">
      {/* ページダミーコンテンツ */}
      <div className="flex flex-1 items-center justify-center p-8 text-center">
        <div>
          <h2 className="text-xl font-bold text-white sm:text-2xl">
            <span className="block sm:inline">多列コーポレートフッター</span>
            <span className="block sm:inline">（Multi-Column Corporate Footer）</span>
          </h2>
          <p className="mt-2 text-xs text-slate-400 sm:text-sm">
            スクロールしてページ最下部のフッターデザインをご確認ください。
          </p>
        </div>
      </div>

      {/* フッターコンポーネント */}
      <MultiColumnCorporateFooter {...props} />
    </div>
  );
}

export default function App() {
  return <FooterDemo />;
}
