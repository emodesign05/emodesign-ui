import { useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform, useVelocity } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

/* =========================================================
 * ホバーピーク（Cursor-Following Hover Image Peek）
 * - テキストのリスト（作品一覧など）にホバーすると、該当画像がカーソルに追従して現れる
 * - 画像は移動速度に応じてわずかに傾き、慣性のある“ついてくる”動き
 * - 項目を移ると画像がクロスフェードで切り替わる
 * - マウス専用の演出。タッチ端末では各行に小さなサムネイルを常時表示
 * - prefers-reduced-motion 時は傾きなし・フェードのみ
 * ========================================================= */

type Item = { title: string; category: string; year: string; img: string };

const ITEMS: Item[] = [
  { title: 'Lumen Studio', category: 'Branding', year: '2026', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80' },
  { title: 'Kaze Records', category: 'Web Design', year: '2026', img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80' },
  { title: 'Mori Ceramics', category: 'E-commerce', year: '2025', img: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=80' },
  { title: 'Aoi Architects', category: 'Portfolio', year: '2025', img: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&q=80' },
  { title: 'Hikari Coffee', category: 'Packaging', year: '2024', img: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80' },
];

const PEEK_W = 280;
const PEEK_H = 200;

export function HoverImagePeek({ peekW = PEEK_W, peekH = PEEK_H, tilt = 12, stiffness = 180 }: { peekW?: number; peekH?: number; tilt?: number; stiffness?: number }) {
  const listRef = useRef<HTMLUListElement>(null);
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState<number | null>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness, damping: 22, mass: 0.6 });
  const sy = useSpring(y, { stiffness, damping: 22, mass: 0.6 });
  const vx = useVelocity(sx);
  const rotate = useTransform(vx, [-2000, 0, 2000], reduceMotion ? [0, 0, 0] : [-tilt, 0, tilt], { clamp: true });

  const onMove = (e: PointerEvent<HTMLUListElement>) => {
    if (e.pointerType !== 'mouse' || !listRef.current) return;
    const r = listRef.current.getBoundingClientRect();
    x.set(e.clientX - r.left - peekW / 2);
    y.set(e.clientY - r.top - peekH / 2);
  };

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-20 text-stone-900 dark:bg-neutral-950 dark:text-neutral-100">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-semibold tracking-[0.3em] text-indigo-600 dark:text-indigo-400">HOVER PEEK</p>
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Selected Works</h1>

        <ul
          ref={listRef}
          onPointerMove={onMove}
          onPointerLeave={() => setActive(null)}
          className="relative mt-12 border-t border-stone-300 dark:border-neutral-800"
        >
          {ITEMS.map((item, i) => (
            <li key={item.title} className="border-b border-stone-300 dark:border-neutral-800">
              <a
                href="#"
                onPointerEnter={(e) => e.pointerType === 'mouse' && setActive(i)}
                onFocus={() => setActive(null)}
                className={`group flex items-center gap-4 py-6 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  active !== null && active !== i ? 'opacity-30' : ''
                }`}
              >
                {/* タッチ端末向けのサムネイル（マウス環境では非表示） */}
                <img src={item.img} alt="" className="h-12 w-16 rounded object-cover [@media(pointer:fine)]:hidden" />
                <span className="text-2xl font-semibold tracking-tight transition-transform duration-500 group-hover:translate-x-2 sm:text-5xl">
                  {item.title}
                </span>
                <span className="ml-auto hidden text-xs text-stone-500 sm:inline dark:text-neutral-400">{item.category}</span>
                <span className="w-12 text-right text-xs tabular-nums text-stone-500 dark:text-neutral-400">{item.year}</span>
                <ArrowUpRight className="h-5 w-5 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
              </a>
            </li>
          ))}

          {/* カーソル追従する画像 */}
          <motion.li
            aria-hidden
            style={{ x: sx, y: sy, rotate, width: peekW, height: peekH }}
            className="pointer-events-none absolute left-0 top-0 z-10 list-none overflow-hidden rounded-xl shadow-2xl"
            animate={{ opacity: active === null ? 0 : 1, scale: active === null ? 0.6 : 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          >
            <AnimatePresence initial={false}>
              {active !== null && (
                <motion.img
                  key={active}
                  src={ITEMS[active].img}
                  alt=""
                  initial={{ opacity: 0, scale: 1.15 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
            </AnimatePresence>
          </motion.li>
        </ul>
      </div>
    </main>
  );
}


export default function App() {
  return <HoverImagePeek />;
}
