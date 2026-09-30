import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

/* =========================================================
 * カスタムカーソル（Dual-Layer Custom Cursor）
 * - 内側のドット：カーソルに即時追従 / 外側のリング：バネで遅れて追従
 * - リンク・ボタン・[data-cursor="hover"] の上ではリングが拡大し、半透明の淡い塗りに変化（下の文字が透けて読める）
 * - カーソル色はアクセントカラー（インディゴ）＋白の縁取り影で、白背景・白文字・暗い背景のどれでも視認できる
 * - Canvas で細い軌跡（トレイル）を描画
 * - マウス（pointer: fine）のみ有効。タッチ端末・reduced-motion ではネイティブカーソルのまま
 * - 範囲は <CustomCursorArea> の内側だけ（ページ全体のカーソルは奪わない）
 * ========================================================= */

const HOVER_SELECTOR = 'a, button, [role="button"], [data-cursor="hover"]';

export function CustomCursorArea({ children, trail = true, ringSize: baseRing = 36, hoverRingSize = 72, ringStiffness = 350 }: { children: ReactNode; trail?: boolean; ringSize?: number; hoverRingSize?: number; ringStiffness?: number }) {
  const areaRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduceMotion = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [pressed, setPressed] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: ringStiffness, damping: 30, mass: 0.6 });
  const ringY = useSpring(y, { stiffness: ringStiffness, damping: 30, mass: 0.6 });

  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine)');
    const update = () => setEnabled(mq.matches && !reduceMotion);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [reduceMotion]);

  useEffect(() => {
    const area = areaRef.current;
    if (!enabled || !area) return;
    const points: { x: number; y: number; t: number }[] = [];

    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
      setHovering(!!(e.target as Element | null)?.closest?.(HOVER_SELECTOR));
      points.push({ x: e.clientX, y: e.clientY, t: performance.now() });
    };
    const onLeave = () => setVisible(false);
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);

    area.addEventListener('pointermove', onMove);
    area.addEventListener('pointerleave', onLeave);
    area.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);

    // ---- Canvas トレイル ----
    let raf = 0;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const resize = () => {
      if (!canvas || !ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const LIFE = 350; // ms
    const draw = () => {
      if (canvas && ctx) {
        const now = performance.now();
        while (points.length && now - points[0].t > LIFE) points.shift();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineCap = 'round';
        for (let i = 1; i < points.length; i++) {
          const a = points[i - 1];
          const b = points[i];
          const life = 1 - (now - b.t) / LIFE;
          ctx.strokeStyle = `rgba(129, 140, 248, ${life * 0.8})`;
          ctx.lineWidth = life * 3;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
      raf = requestAnimationFrame(draw);
    };
    if (trail) {
      resize();
      window.addEventListener('resize', resize);
      raf = requestAnimationFrame(draw);
    }

    return () => {
      area.removeEventListener('pointermove', onMove);
      area.removeEventListener('pointerleave', onLeave);
      area.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(raf);
    };
  }, [enabled, trail, x, y]);

  const ringSize = hovering ? hoverRingSize : baseRing;

  return (
    <div ref={areaRef} className={enabled ? 'cursor-none [&_*]:cursor-none' : ''}>
      {children}
      {enabled && (
        <div aria-hidden className="pointer-events-none fixed inset-0 z-[2147483000]">
          {trail && <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />}
          {/* 外側リング（遅れて追従）：ホバー時は半透明の塗りで、重なった文字が透けて見える */}
          <motion.div
            className="absolute left-0 top-0 rounded-full border-2 border-indigo-600 shadow-[0_0_0_1px_rgba(255,255,255,0.7)] dark:border-indigo-400 dark:shadow-[0_0_0_1px_rgba(0,0,0,0.5)]"
            style={{ x: ringX, y: ringY, translateX: '-50%', translateY: '-50%' }}
            animate={{
              width: ringSize,
              height: ringSize,
              opacity: visible ? 1 : 0,
              scale: pressed ? 0.85 : 1,
              backgroundColor: hovering ? 'rgba(99,102,241,0.14)' : 'rgba(99,102,241,0)',
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          />
          {/* 内側ドット（即時追従）：白い縁取りでどの背景でも見える */}
          <motion.div
            className="absolute left-0 top-0 h-2 w-2 rounded-full bg-indigo-600 shadow-[0_0_0_2px_rgba(255,255,255,0.9)] dark:bg-indigo-400 dark:shadow-[0_0_0_2px_rgba(0,0,0,0.6)]"
            style={{ x, y, translateX: '-50%', translateY: '-50%' }}
            animate={{ opacity: visible ? 1 : 0, scale: hovering ? 0.5 : 1 }}
            transition={{ duration: 0.15 }}
          />
        </div>
      )}
    </div>
  );
}

const WORKS = ['Brand Identity', 'Web Experience', 'Motion Graphics'];

export default function App() {
  return (
    <CustomCursorArea>
      <main className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-white">
        <section className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-20">
          <p className="text-xs font-semibold tracking-[0.3em] text-indigo-600 dark:text-indigo-400">CUSTOM CURSOR</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-6xl">
            カーソルも、
            <br />
            デザインの一部。
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            ドットは即座に、リングはやわらかく遅れて追いかけます。リンクやボタンに重ねるとリングが広がります。
          </p>

          <ul className="mt-12 divide-y divide-slate-200 border-y border-slate-200 dark:divide-slate-800 dark:border-slate-800">
            {WORKS.map((w, i) => (
              <li key={w}>
                <a href="#" className="group flex items-center justify-between py-6 text-2xl font-semibold sm:text-3xl">
                  <span>
                    <span className="mr-4 text-xs text-slate-400">0{i + 1}</span>
                    {w}
                  </span>
                  <ArrowUpRight className="h-6 w-6 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-12 flex flex-wrap gap-4">
            <button type="button" className="rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white">
              プロジェクトを相談する
            </button>
            <div data-cursor="hover" className="rounded-full border border-slate-300 px-6 py-3 text-sm dark:border-slate-700">
              data-cursor="hover" でも反応
            </div>
          </div>
        </section>
      </main>
    </CustomCursorArea>
  );
}
