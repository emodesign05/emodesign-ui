import { useId, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';

/* =========================================================
 * お知らせ一覧（News List）
 * - 日付＋カテゴリラベル＋タイトルの1行リスト。コーポレートサイトのトップ／お知らせ一覧ページ用
 * - 上部のタブでカテゴリ絞り込み（role="tablist"。← → / Home / End キーでも切り替え可能）
 * - 公開日が newDays 日以内の記事に「NEW」バッジを自動表示
 * - タイトルはホバー／フォーカスで下線が左から伸びる（background-size のトランジション）
 * - 「もっと見る」で loadStep 件ずつ追加表示。全件表示したらボタンは消える
 * - 絞り込み・追加時は framer-motion でふわっと入れ替え（layout アニメーション）
 * - アクセシビリティ：日付は <time dateTime>、追加表示ボタンは aria-controls で一覧と関連付け
 * - prefers-reduced-motion: reduce のときはフェード・移動・下線アニメーションを無効化
 * ========================================================= */

const ACCENTS = {
  indigo: { tab: 'bg-indigo-600 text-white', text: 'text-indigo-600 dark:text-indigo-400', line: 'from-indigo-500 to-indigo-500', badge: 'bg-indigo-600', ring: 'focus-visible:ring-indigo-500' },
  rose: { tab: 'bg-rose-600 text-white', text: 'text-rose-600 dark:text-rose-400', line: 'from-rose-500 to-rose-500', badge: 'bg-rose-600', ring: 'focus-visible:ring-rose-500' },
  emerald: { tab: 'bg-emerald-600 text-white', text: 'text-emerald-600 dark:text-emerald-400', line: 'from-emerald-500 to-emerald-500', badge: 'bg-emerald-600', ring: 'focus-visible:ring-emerald-500' },
  slate: { tab: 'bg-slate-900 text-white dark:bg-white dark:text-slate-900', text: 'text-slate-900 dark:text-white', line: 'from-slate-900 to-slate-900 dark:from-white dark:to-white', badge: 'bg-slate-900 dark:bg-slate-100 dark:text-slate-900', ring: 'focus-visible:ring-slate-500' },
} as const;

type Category = 'お知らせ' | 'プレスリリース' | 'イベント' | '採用情報';

/** カテゴリラベルの色（アクセント色とは独立） */
const CATEGORY_STYLE: Record<Category, string> = {
  お知らせ: 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
  プレスリリース: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/60 dark:text-sky-300',
  イベント: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-300',
  採用情報: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300',
};

const CATEGORIES: ('すべて' | Category)[] = ['すべて', 'お知らせ', 'プレスリリース', 'イベント', '採用情報'];

// デモの日付は「今日から何日前か」で持つ（NEW バッジが常に見えるように）
const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);
const DAY = 86400000;

const RAW: { daysAgo: number; category: Category; title: string }[] = [
  { daysAgo: 1, category: 'お知らせ', title: '年末年始休業期間のお知らせ（12月28日〜1月4日）' },
  { daysAgo: 3, category: 'プレスリリース', title: '中小企業向けクラウド勤怠サービス「ミナトタイム」の提供を開始しました' },
  { daysAgo: 6, category: 'イベント', title: '【オンライン開催】Web 集客のはじめ方セミナー 第4回 参加者募集' },
  { daysAgo: 12, category: '採用情報', title: '2027年度 新卒採用エントリーの受付を開始しました' },
  { daysAgo: 20, category: 'お知らせ', title: 'コーポレートサイトをリニューアルしました' },
  { daysAgo: 34, category: 'プレスリリース', title: '本社オフィス移転に関するお知らせ' },
  { daysAgo: 41, category: 'イベント', title: '地域クリエイター交流会 2026 秋 を開催しました（レポート）' },
  { daysAgo: 55, category: '採用情報', title: '中途採用：Web ディレクター・フロントエンドエンジニアを募集しています' },
  { daysAgo: 70, category: 'お知らせ', title: '夏季休業期間のお知らせ' },
  { daysAgo: 88, category: 'プレスリリース', title: '架空ホールディングス株式会社との業務提携について' },
  { daysAgo: 102, category: 'イベント', title: '展示会「デザイン＆テック EXPO」出展のご案内' },
  { daysAgo: 130, category: 'お知らせ', title: '個人情報保護方針の改定について' },
];

const NEWS = RAW.map((n, i) => {
  const d = new Date(TODAY.getTime() - n.daysAgo * DAY);
  const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return { ...n, id: `news-${i}`, iso, label: iso.replace(/-/g, '.') };
});

export type NewsListProps = {
  /** アクセント色（タブ・NEW バッジ・下線） */
  accent?: keyof typeof ACCENTS;
  /** 公開から何日以内を「NEW」にするか（日） 0〜60 */
  newDays?: number;
  /** 最初に表示する件数 3〜12 */
  initialCount?: number;
  /** 「もっと見る」で追加する件数 1〜12 */
  loadStep?: number;
  /** カテゴリ絞り込みタブを表示するか */
  showTabs?: boolean;
};

