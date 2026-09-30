import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Flip } from 'gsap/Flip';
import { useGSAP } from '@gsap/react';
import { ArrowLeft } from 'lucide-react';

gsap.registerPlugin(Flip, useGSAP);

/* =========================================================
 * ページ遷移（Shared Element Transition）
 * - 一覧のサムネイルをクリックすると、その画像がそのまま詳細ページのヒーロー画像へ拡大して遷移する
 *   （「どこから来たか」が分かり、ページが切り替わっても体験がつながる）
 * - GSAP Flip：クリック時の画像の位置を記録 → 詳細画面に切り替え → 同じ data-flip-id の要素へ補間
 *   戻る時は逆方向（詳細のヒーロー → 一覧のサムネイル）
 * - 詳細の本文は画像が着地してから下からフェードイン
 * - 遷移後は見出しへフォーカスを移動（キーボード・読み上げ配慮）
 * - Next.js などのルーター遷移にも応用可（状態をレイアウト側に持つ／View Transitions API を使う方法もある）
 * - prefers-reduced-motion 時は即時切り替え
 * ========================================================= */

const WORKS = [
  { id: 'aurora', title: 'Aurora', tag: 'Branding', color: 'from-indigo-500 via-violet-500 to-sky-400', body: '北欧の空をモチーフにした、静かで強いブランドアイデンティティ。' },
  { id: 'kumo', title: 'Kumo', tag: 'App', color: 'from-rose-500 via-orange-400 to-amber-300', body: '毎日の記録を、雲のように軽く。習慣化アプリの UI/UX。' },
  { id: 'mori', title: 'Mori', tag: 'Web', color: 'from-emerald-500 via-teal-400 to-lime-300', body: '森の中を歩くようにスクロールする、建築事務所のサイト。' },
  { id: 'nami', title: 'Nami', tag: 'Editorial', color: 'from-fuchsia-500 via-pink-400 to-rose-300', body: '波のリズムで読ませる、ウェブマガジンのエディトリアル。' },
];

type Props = {
  /** 遷移の時間（秒） */
  duration?: number;
  /** 遷移のイージング */
  ease?: string;
};

export function SharedElementTransition({ duration = 0.8, ease = 'power3.inOut' }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const flipState = useRef<Flip.FlipState | null>(null);
  const busy = useRef(false);

  // 画面が切り替わった直後に、記録した位置から補間
  useGSAP(
    () => {
      const state = flipState.current;
      if (!state) return;
      flipState.current = null;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const d = reduce ? 0 : duration;
      Flip.from(state, {
        targets: '[data-flip-id]',
        duration: d,
        ease,
        scale: true,
        zIndex: 30,
        onComplete: () => void (busy.current = false),
      });
      if (openId) gsap.from('[data-detail-body] > *', { autoAlpha: 0, y: 30, duration: d * 0.7, delay: d * 0.6, stagger: 0.08, ease: 'power2.out' });
      else gsap.from('[data-card-tag]', { autoAlpha: 0, duration: d * 0.5, delay: d * 0.6 });
    },
    { scope: rootRef, dependencies: [openId] },
  );

  useEffect(() => {
    if (openId) headingRef.current?.focus();
  }, [openId]);

  const go = (id: string | null) => {
    if (busy.current) return;
    busy.current = true;
    flipState.current = Flip.getState(rootRef.current?.querySelectorAll('[data-flip-id]') ?? []);
    setOpenId(id);
  };

  const current = WORKS.find((w) => w.id === openId);

  return (
    <div ref={rootRef} className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-white">
      {!current ? (
        <section className="mx-auto max-w-6xl px-6 py-20">
          <p className="text-xs font-semibold tracking-[0.3em] text-indigo-600 dark:text-indigo-400">SHARED ELEMENT TRANSITION</p>
          <h1 className="mt-3 text-4xl font-black sm:text-5xl">Works</h1>
          <ul className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {WORKS.map((w) => (
              <li key={w.id}>
                <button type="button" onClick={() => go(w.id)} className="group block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
                  <div data-flip-id={`img-${w.id}`} className={`aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gradient-to-br ${w.color}`}>
                    <div className="h-full w-full transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <div className="mt-4 flex items-baseline justify-between">
                    <p data-flip-id={`title-${w.id}`} className="text-2xl font-bold">
                      {w.title}
                    </p>
                    <p data-card-tag className="text-xs font-semibold tracking-[0.2em] text-slate-500">{w.tag}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <article>
          <div data-flip-id={`img-${current.id}`} className={`h-[65vh] w-full bg-gradient-to-br ${current.color}`} />
          <div className="mx-auto max-w-3xl px-6 py-14">
            <button type="button" onClick={() => go(null)} className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:hover:bg-slate-900">
              <ArrowLeft className="h-4 w-4" /> 一覧へ戻る
            </button>
            <h1 ref={headingRef} tabIndex={-1} data-flip-id={`title-${current.id}`} className="mt-8 text-6xl font-black tracking-tight outline-none sm:text-8xl">
              {current.title}
            </h1>
            <div data-detail-body className="mt-6 space-y-4">
              <p className="text-xs font-semibold tracking-[0.3em] text-indigo-600 dark:text-indigo-400">{current.tag}</p>
              <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">{current.body}</p>
              <p className="text-sm leading-relaxed text-slate-500">一覧のサムネイルとタイトルが、そのまま詳細ページのヒーローと見出しへ移動しています。</p>
            </div>
          </div>
        </article>
      )}
    </div>
  );
}

export default function App() {
  return <SharedElementTransition />;
}
