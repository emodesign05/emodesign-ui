import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Megaphone, Pause, Play, RotateCcw, X } from 'lucide-react';

/* =========================================================
 * お知らせバー（Announcement Bar）
 * - ページ最上部に置く細い告知帯。キャンペーン・営業日・新サービスなどの告知に
 * - 各メッセージにリンクを付けられる（「詳しく見る →」）
 * - 閉じるボタンで非表示 → localStorage に記録し、次回訪問時も表示しない
 *   （プライベートブラウズ等で localStorage が使えない場合も try/catch で落ちない）
 *   storageKey を変えると「新しいお知らせ」として再表示できる
 * - mode = 'rotate'：複数メッセージを一定間隔で自動切替（下からスライド）
 *   mode = 'marquee'：全メッセージを横に流す（電光掲示板風）。ホバー / フォーカスで停止
 * - 自動で動く表示には一時停止ボタンを付ける（WCAG 2.2.2 対応）
 * - reduced-motion 時：マーキーは流さず先頭のメッセージを静止表示、切替はフェードのみ
 * ========================================================= */

export type Announcement = { text: string; href?: string; linkLabel?: string };

const THEMES = {
  dark: 'bg-slate-900 text-slate-100 dark:bg-slate-100 dark:text-slate-900',
  indigo: 'bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-white',
  emerald: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white',
  amber: 'bg-amber-300 text-amber-950',
} as const;

type Props = {
  /** 表示するメッセージ（リンク付き可） */
  messages?: Announcement[];
  /** 表示方法：static＝1件目のみ / rotate＝自動切替 / marquee＝流れる文字 */
  mode?: 'static' | 'rotate' | 'marquee';
  /** 自動切替の間隔（秒） */
  interval?: number;
  /** マーキーの速さ（px/秒） */
  speed?: number;
  /** 配色 */
  theme?: keyof typeof THEMES;
  /** 閉じるボタンを表示 */
  dismissible?: boolean;
  /** 非表示状態を保存する localStorage のキー */
  storageKey?: string;
};

const DEFAULT_MESSAGES: Announcement[] = [
  { text: '秋の制作キャンペーン実施中｜LP制作が10月末まで15%オフ', href: '#campaign', linkLabel: '詳しく見る' },
  { text: '年末年始の営業日のお知らせ：12/28〜1/4はお休みをいただきます', href: '#news', linkLabel: '営業カレンダー' },
  { text: '新サービス「アクセス解析レポート」の受付を開始しました', href: '#service', linkLabel: 'サービス内容' },
];

