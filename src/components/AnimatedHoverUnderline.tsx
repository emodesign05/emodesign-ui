import type { ReactNode } from 'react';

/* =========================================================
 * アンダーラインスイープ（Animated Hover Underline）
 * - sweep  : 左から伸びて右へ抜ける（ホバー解除時に反対側へ消える）
 * - center : 中央から左右へ広がる
 * - swap   : 既存の線が右へ抜け、新しい線が左から入る
 * - marker : 蛍光ペンのように文字の背面を塗る
 * - :hover と :focus-visible の両方で発火（キーボード操作でも同じ見え方）
 * - CSS（Tailwind）のみ・JS不要。prefers-reduced-motion 時は即時切替
 * ========================================================= */

type Variant = 'sweep' | 'center' | 'swap' | 'marker';

const BASE =
  'relative inline-block rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-4 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950';

const LINE =
  "after:pointer-events-none after:absolute after:inset-x-0 after:-bottom-1 after:h-[2px] after:bg-current after:content-[''] after:transition-transform after:duration-500 after:ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:after:transition-none";

const VARIANTS: Record<Variant, string> = {
  // 解除時は右へ抜け、ホバー時は左から伸びる
  sweep: `${LINE} after:origin-right after:scale-x-0 hover:after:origin-left hover:after:scale-x-100 focus-visible:after:origin-left focus-visible:after:scale-x-100`,
  center: `${LINE} after:origin-center after:scale-x-0 hover:after:scale-x-100 focus-visible:after:scale-x-100`,
  // before = 常時表示の線（右へ抜ける）、after = 左から入る線
  swap: `${LINE} after:origin-right after:scale-x-0 after:delay-0 hover:after:origin-left hover:after:scale-x-100 hover:after:delay-200 focus-visible:after:origin-left focus-visible:after:scale-x-100 focus-visible:after:delay-200 before:pointer-events-none before:absolute before:inset-x-0 before:-bottom-1 before:h-[2px] before:origin-right before:bg-current before:content-[''] before:transition-transform before:duration-500 before:ease-[cubic-bezier(0.65,0,0.35,1)] hover:before:scale-x-0 focus-visible:before:scale-x-0 motion-reduce:before:transition-none`,
  marker:
    "z-0 px-0.5 after:absolute after:inset-x-0 after:bottom-0 after:-z-10 after:h-[40%] after:origin-left after:scale-x-0 after:bg-amber-300/70 after:content-[''] after:transition-transform after:duration-500 after:ease-[cubic-bezier(0.65,0,0.35,1)] hover:after:scale-x-100 focus-visible:after:scale-x-100 motion-reduce:after:transition-none dark:after:bg-amber-400/40",
};

export function UnderlineLink({ href, variant = 'sweep', children }: { href: string; variant?: Variant; children: ReactNode }) {
  return (
    <a href={href} className={`${BASE} ${VARIANTS[variant]}`}>
      {children}
    </a>
  );
}

const NAV = ['Works', 'About', 'Service', 'Journal', 'Contact'];

export default function App() {
  return (
    <main className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="border-b border-slate-200 dark:border-slate-800">
        <nav aria-label="メイン" className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <span className="text-sm font-black tracking-widest">EMO</span>
          <ul className="flex gap-6 text-sm font-medium sm:gap-8">
            {NAV.map((n) => (
              <li key={n}>
                <UnderlineLink href={`#${n.toLowerCase()}`}>{n}</UnderlineLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-20">
        <p className="text-xs font-semibold tracking-[0.3em] text-indigo-600 dark:text-indigo-400">HOVER UNDERLINE</p>
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">線ひとつで、リンクに表情を。</h1>

        <dl className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2">
          {(
            [
              ['sweep', '左から伸びて右へ抜ける、最も定番のスイープ。'],
              ['center', '中央から左右に広がる、落ち着いた印象。'],
              ['swap', '既存の線が抜けたあと、新しい線が入れ替わる。'],
              ['marker', '蛍光ペンで引いたような背面ハイライト。'],
            ] as [Variant, string][]
          ).map(([v, desc]) => (
            <div key={v} className="rounded-2xl border border-slate-200 p-6 dark:border-slate-800">
              <dt className="text-2xl font-bold">
                <UnderlineLink href="#" variant={v}>
                  {v.charAt(0).toUpperCase() + v.slice(1)} link
                </UnderlineLink>
              </dt>
              <dd className="mt-3 text-sm text-slate-600 dark:text-slate-400">{desc}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-12 max-w-2xl text-base leading-loose text-slate-700 dark:text-slate-300">
          本文中でも使えます。たとえば{' '}
          <UnderlineLink href="#" variant="marker">
            制作実績
          </UnderlineLink>{' '}
          や{' '}
          <UnderlineLink href="#" variant="sweep">
            お問い合わせフォーム
          </UnderlineLink>{' '}
          のように、文章の流れを崩さずにインタラクションを加えられます。
        </p>
      </section>
    </main>
  );
}
