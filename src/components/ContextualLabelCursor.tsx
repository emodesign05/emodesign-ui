import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';

/* =========================================================
 * コンテキストカーソルラベル（Contextual Label Cursor）
 * - data-cursor-label="View" のような属性を持つ要素に重なると、
 *   カーソル位置に丸いラベル（View / Play / Drag など）が現れて追従する
 * - 要素ごとに文字と色（data-cursor-color）を変えられる
 * - 通常のカーソルはそのまま（ラベル表示中の要素上だけ非表示）
 * - マウスのみ有効。タッチ・reduced-motion ではラベルを出さない
 * ========================================================= */

const fineQuery = '(pointer: fine)';
const subscribeFine = (cb: () => void) => {
  const mq = window.matchMedia(fineQuery);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
};
const getFine = () => window.matchMedia(fineQuery).matches;

export function LabelCursorArea({ children, size = 80, stiffness = 500 }: { children: ReactNode; size?: number; stiffness?: number }) {
  const areaRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const fine = useSyncExternalStore(subscribeFine, getFine, () => false);
  const enabled = fine && !reduceMotion;
  const [label, setLabel] = useState<{ text: string; color: string } | null>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness, damping: 35 });
  const sy = useSpring(y, { stiffness, damping: 35 });

  useEffect(() => {
    const area = areaRef.current;
    if (!enabled || !area) return;
    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const el = (e.target as Element | null)?.closest?.<HTMLElement>('[data-cursor-label]');
      setLabel((prev) => {
        const text = el?.dataset.cursorLabel;
        if (!text) return prev ? null : prev;
        const color = el.dataset.cursorColor ?? '#4f46e5';
        return prev?.text === text && prev.color === color ? prev : { text, color };
      });
    };
    const onLeave = () => setLabel(null);
    area.addEventListener('pointermove', onMove);
    area.addEventListener('pointerleave', onLeave);
    return () => {
      area.removeEventListener('pointermove', onMove);
      area.removeEventListener('pointerleave', onLeave);
    };
  }, [enabled, x, y]);

  return (
    <div ref={areaRef} className={enabled ? '[&_[data-cursor-label]]:cursor-none [&_[data-cursor-label]_*]:cursor-none' : ''}>
      {children}
      {enabled && (
        <motion.div aria-hidden className="pointer-events-none fixed left-0 top-0 z-[2147483000]" style={{ x: sx, y: sy }}>
          <AnimatePresence>
            {label && (
              <motion.div
                key={label.text}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                style={{ backgroundColor: label.color, width: size, height: size }}
                className="flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-xs font-bold uppercase tracking-widest text-white shadow-xl"
              >
                {label.text}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

const PROJECTS = [
  { title: 'Kinetic Type', tag: 'Web / Motion', img: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=1200&q=80', label: 'View', color: '#4f46e5' },
  { title: 'Soundscape', tag: 'Film', img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&q=80', label: 'Play', color: '#e11d48' },
  { title: 'Material Study', tag: 'Gallery', img: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1200&q=80', label: 'Drag', color: '#0d9488' },
  { title: 'Night Market', tag: 'Photography', img: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=1200&q=80', label: 'Open', color: '#d97706' },
];

export default function App() {
  return (
    <LabelCursorArea>
      <main className="min-h-screen bg-white px-6 py-20 text-slate-900 dark:bg-slate-950 dark:text-white">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-semibold tracking-[0.3em] text-indigo-600 dark:text-indigo-400">CONTEXTUAL CURSOR</p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">カーソルが、次の行動を教える。</h1>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">作品の上にカーソルを重ねると、内容に応じたラベルが現れます。</p>
          <ul className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2">
            {PROJECTS.map((p) => (
              <li key={p.title}>
                <a href="#" data-cursor-label={p.label} data-cursor-color={p.color} className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-4 dark:focus-visible:ring-offset-slate-950">
                  <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-slate-200 dark:bg-slate-800">
                    <img src={p.img} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none" />
                  </div>
                  <div className="mt-4 flex items-baseline justify-between">
                    <h2 className="text-lg font-bold">{p.title}</h2>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{p.tag}</span>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </LabelCursorArea>
  );
}
