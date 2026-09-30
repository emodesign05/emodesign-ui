import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { ArrowUpRight, Menu, X } from 'lucide-react';

/* =========================================================
 * サークルクリップメニュー（Circle Clip-Path Fullscreen Menu）
 * - メニューボタンの位置を中心に、clip-path: circle() が画面全体へ広がって開く
 * - 開いた後にメニュー項目が下からスタッガー登場
 * - Esc で閉じる / 開閉時にフォーカス移動・返却 / Tab をメニュー内に閉じ込める / 背面スクロール固定
 * - prefers-reduced-motion 時はフェードのみ
 * ========================================================= */

const LINKS = [
  { label: 'Works', sub: '制作実績' },
  { label: 'About', sub: '私たちについて' },
  { label: 'Service', sub: 'サービス' },
  { label: 'Journal', sub: 'ブログ' },
  { label: 'Contact', sub: 'お問い合わせ' },
];

const EASE = [0.76, 0, 0.24, 1] as const;

export function CircleClipMenu({ openDuration = 0.8, closeDuration = 0.6, stagger = 0.07, bgColor = '#4f46e5' }: { openDuration?: number; closeDuration?: number; stagger?: number; bgColor?: string }) {
  const [open, setOpen] = useState(false);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const toggle = () => {
    const r = buttonRef.current?.getBoundingClientRect();
    if (r) setOrigin({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
    setOpen((v) => !v);
  };

  // Esc / フォーカストラップ / スクロール固定
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const button = buttonRef.current;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
      if (e.key !== 'Tab' || !panelRef.current || !button) return;
      const focusables = [button, ...panelRef.current.querySelectorAll<HTMLElement>('a[href]')];
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
      button?.focus();
    };
  }, [open]);

  const circle = (r: string) => `circle(${r} at ${origin.x}px ${origin.y}px)`;

  const panel: Variants = reduceMotion
    ? { closed: { opacity: 0 }, open: { opacity: 1, transition: { duration: 0.2 } } }
    : {
        closed: { clipPath: circle('0px'), transition: { duration: closeDuration, ease: EASE, delay: 0.15 } },
        open: { clipPath: circle('150vmax'), transition: { duration: openDuration, ease: EASE } },
      };

  const list: Variants = {
    open: { transition: { staggerChildren: stagger, delayChildren: reduceMotion ? 0 : 0.35 } },
    closed: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
  };

  const item: Variants = reduceMotion
    ? { closed: { opacity: 0 }, open: { opacity: 1 } }
    : {
        closed: { y: '110%', transition: { duration: 0.35, ease: EASE } },
        open: { y: '0%', transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
      };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls="circle-menu"
        aria-label={open ? 'メニューを閉じる' : 'メニューを開く'}
        className={`fixed right-5 top-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 ${
          open ? 'bg-white text-slate-950' : 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
        }`}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            id="circle-menu"
            role="dialog"
            aria-modal="true"
            aria-label="サイトメニュー"
            variants={panel}
            initial="closed"
            animate="open"
            exit="closed"
            onAnimationComplete={(def) => def === 'open' && panelRef.current?.querySelector<HTMLElement>('a')?.focus()}
            style={{ backgroundColor: bgColor }}
            className="fixed inset-0 z-50 flex items-center text-white"
          >
            <nav className="mx-auto w-full max-w-5xl px-8">
              <motion.ul variants={list} initial="closed" animate="open" exit="closed" className="space-y-2 sm:space-y-4">
                {LINKS.map((l, i) => (
                  <li key={l.label} className="overflow-hidden">
                    <motion.a
                      variants={item}
                      href={`#${l.label.toLowerCase()}`}
                      onClick={() => setOpen(false)}
                      className="group flex items-baseline gap-4 rounded-md py-1 outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                      <span className="text-xs font-medium tabular-nums text-white/60">0{i + 1}</span>
                      <span className="text-5xl font-black tracking-tight transition-transform duration-500 group-hover:translate-x-3 sm:text-7xl">
                        {l.label}
                      </span>
                      <span className="hidden text-sm text-white/70 sm:inline">{l.sub}</span>
                      <ArrowUpRight className="ml-auto h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100" />
                    </motion.a>
                  </li>
                ))}
              </motion.ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function App() {
  return (
    <main className="min-h-screen bg-stone-100 text-slate-900 dark:bg-slate-950 dark:text-white">
      <CircleClipMenu />
      <section className="flex min-h-screen flex-col justify-center px-8 sm:px-16">
        <p className="text-xs font-semibold tracking-[0.3em] text-indigo-600 dark:text-indigo-400">CIRCLE CLIP MENU</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight sm:text-6xl">
          右上のボタンから、
          <br />
          円が画面を満たす。
        </h1>
        <p className="mt-5 max-w-lg text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          clip-path の円がボタン位置を起点に広がり、全画面メニューが開きます。Esc キーでも閉じられます。
        </p>
      </section>
    </main>
  );
}
