import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

/* =========================================================
 * カーテンリビール（Curtain Reveal）
 * - ページ切り替え時に、縦長のパネル（カーテン）が下から順に画面を覆い、
 *   中身を差し替えたあと上へ抜けて新しいページを見せる画面遷移
 * - 初回表示時も同じカーテンが上へ抜けるオープニング演出
 * - カーテン中央に遷移先のページ名を表示
 * - 遷移後は新しいページの見出しへフォーカスを移動（スクリーンリーダー配慮）
 * - GSAP タイムラインで「覆う → ページ名 → 差し替え → 抜ける」を1本に連結（途中で連打されても二重再生しない）
 * - prefers-reduced-motion 時はカーテンなしで即時切り替え
 * - Next.js では app/template.tsx にこの仕組みを置くとルート遷移ごとに再生できます
 * ========================================================= */

const PANELS = 5;
const EASE = 'power4.inOut';
const DURATION = 0.7;
const STAGGER = 0.06;

const PAGES = [
  { key: 'home', label: 'Home', title: 'つくるのは、\n記憶に残る体験。', bg: 'bg-stone-100 dark:bg-stone-950' },
  { key: 'works', label: 'Works', title: '選りすぐりの\nプロジェクト。', bg: 'bg-indigo-50 dark:bg-indigo-950' },
  { key: 'about', label: 'About', title: '小さなチームで、\n深く向き合う。', bg: 'bg-amber-50 dark:bg-amber-950' },
  { key: 'contact', label: 'Contact', title: 'まずは、\n話しましょう。', bg: 'bg-emerald-50 dark:bg-emerald-950' },
];

export function CurtainReveal({ panels = PANELS, duration = DURATION, stagger = STAGGER }: { panels?: number; duration?: number; stagger?: number }) {
  const [reduceMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [page, setPage] = useState(0);
  const [pendingLabel, setPendingLabel] = useState(PAGES[0].label);
  const rootRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const busy = useRef(false);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [page]);

  // カーテンを上へ抜く（初回のオープニング／遷移の後半で共通）
  const revealTl = (delay = 0) =>
    gsap
      .timeline({ delay, onComplete: () => void (busy.current = false) })
      .set('[data-panel]', { transformOrigin: '50% 0%' })
      .to('[data-panel]', { scaleY: 0, duration, ease: EASE, stagger })
      .set('[data-curtain]', { pointerEvents: 'none' });

  // 初回：覆った状態から抜けるオープニング
  const { contextSafe } = useGSAP(
    () => {
      if (reduceMotion) return;
      busy.current = true;
      revealTl(0.15);
    },
    { scope: rootRef },
  );

  const go = (i: number) => {
    if (i === page || busy.current) return;
    if (reduceMotion) {
      setPage(i);
      return;
    }
    busy.current = true;
    setPendingLabel(PAGES[i].label);
    // クリック時に作るアニメーションも useGSAP のコンテキストに登録（アンマウント時に自動で片付く）
    contextSafe(() => {
      gsap
      .timeline()
      .set('[data-curtain]', { pointerEvents: 'auto' })
      .set('[data-panel]', { transformOrigin: '50% 100%' })
      .to('[data-panel]', { scaleY: 1, duration, ease: EASE, stagger })
      .to('[data-label]', { opacity: 1, duration: 0.3 }, 0.35)
      .call(() => setPage(i)) // 覆い終わったら中身を差し替え
      .to('[data-label]', { opacity: 0, duration: 0.2 })
      .add(revealTl(), '+=0.1');
    })();
  };

  const current = PAGES[page];
  
  return (
    <div ref={rootRef} className={`min-h-screen ${current.bg} text-slate-900 transition-colors dark:text-white`}>
      <header className="fixed inset-x-0 top-0 z-20 flex items-center justify-between px-6 py-5 sm:px-10">
        <span className="text-sm font-black tracking-widest">EMO</span>
        <nav aria-label="メイン">
          <ul className="flex gap-5 text-sm font-medium">
            {PAGES.map((p, i) => (
              <li key={p.key}>
                <button
                  type="button"
                  onClick={() => go(i)}
                  aria-current={i === page ? 'page' : undefined}
                  className={`rounded px-1 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${i === page ? 'opacity-100' : 'opacity-50 hover:opacity-100'}`}
                >
                  {p.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="flex min-h-screen flex-col justify-center px-6 sm:px-16">
        <p className="text-xs font-semibold tracking-[0.3em] text-indigo-600 dark:text-indigo-400">CURTAIN REVEAL — {current.label.toUpperCase()}</p>
        <h1 ref={headingRef} tabIndex={-1} className="mt-4 whitespace-pre-line text-5xl font-bold leading-[1.1] outline-none sm:text-7xl">
          {current.title}
        </h1>
        <p className="mt-6 max-w-md text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          上部のメニューでページを切り替えると、カーテンが画面を覆ってから新しいページが現れます。
        </p>
      </main>

      {/* ---- カーテン ---- */}
      {!reduceMotion && (
        <div data-curtain aria-hidden className="fixed inset-0 z-30 flex">
          {Array.from({ length: panels }, (_, i) => (
            <div key={i} data-panel className="h-full flex-1 bg-slate-950 dark:bg-indigo-600" />
          ))}
          <span data-label className="absolute inset-0 flex items-center justify-center text-4xl font-black tracking-tight text-white opacity-0 sm:text-6xl">
            {pendingLabel}
          </span>
        </div>
      )}
    </div>
  );
}


export default function App() {
  return <CurtainReveal />;
}