export function NewsList({ accent = 'indigo', newDays = 14, initialCount = 5, loadStep = 3, showTabs = true }: NewsListProps) {
  const ac = ACCENTS[accent];
  const reduce = useReducedMotion();
  const uid = useId();
  const listId = `${uid}-list`;
  const [active, setActive] = useState<(typeof CATEGORIES)[number]>('すべて');
  const [count, setCount] = useState(initialCount);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const filtered = active === 'すべて' ? NEWS : NEWS.filter((n) => n.category === active);
  const visible = filtered.slice(0, count);
  const rest = filtered.length - visible.length;

  const select = (c: (typeof CATEGORIES)[number]) => {
    setActive(c);
    setCount(initialCount);
  };

  // ← → Home End でタブ移動（自動選択）
  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const last = CATEGORIES.length - 1;
    let next = -1;
    if (e.key === 'ArrowRight') next = i === last ? 0 : i + 1;
    else if (e.key === 'ArrowLeft') next = i === 0 ? last : i - 1;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = last;
    if (next < 0) return;
    e.preventDefault();
    select(CATEGORIES[next]);
    tabRefs.current[next]?.focus();
  };

  return (
    <section className="w-full min-w-0 max-w-4xl" aria-labelledby={`${uid}-heading`}>
      <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className={`text-xs font-bold tracking-[0.2em] ${ac.text}`}>NEWS</p>
          <h2 id={`${uid}-heading`} className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            お知らせ
          </h2>
        </div>

        {showTabs && (
          <div
            role="tablist"
            aria-label="カテゴリで絞り込み"
            className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0"
          >
            {CATEGORIES.map((c, i) => {
              const selected = c === active;
              return (
                <button
                  key={c}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`${uid}-tab-${i}`}
                  aria-selected={selected}
                  aria-controls={listId}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => select(c)}
                  onKeyDown={(e) => onTabKey(e, i)}
                  data-category={c}
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 ${ac.ring} ${
                    selected
                      ? ac.tab
                      : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div
        id={listId}
        role={showTabs ? 'tabpanel' : undefined}
        aria-labelledby={showTabs ? `${uid}-tab-${CATEGORIES.indexOf(active)}` : undefined}
        className="rounded-3xl border border-slate-200 bg-white px-5 shadow-sm sm:px-8 dark:border-slate-800 dark:bg-slate-900"
      >
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          <AnimatePresence initial={false} mode="popLayout">
            {visible.map((n) => {
              const isNew = TODAY.getTime() - new Date(n.iso + 'T00:00:00').getTime() <= newDays * DAY;
              return (
                <motion.li
                  key={n.id}
                  layout={!reduce}
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -4 }}
                  transition={{ duration: reduce ? 0 : 0.25, ease: 'easeOut' }}
                >
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className={`group -mx-2 flex flex-col gap-2 rounded-xl px-2 py-5 focus-visible:outline-none focus-visible:ring-2 sm:flex-row sm:items-center sm:gap-6 ${ac.ring}`}
                  >
                    <div className="flex shrink-0 items-center gap-3">
                      <time dateTime={n.iso} className="w-[5.5rem] text-[13px] font-medium tracking-wide tabular-nums text-slate-500 dark:text-slate-400">
                        {n.label}
                      </time>
                      <span
                        className={`inline-flex w-[6.5rem] justify-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${CATEGORY_STYLE[n.category]}`}
                      >
                        {n.category}
                      </span>
                      {/* PC ではバッジの有無でタイトル位置がずれないよう枠を確保 */}
                      <span className="sm:w-10">
                        {isNew && (
                          <span className={`rounded px-1.5 py-0.5 text-[10px] font-black tracking-wider text-white ${ac.badge}`}>NEW</span>
                        )}
                      </span>
                    </div>
                    <span className="flex min-w-0 flex-1 items-center justify-between gap-4">
                      <span
                        className={`bg-gradient-to-r bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 text-sm leading-relaxed text-slate-800 group-hover:bg-[length:100%_1px] group-focus-visible:bg-[length:100%_1px] sm:text-[15px] dark:text-slate-100 ${ac.line} ${
                          reduce ? '' : 'transition-[background-size] duration-300 ease-out'
                        }`}
                      >
                        {n.title}
                      </span>
                      <ArrowRight
                        aria-hidden
                        className={`hidden h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:text-slate-500 sm:block dark:text-slate-600 ${
                          reduce ? '' : 'group-hover:translate-x-1'
                        }`}
                      />
                    </span>
                  </a>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
        {visible.length === 0 && <p className="py-10 text-center text-sm text-slate-500">該当するお知らせはありません。</p>}
      </div>

      <div className="mt-8 flex flex-col items-center gap-2">
        {rest > 0 ? (
          <button
            type="button"
            id="news-more"
            onClick={() => setCount((c) => c + loadStep)}
            aria-controls={listId}
            className={`inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:shadow focus-visible:outline-none focus-visible:ring-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 ${ac.ring}`}
          >
            もっと見る
            <ChevronDown aria-hidden className="h-4 w-4" />
          </button>
        ) : null}
        <p className="text-xs text-slate-400" aria-live="polite">
          {filtered.length} 件中 {visible.length} 件を表示
        </p>
      </div>
    </section>
  );
}

export default function App() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-16 sm:px-8 sm:py-24 dark:bg-slate-950">
      <div className="mx-auto flex max-w-4xl justify-center">
        <NewsList />
      </div>
    </main>
  );
}
