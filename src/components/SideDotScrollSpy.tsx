import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, useGSAP);

/* =========================================================
 * セクションインジケーター（Side Dot ScrollSpy Navigation）
 * - 画面右端に縦並びのドットを固定表示し、今見ているセクションをハイライト
 * - GSAP ScrollTrigger で「画面の中央線をまたいでいるセクション」を検出
 * - クリックで GSAP ScrollToPlugin によるなめらかなスクロール移動
 * - アクティブな印は layoutId でドット間をなめらかに移動
 * - ホバー／フォーカスでセクション名のラベルが出る。クリックでそのセクションへ移動
 * - aria-current="true" で現在位置を支援技術に伝える
 * ========================================================= */

const SECTIONS = [
  { id: 'spy-intro', label: 'Intro', bg: 'bg-slate-50 dark:bg-slate-950' },
  { id: 'spy-concept', label: 'Concept', bg: 'bg-indigo-50 dark:bg-indigo-950/60' },
  { id: 'spy-works', label: 'Works', bg: 'bg-rose-50 dark:bg-rose-950/50' },
  { id: 'spy-team', label: 'Team', bg: 'bg-amber-50 dark:bg-amber-950/40' },
  { id: 'spy-contact', label: 'Contact', bg: 'bg-emerald-50 dark:bg-emerald-950/50' },
];

function useScrollSpy(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  useGSAP(() => {
    ids.forEach((id) => {
      ScrollTrigger.create({
        trigger: `#${id}`,
        // セクションが画面の中央線をまたいでいる間を「現在地」とみなす
        start: 'top center',
        end: 'bottom center',
        onToggle: (self) => self.isActive && setActive(id),
      });
    });
  }, [ids]);
  return active;
}

const IDS = SECTIONS.map((s) => s.id);

export function DotNav({ side = 'right', gap = 16, showLabels = false }: { side?: 'left' | 'right'; gap?: number; showLabels?: boolean }) {
  const active = useScrollSpy(IDS);
  const reduce = useReducedMotion();
  return (
    <nav aria-label="セクション" className={`fixed top-1/2 z-50 -translate-y-1/2 ${side === 'right' ? 'right-5' : 'left-5'}`}>
      <ul style={{ gap }} className={`flex flex-col ${side === 'right' ? 'items-end' : 'items-start'}`}>
        {SECTIONS.map((s) => {
          const isActive = s.id === active;
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                aria-current={isActive ? 'true' : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  gsap.to(window, { scrollTo: `#${s.id}`, duration: reduce ? 0 : 1, ease: 'power3.inOut' });
                }}
                className={`group flex items-center gap-3 rounded-full py-1 pl-2 focus-visible:outline-none ${side === 'left' ? 'flex-row-reverse pl-0 pr-2' : ''}`}
              >
                <span
                  className={`rounded-md bg-slate-900 px-2 py-1 text-[11px] font-semibold text-white transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 dark:bg-white dark:text-slate-900 ${
                    showLabels ? 'opacity-100' : 'opacity-0'
                  } ${reduce || showLabels ? '' : side === 'right' ? 'translate-x-2' : '-translate-x-2'}`}
                >
                  {s.label}
                </span>
                <span className="relative flex h-4 w-4 items-center justify-center rounded-full group-focus-visible:ring-2 group-focus-visible:ring-indigo-500">
                  <span className={`h-2 w-2 rounded-full transition-colors ${isActive ? 'bg-transparent' : 'bg-slate-400 group-hover:bg-slate-700 dark:bg-slate-600 dark:group-hover:bg-slate-300'}`} />
                  {isActive && (
                    <motion.span
                      layoutId="scrollspy-active"
                      transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 30 }}
                      className="absolute inset-0 rounded-full border-2 border-indigo-600 bg-indigo-600/20 dark:border-indigo-400"
                    />
                  )}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default function App() {
  return (
    <main className="text-slate-900 dark:text-white">
      <DotNav />
      {SECTIONS.map((s, i) => (
        <section key={s.id} id={s.id} className={`flex min-h-screen flex-col justify-center px-8 sm:px-20 ${s.bg}`}>
          <p className="text-xs font-semibold tracking-[0.3em] text-indigo-600 dark:text-indigo-400">0{i + 1} / 0{SECTIONS.length}</p>
          {i === 0 ? (
            <h1 className="mt-3 text-5xl font-black sm:text-7xl">{s.label}</h1>
          ) : (
            <h2 className="mt-3 text-5xl font-black sm:text-7xl">{s.label}</h2>
          )}
          <p className="mt-5 max-w-md text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            右端のドットが現在地を示します。ドットにカーソルを乗せるとセクション名が表示され、クリックで移動できます。
          </p>
        </section>
      ))}
    </main>
  );
}