function readDismissed(key: string) {
  try {
    return window.localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

function MessageView({ m, nowrap = false }: { m: Announcement; nowrap?: boolean }) {
  return (
    <span className={nowrap ? 'inline-flex items-center gap-x-2 whitespace-nowrap' : 'leading-relaxed'}>
      <span>{m.text}</span>
      {m.href && (
        <a
          href={m.href}
          className="group ml-2 inline-flex items-center gap-1 whitespace-nowrap font-semibold underline decoration-current/40 underline-offset-4 transition-colors hover:decoration-current focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
        >
          {m.linkLabel ?? '詳しく見る'}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </a>
      )}
    </span>
  );
}

export function AnnouncementBar({
  messages = DEFAULT_MESSAGES,
  mode = 'rotate',
  interval = 4,
  speed = 60,
  theme = 'indigo',
  dismissible = true,
  storageKey = 'announcement-bar:2026-autumn',
}: Props) {
  const reduce = useReducedMotion();
  const [dismissed, setDismissed] = useState(() => readDismissed(storageKey));
  const [index, setIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [hoverPaused, setHoverPaused] = useState(false);

  const list = messages.length ? messages : DEFAULT_MESSAGES;
  const marquee = mode === 'marquee' && !reduce;
  const rotating = mode === 'rotate' && list.length > 1;
  const animated = marquee || rotating;
  const paused = userPaused || hoverPaused;

  // 自動切替（setState はタイマーのコールバック内）
  useEffect(() => {
    if (!rotating || paused || dismissed) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % list.length), Math.max(1.5, interval) * 1000);
    return () => window.clearInterval(id);
  }, [rotating, paused, dismissed, interval, list.length]);

  const close = () => {
    setDismissed(true);
    try {
      window.localStorage.setItem(storageKey, '1');
    } catch {
      /* 保存できない環境では、このページ表示中だけ閉じる */
    }
  };

  const current = list[index % list.length];
  // マーキー：全メッセージを1周分の幅で作り、2つ並べて -50% まで流すと継ぎ目なくループする
  const loopSeconds = Math.max(8, (list.reduce((n, m) => n + m.text.length, 0) * 16 + 400) / Math.max(10, speed));

  return (
    <AnimatePresence initial={false}>
      {!dismissed && (
        <motion.section
          aria-label="お知らせ"
          initial={false}
          exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className={`relative z-40 overflow-hidden text-xs sm:text-sm ${THEMES[theme]}`}
        >
          <div className="mx-auto flex min-h-11 max-w-7xl items-center gap-2 px-3 sm:px-6">
            <Megaphone className="hidden h-4 w-4 shrink-0 opacity-80 sm:block" aria-hidden="true" />

            <div
              className={`relative min-w-0 flex-1 overflow-hidden py-2.5 ${marquee ? '[mask-image:linear-gradient(to_right,transparent,black_24px,black_calc(100%-24px),transparent)]' : ''}`}
              onMouseEnter={() => setHoverPaused(true)}
              onMouseLeave={() => setHoverPaused(false)}
              onFocus={() => setHoverPaused(true)}
              onBlur={() => setHoverPaused(false)}
            >
              {marquee ? (
                <div
                  className="flex w-max"
                  style={{
                    animation: `announcement-marquee ${loopSeconds}s linear infinite`,
                    animationPlayState: paused ? 'paused' : 'running',
                  }}
                >
                  {[0, 1].map((copy) => (
                    <div key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1 ? true : undefined}>
                      {list.map((m, i) => (
                        <span key={i} className="flex items-center">
                          <span className="px-6 opacity-50" aria-hidden="true">✦</span>
                          {copy === 1 ? <span inert><MessageView m={m} nowrap /></span> : <MessageView m={m} nowrap />}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              ) : mode === 'rotate' ? (
                <div className="relative flex min-h-5 items-center justify-center" aria-live={paused ? 'polite' : 'off'}>
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={index % list.length}
                      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduce ? { opacity: 0 } : { opacity: 0, y: -14 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      className="max-w-full text-center"
                    >
                      <MessageView m={current} />
                    </motion.div>
                  </AnimatePresence>
                </div>
              ) : (
                <div className="text-center">
                  <MessageView m={list[0]} />
                </div>
              )}
            </div>

            {animated && (
              <button
                type="button"
                onClick={() => setUserPaused((p) => !p)}
                aria-label={userPaused ? 'お知らせの自動再生を再開' : 'お知らせの自動再生を一時停止'}
                aria-pressed={userPaused}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full opacity-80 transition hover:bg-white/15 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
              >
                {userPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
              </button>
            )}
            {dismissible && (
              <button
                type="button"
                id="announcement-close"
                onClick={close}
                aria-label="お知らせを閉じる"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full opacity-80 transition hover:bg-white/15 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <style>{`@keyframes announcement-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
        </motion.section>
      )}
    </AnimatePresence>
  );
}

/* ---------- デモ ---------- */

/** デモ用のページ（お知らせバー＋ヘッダー＋本文＋リセットボタン） */
export function AnnouncementBarDemo(props: Props) {
  const storageKey = props.storageKey ?? 'announcement-bar:2026-autumn';
  const [version, setVersion] = useState(0);

  const reset = () => {
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      /* 何もしない */
    }
    setVersion((v) => v + 1); // 作り直して保存値を読み直す
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <AnnouncementBar key={version} {...props} storageKey={storageKey} />
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Studio<span className="text-indigo-600 dark:text-indigo-400">Nami</span>
          </span>
          <nav className="hidden gap-8 text-sm font-medium text-slate-600 sm:flex dark:text-slate-300" aria-label="グローバル">
            <a href="#works" className="hover:text-slate-900 dark:hover:text-white">実績</a>
            <a href="#service" className="hover:text-slate-900 dark:hover:text-white">サービス</a>
            <a href="#contact" className="hover:text-slate-900 dark:hover:text-white">お問い合わせ</a>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-24">
        <p className="text-xs font-semibold tracking-[0.3em] text-indigo-600 dark:text-indigo-400">ANNOUNCEMENT BAR</p>
        <h1 className="mt-3 text-3xl font-bold leading-tight text-slate-900 sm:text-5xl dark:text-slate-100">
          伝えたいことを、
          <br />
          ページの一番上に。
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-slate-500 sm:text-base dark:text-slate-400">
          上部の帯は×で閉じると、次に訪れたときも表示されません（ブラウザに記録）。下のボタンで記録を消すと、もう一度表示されます。
        </p>
        <button
          type="button"
          id="announcement-reset"
          onClick={reset}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 dark:focus-visible:ring-offset-slate-950"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          非表示をリセットして再表示
        </button>
        <div className="mt-16 grid gap-4 text-left sm:grid-cols-3">
          {['ブランディング', 'Webサイト制作', 'グラフィック'].map((t) => (
            <div key={t} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="h-24 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700" />
              <p className="mt-4 text-sm font-semibold text-slate-800 dark:text-slate-100">{t}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">ダミーのサービス紹介文が入ります。</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return <AnnouncementBarDemo />;
}
