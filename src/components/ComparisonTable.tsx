import { Fragment, useId, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, Minus, MoveHorizontal, Sparkles } from 'lucide-react';

/* =========================================================
 * 料金比較表（Comparison Table）
 * - プラン（列）× 機能（行）の ◯ × 比較表。行はカテゴリごとに見出し行で区切る
 * - おすすめ列は「バッジ＋アクセント色の枠＋薄い背景」で強調（列の全セルに左右の枠線をつなげて1本の枠に見せる）
 * - 月払い / 年払いトグル（role="switch"）で価格を切り替え。数字は上下にスライドして入れ替わる
 * - スマホは横スクロール。1列目（機能名）は position: sticky で固定し、スクロール中は右側に影を出す
 * - アクセシビリティ：本物の <table>（caption / scope="col|row"）。◯ × はアイコン＋読み上げ用テキスト（sr-only）
 *   横スクロール領域は tabIndex=0 ＋ aria-label でキーボード（← →）でも動かせる
 * - prefers-reduced-motion: reduce のときは価格の切替アニメーションを無効化
 * ========================================================= */

const ACCENTS = {
  indigo: { border: 'border-indigo-500!', bg: 'bg-indigo-50/60 dark:bg-indigo-950/30', badge: 'bg-indigo-600', text: 'text-indigo-600 dark:text-indigo-400', btn: 'bg-indigo-600 hover:bg-indigo-700 text-white', knob: 'bg-indigo-600', ring: 'focus-visible:ring-indigo-500' },
  rose: { border: 'border-rose-500!', bg: 'bg-rose-50/60 dark:bg-rose-950/30', badge: 'bg-rose-600', text: 'text-rose-600 dark:text-rose-400', btn: 'bg-rose-600 hover:bg-rose-700 text-white', knob: 'bg-rose-600', ring: 'focus-visible:ring-rose-500' },
  emerald: { border: 'border-emerald-500!', bg: 'bg-emerald-50/60 dark:bg-emerald-950/30', badge: 'bg-emerald-600', text: 'text-emerald-600 dark:text-emerald-400', btn: 'bg-emerald-600 hover:bg-emerald-700 text-white', knob: 'bg-emerald-600', ring: 'focus-visible:ring-emerald-500' },
  violet: { border: 'border-violet-500!', bg: 'bg-violet-50/60 dark:bg-violet-950/30', badge: 'bg-violet-600', text: 'text-violet-600 dark:text-violet-400', btn: 'bg-violet-600 hover:bg-violet-700 text-white', knob: 'bg-violet-600', ring: 'focus-visible:ring-violet-500' },
} as const;

type PlanId = 'light' | 'standard' | 'premium';
const PLANS: { id: PlanId; name: string; desc: string; monthly: number; yearly: number }[] = [
  { id: 'light', name: 'ライト', desc: 'まずは小さく始めたい方に', monthly: 9800, yearly: 7800 },
  { id: 'standard', name: 'スタンダード', desc: '集客と更新を両立したい方に', monthly: 19800, yearly: 15800 },
  { id: 'premium', name: 'プレミアム', desc: '本格運用・分析まで任せたい方に', monthly: 39800, yearly: 31800 },
];

type Cell = boolean | string;
const GROUPS: { title: string; rows: { label: string; note?: string; values: Record<PlanId, Cell> }[] }[] = [
  {
    title: 'サイト制作',
    rows: [
      { label: 'ページ数', values: { light: '5ページ', standard: '10ページ', premium: '無制限' } },
      { label: 'レスポンシブ対応', values: { light: true, standard: true, premium: true } },
      { label: 'オリジナルデザイン', note: 'テンプレート不使用', values: { light: false, standard: true, premium: true } },
      { label: 'お問い合わせフォーム', values: { light: true, standard: true, premium: true } },
    ],
  },
  {
    title: '運用・サポート',
    rows: [
      { label: '月間更新作業', values: { light: '2回', standard: '5回', premium: '無制限' } },
      { label: 'ブログ（CMS）機能', values: { light: false, standard: true, premium: true } },
      { label: 'チャットサポート', values: { light: false, standard: true, premium: true } },
      { label: '専任ディレクター', values: { light: false, standard: false, premium: true } },
    ],
  },
  {
    title: '集客・分析',
    rows: [
      { label: '基本 SEO 設定', values: { light: true, standard: true, premium: true } },
      { label: 'アクセス解析レポート', values: { light: false, standard: '月1回', premium: '週1回' } },
      { label: '改善提案ミーティング', values: { light: false, standard: false, premium: true } },
    ],
  },
];

