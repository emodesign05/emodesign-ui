import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Mail, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';

// --- インラインメルマガ登録フォームコンポーネント ---
const THEMES = {
  cyan: { grad: 'from-cyan-500 to-indigo-600', text: 'text-cyan-400', blob: 'bg-cyan-500/20' },
  emerald: { grad: 'from-emerald-500 to-teal-600', text: 'text-emerald-400', blob: 'bg-emerald-500/20' },
  rose: { grad: 'from-rose-500 to-orange-500', text: 'text-rose-400', blob: 'bg-rose-500/20' },
  violet: { grad: 'from-violet-500 to-fuchsia-600', text: 'text-violet-400', blob: 'bg-violet-500/20' },
} as const;

export interface NewsletterProps {
  theme?: keyof typeof THEMES;
  loadingMs?: number;
  duration?: number;
  radius?: number;
}

export const InlineNewsletterSignupBar = memo(({
  theme = 'cyan',
  loadingMs = 1500,
  duration = 0.2,
  radius,
}: NewsletterProps) => {
  const th = THEMES[theme];
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // フォーム送信処理ハンドラー
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 簡易バリデーションチェック
    if (!email || !email.includes('@')) {
      setErrorMessage('有効なメールアドレスを入力してください');
      return;
    }

    setErrorMessage('');
    setStatus('loading');

    // 通信処理をシミュレート（1.5秒後に完了）
    setTimeout(() => {
      setStatus('success');
    }, loadingMs);
  };

  return (
    <div style={radius === undefined ? undefined : { borderRadius: radius }}
      className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-xl sm:rounded-3xl sm:p-8">
      {/* 背景のAI・IT風グラデーション光沢エフェクト */}
      <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className={`absolute -bottom-10 -right-10 h-40 w-40 rounded-full blur-3xl ${th.blob}`} />

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {status !== 'success' ? (
            // 1. メルマガ入力フォーム画面
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration }}
            >
              {/* ヘッダーエリア */}
              <div className={`flex items-center space-x-2 text-xs font-semibold ${th.text}`}>
                <Sparkles className="h-4 w-4" />
                <span>AI & IT Development Weekly</span>
              </div>

              <h3 className="mt-2 text-xl font-bold text-white sm:text-2xl">
                <span className="block sm:inline">最先端AI開発の技術トレンドを</span>
                <span className="block sm:inline">毎週あなたへ</span>
              </h3>

              <p className="mt-2 text-xs leading-relaxed text-slate-400 sm:text-sm">
                <span className="block sm:inline">最新のLLM活用事例、フロントエンド技術、</span>
                <span className="block sm:inline">開発ノウハウを厳選してお届けします（無料・解除自由）。</span>
              </p>

              {/* フォーム入力エリア */}
              <form onSubmit={handleSubmit} className="mt-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="relative flex-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      disabled={status === 'loading'}
                      className="w-full rounded-xl border border-slate-700 bg-slate-800/80 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 transition-all focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-50"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className={`flex shrink-0 items-center justify-center space-x-2 rounded-xl bg-gradient-to-r px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:opacity-95 active:scale-95 disabled:opacity-50 ${th.grad}`}
                  >
                    {status === 'loading' ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>送信中...</span>
                      </>
                    ) : (
                      <>
                        <span>無料で購読する</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>

                {/* エラーメッセージ表示 */}
                {errorMessage && (
                  <p className="mt-2 text-xs text-rose-400">{errorMessage}</p>
                )}
              </form>
            </motion.div>
          ) : (
            // 2. 送信完了画面
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center py-4 text-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h4 className="mt-3 text-lg font-bold text-white">ご登録ありがとうございます！</h4>
              <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                確認メールをお送りしました。次回の配信をどうぞお楽しみに！
              </p>
              <button
                onClick={() => {
                  setStatus('idle');
                  setEmail('');
                }}
                className="mt-4 text-xs text-cyan-400 underline underline-offset-4 hover:text-cyan-300"
              >
                別のメールアドレスで登録する
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});

InlineNewsletterSignupBar.displayName = 'InlineNewsletterSignupBar';

// --- メインコンポーネント ---
export default function App() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-4 sm:p-6">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-white sm:text-2xl">
          <span className="block sm:inline">メルマガ登録フォーム</span>
          <span className="block sm:inline">（Inline Newsletter Signup Bar）</span>
        </h2>
        <p className="mt-1.5 text-xs text-slate-400 sm:text-sm">
          <span className="block sm:inline">IT・AI開発事業向けの技術ニュースレター購読フォーム。</span>
          <span className="block sm:inline">送信完了アニメーションと入力チェック付きです。</span>
        </p>
      </div>

      <InlineNewsletterSignupBar />
    </div>
  );
}