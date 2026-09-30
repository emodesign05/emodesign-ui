import { useRef, useState } from 'react';
import type { KeyboardEvent, PointerEvent } from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';

/* =========================================================
 * イメージズーム（Inner Image Zoom Container）
 * - 枠の中で画像がカーソル位置を中心に拡大（ECの商品詳細・作品詳細向け）
 * - マウス：ホバーで拡大 / タッチ：タップで拡大・もう一度タップで解除
 * - キーボード：Enter / Space で拡大切替、矢印キーで拡大位置を移動
 * - transform-origin を ref で直接書き換えるため、移動中の再レンダーなし
 * ========================================================= */

type InnerImageZoomProps = {
  src: string;
  alt: string;
  /** 拡大率 */
  zoom?: number;
  /** 縦横比（Tailwind の aspect クラス） */
  aspectClass?: string;
};

export function InnerImageZoom({ src, alt, zoom = 2.2, aspectClass = 'aspect-[4/5]' }: InnerImageZoomProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const origin = useRef({ x: 50, y: 50 });
  const [active, setActive] = useState(false);

  const applyOrigin = () => {
    if (imgRef.current) imgRef.current.style.transformOrigin = `${origin.current.x}% ${origin.current.y}%`;
  };

  const moveTo = (e: PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    origin.current = {
      x: Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100)),
      y: Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100)),
    };
    applyOrigin();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActive((v) => !v);
      return;
    }
    if (e.key === 'Escape') setActive(false);
    const step = 8;
    const map: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const d = map[e.key];
    if (!d || !active) return;
    e.preventDefault();
    origin.current = {
      x: Math.min(100, Math.max(0, origin.current.x + d[0])),
      y: Math.min(100, Math.max(0, origin.current.y + d[1])),
    };
    applyOrigin();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={active}
      aria-label={`${alt}（${active ? '拡大中。矢印キーで移動、Escで解除' : 'Enterで拡大'}）`}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setActive(true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setActive(false)}
      onPointerMove={moveTo}
      onPointerDown={(e) => {
        if (e.pointerType !== 'mouse') {
          moveTo(e);
          setActive((v) => !v);
        }
      }}
      onKeyDown={onKeyDown}
      className={`group relative ${aspectClass} w-full cursor-zoom-in overflow-hidden rounded-2xl bg-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:bg-slate-800 dark:focus-visible:ring-offset-slate-950 ${active ? 'cursor-zoom-out' : ''}`}
    >
      <img
        ref={imgRef}
        src={src}
        alt=""
        draggable={false}
        className="h-full w-full select-none object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
        style={{ transform: `scale(${active ? zoom : 1})` }}
      />
      {/* 状態バッジ */}
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur transition-opacity group-hover:opacity-0"
      >
        {active ? <ZoomOut className="h-3.5 w-3.5" /> : <ZoomIn className="h-3.5 w-3.5" />}
        {active ? '拡大中' : 'ホバーで拡大'}
      </span>
    </div>
  );
}

const IMAGES = [
  { src: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&q=80', alt: 'ミニマルな腕時計' },
  { src: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80', alt: '赤いスニーカー' },
  { src: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=1200&q=80', alt: 'ヴィンテージカメラ' },
];

export default function App() {
  return (
    <main className="min-h-screen bg-white px-6 py-20 dark:bg-slate-950">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-semibold tracking-[0.3em] text-indigo-600 dark:text-indigo-400">INNER IMAGE ZOOM</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl dark:text-white">ディテールまで、覗き込む。</h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          画像にカーソルを乗せると、その位置を中心に拡大します（タッチはタップ、キーボードは Enter）。
        </p>
        <ul className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {IMAGES.map((img) => (
            <li key={img.src}>
              <InnerImageZoom src={img.src} alt={img.alt} />
              <p className="mt-3 text-sm font-medium text-slate-800 dark:text-slate-200">{img.alt}</p>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