export type ComparisonTableProps = {
  /** アクセント色（おすすめ列・トグル・ボタン） */
  accent?: keyof typeof ACCENTS;
  /** おすすめとして強調するプラン */
  recommended?: PlanId;
  /** 最初から年払い表示にするか */
  defaultYearly?: boolean;
  /** 1列目（機能名）を横スクロール時に固定するか */
  stickyFirstColumn?: boolean;
  /** 年払いの割引バッジの文言 */
  discountLabel?: string;
};

export function ComparisonTable({
  accent = 'indigo',
  recommended = 'standard',
  defaultYearly = false,
  stickyFirstColumn = true,
  discountLabel = '約20%おトク',
}: ComparisonTableProps) {
  const ac = ACCENTS[accent];
  const reduce = useReducedMotion();
  const uid = useId();
  const [yearly, setYearly] = useState(defaultYearly);
  const [scrolled, setScrolled] = useState(false);

  const sticky = stickyFirstColumn
    ? `sticky left-0 z-20 bg-white dark:bg-slate-900 ${scrolled ? 'shadow-[6px_0_12px_-6px_rgba(15,23,42,0.18)]' : ''}`
    : 'bg-white dark:bg-slate-900';

  // おすすめ列のセル装飾（左右の枠を縦につなげる）
  const rec = (id: PlanId, pos: 'top' | 'mid' | 'bottom') =>
    id === recommended
      ? `border-x-2 ${ac.border} ${ac.bg} ${pos === 'top' ? 'rounded-t-2xl border-t-2' : ''} ${pos === 'bottom' ? 'rounded-b-2xl border-b-2' : ''}`
      : '';

  const renderCell = (v: Cell) => {
    if (v === true)
      return (
        <>
          <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${ac.bg}`}>
            <Check aria-hidden className={`h-4 w-4 ${ac.text}`} strokeWidth={3} />
          </span>
          <span className="sr-only">対応</span>
        </>
      );
    if (v === false)
      return (
        <>
          <Minus aria-hidden className="mx-auto h-4 w-4 text-slate-300 dark:text-slate-600" />
          <span className="sr-only">非対応</span>
        </>
      );
    return <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{v}</span>;
  };

  return (
    <div className="w-full min-w-0 max-w-5xl">
      {/* 月 / 年トグル */}
      <div className="mb-8 flex items-center justify-center gap-3">
        <span id={`${uid}-m`} className={`text-sm font-bold ${!yearly ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
          月払い
        </span>
        <button
          type="button"
          role="switch"
          id="billing-toggle"
          aria-checked={yearly}
          aria-label="年払いで表示"
          onClick={() => setYearly((y) => !y)}
          className={`relative h-7 w-14 rounded-full p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 ${ac.ring} ${
            yearly ? 'bg-slate-800 dark:bg-slate-600' : 'bg-slate-200 dark:bg-slate-800'
          }`}
        >
          <motion.span
            className={`block h-5 w-5 rounded-full shadow-md ${ac.knob}`}
            animate={{ x: yearly ? 28 : 0 }}
            transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 30 }}
          />
        </button>
        <span className={`text-sm font-bold ${yearly ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>年払い</span>
        <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-bold text-rose-600 dark:bg-rose-950/80 dark:text-rose-400">{discountLabel}</span>
      </div>

      <p className="mb-2 flex items-center justify-end gap-1.5 text-xs text-slate-400 md:hidden">
        <MoveHorizontal aria-hidden className="h-3.5 w-3.5" />
        横にスクロールできます
      </p>

      <div
        role="region"
        aria-label="料金プラン比較表（横スクロール可）"
        tabIndex={0}
        onScroll={(e) => {
          const s = e.currentTarget.scrollLeft > 4;
          setScrolled((p) => (p === s ? p : s));
        }}
        data-scroller
        className={`relative overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm focus-visible:outline-none focus-visible:ring-2 dark:border-slate-800 dark:bg-slate-900 ${ac.ring}`}
      >
        <table className="w-full min-w-[620px] border-separate border-spacing-0 text-left">
          <caption className="sr-only">プラン別の機能と料金の比較（{yearly ? '年払い・月額換算' : '月払い'}）</caption>
          <thead>
            <tr>
              <th scope="col" className={`w-32 p-4 sm:w-[30%] align-bottom sm:p-6 ${sticky}`}>
                <span className="text-xs font-bold tracking-[0.15em] text-slate-400">PLAN</span>
              </th>
              {PLANS.map((p) => (
                <th key={p.id} scope="col" className={`relative px-3 pb-6 pt-11 text-center align-top sm:px-5 ${rec(p.id, 'top')}`}>
                  {p.id === recommended && (
                    <span className={`absolute left-1/2 top-3 inline-flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-bold text-white shadow-md ${ac.badge}`}>
                      <Sparkles aria-hidden className="h-3 w-3" />
                      おすすめ
                    </span>
                  )}
                  <span className="block text-base font-bold text-slate-900 dark:text-white">{p.name}</span>
                  <span className="mt-1 block text-[11px] font-normal text-slate-500 dark:text-slate-400">{p.desc}</span>
                  <span className="mt-4 flex items-baseline justify-center gap-0.5 overflow-hidden">
                    <span className="text-sm font-bold text-slate-500">¥</span>
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span
                        key={`${p.id}-${yearly}`}
                        initial={reduce ? false : { y: -14, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { y: 14, opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        className="text-2xl font-black tabular-nums tracking-tight text-slate-900 sm:text-3xl dark:text-white"
                      >
                        {(yearly ? p.yearly : p.monthly).toLocaleString()}
                      </motion.span>
                    </AnimatePresence>
                    <span className="text-[11px] font-normal text-slate-400">/月</span>
                  </span>
                  <span className="mt-1 block h-4 text-[11px] font-normal text-slate-400">
                    {yearly ? `年額 ¥${(p.yearly * 12).toLocaleString()}` : '税込・いつでも解約可'}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {GROUPS.map((g) => (
              <Fragment key={g.title}>
                <tr>
                  <th scope="colgroup" className={`border-t border-slate-100 px-4 pb-2 pt-6 text-xs font-bold tracking-wider text-slate-400 sm:px-6 dark:border-slate-800 ${sticky}`}>
                    {g.title}
                  </th>
                  {PLANS.map((p) => (
                    <td key={p.id} className={`border-t border-slate-100 dark:border-slate-800 ${rec(p.id, 'mid')}`} />
                  ))}
                </tr>
                {g.rows.map((r) => (
                  <tr key={r.label} className="group">
                    <th scope="row" className={`border-t border-slate-100 px-4 py-4 text-sm font-medium text-slate-700 sm:px-6 dark:border-slate-800 dark:text-slate-200 ${sticky}`}>
                      {r.label}
                      {r.note && <span className="mt-0.5 block text-[11px] font-normal text-slate-400">{r.note}</span>}
                    </th>
                    {PLANS.map((p) => (
                      <td key={p.id} className={`border-t border-slate-100 px-3 py-4 text-center transition-colors group-hover:bg-slate-50/80 dark:border-slate-800 dark:group-hover:bg-slate-800/40 ${rec(p.id, 'mid')}`}>
                        {renderCell(r.values[p.id])}
                      </td>
                    ))}
                  </tr>
                ))}
              </Fragment>
            ))}
            <tr>
              <td className={`border-t border-slate-100 p-4 sm:p-6 dark:border-slate-800 ${sticky}`} />
              {PLANS.map((p) => (
                <td key={p.id} className={`border-t border-slate-100 px-3 py-6 text-center dark:border-slate-800 ${rec(p.id, 'bottom')}`}>
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className={`inline-flex w-full max-w-[170px] items-center whitespace-nowrap justify-center rounded-full px-4 py-2.5 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${ac.ring} ${
                      p.id === recommended
                        ? `${ac.btn} shadow-md`
                        : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
                    }`}
                  >
                    このプランで相談
                  </a>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-center text-xs text-slate-400">※ 価格はすべて税込です。年払いは12ヶ月分を一括でお支払いいただきます。</p>
    </div>
  );
}

export default function App() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-16 sm:px-8 sm:py-24 dark:bg-slate-950">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <p className="text-xs font-bold tracking-[0.2em] text-indigo-600">PRICE</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">料金プラン比較</h2>
        <p className="mt-3 text-sm text-slate-500">ご予算と目的に合わせてお選びいただけます</p>
      </div>
      <div className="mx-auto flex max-w-5xl justify-center">
        <ComparisonTable />
      </div>
    </main>
  );
}
