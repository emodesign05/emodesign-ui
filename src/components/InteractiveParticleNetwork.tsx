import { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';

/* =========================================================
 * パーティクル背景（Interactive Canvas Particle Network）
 * - Canvas 2D で粒子を漂わせ、近い粒子同士を線で結ぶネットワーク表現
 * - マウス周辺の粒子はカーソルと線で結ばれ、ゆるく押し出される
 * - DPR 対応 / ResizeObserver で親要素サイズに追従 / 面積に応じて粒子数を自動調整
 * - 画面外・タブ非表示時は描画停止（IntersectionObserver + visibilitychange）
 * - prefers-reduced-motion 時は静止画を1枚だけ描画
 * - ライト/ダークで配色を自動切替（prefers-color-scheme）
 * ========================================================= */

type Particle = { x: number; y: number; vx: number; vy: number; r: number };

type NetworkOptions = {
  /** 1万px²あたりの粒子数（密度） */
  density: number;
  /** 線で結ぶ最大距離（px） */
  linkDistance: number;
  /** 漂う速度（px/frame） */
  speed: number;
  /** マウスの影響半径（px） */
  mouseRadius: number;
  /** マウスが粒子を押し出す強さ */
  repel: number;
};

const DEFAULTS: NetworkOptions = {
  density: 0.9,
  linkDistance: 130,
  speed: 0.35,
  mouseRadius: 160,
  repel: 0.6,
};

const THEMES = {
  light: { dot: '79, 70, 229', line: '99, 102, 241' }, // indigo-600 / indigo-500
  dark: { dot: '165, 180, 252', line: '129, 140, 248' }, // indigo-300 / indigo-400
};

export function ParticleNetwork(props: Partial<NetworkOptions>) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const optsRef = useRef<NetworkOptions>({ ...DEFAULTS, ...props });
  const { density, linkDistance, speed, mouseRadius, repel } = props;

  // props の変更は ref 経由で描画ループに反映（ループ自体は作り直さない）
  useEffect(() => {
    optsRef.current = {
      density: density ?? DEFAULTS.density,
      linkDistance: linkDistance ?? DEFAULTS.linkDistance,
      speed: speed ?? DEFAULTS.speed,
      mouseRadius: mouseRadius ?? DEFAULTS.mouseRadius,
      repel: repel ?? DEFAULTS.repel,
    };
  }, [density, linkDistance, speed, mouseRadius, repel]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mqDark = window.matchMedia('(prefers-color-scheme: dark)');

    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let raf = 0;
    let inView = true;
    const mouse = { x: -9999, y: -9999, active: false };

    const createParticles = () => {
      const { density, speed } = optsRef.current;
      const count = Math.min(220, Math.round(((width * height) / 10000) * density));
      particles = Array.from({ length: count }, () => {
        const angle = Math.random() * Math.PI * 2;
        const v = speed * (0.4 + Math.random() * 0.6);
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: Math.cos(angle) * v,
          vy: Math.sin(angle) * v,
          r: 1 + Math.random() * 1.6,
        };
      });
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      createParticles();
      if (mqReduce.matches) draw(false);
    };

    const draw = (animate: boolean) => {
      const { linkDistance, mouseRadius, repel } = optsRef.current;
      const color = mqDark.matches ? THEMES.dark : THEMES.light;
      const linkSq = linkDistance * linkDistance;
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        if (animate) {
          // マウスからの押し出し
          if (mouse.active) {
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const d = Math.hypot(dx, dy);
            if (d < mouseRadius && d > 0.01) {
              const f = (1 - d / mouseRadius) * repel;
              p.x += (dx / d) * f;
              p.y += (dy / d) * f;
            }
          }
          p.x += p.vx;
          p.y += p.vy;
          // 端で折り返し
          if (p.x < 0 || p.x > width) p.vx *= -1;
          if (p.y < 0 || p.y > height) p.vy *= -1;
          p.x = Math.max(0, Math.min(width, p.x));
          p.y = Math.max(0, Math.min(height, p.y));
        }
      }

      // 粒子同士の線（距離が近いほど濃く）
      ctx.lineWidth = 1;
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dSq = dx * dx + dy * dy;
          if (dSq < linkSq) {
            const alpha = (1 - Math.sqrt(dSq) / linkDistance) * 0.35;
            ctx.strokeStyle = `rgba(${color.line}, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
        // カーソルとの線
        if (mouse.active) {
          const d = Math.hypot(a.x - mouse.x, a.y - mouse.y);
          if (d < mouseRadius) {
            ctx.strokeStyle = `rgba(${color.line}, ${(1 - d / mouseRadius) * 0.6})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }

      // 粒子本体
      ctx.fillStyle = `rgba(${color.dot}, 0.9)`;
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const loop = () => {
      draw(true);
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      cancelAnimationFrame(raf);
      if (mqReduce.matches) {
        draw(false);
        return;
      }
      if (inView && document.visibilityState === 'visible') raf = requestAnimationFrame(loop);
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = mouse.x >= 0 && mouse.y >= 0 && mouse.x <= rect.width && mouse.y <= rect.height;
    };
    const onPointerLeave = () => {
      mouse.active = false;
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      start();
    });
    io.observe(canvas);

    const onVisibility = () => start();
    const onScheme = () => mqReduce.matches && draw(false);

    // canvas は pointer-events-none のため、親セクション上の動きを window で拾う
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('pointerleave', onPointerLeave);
    document.addEventListener('visibilitychange', onVisibility);
    mqReduce.addEventListener('change', start);
    mqDark.addEventListener('change', onScheme);

    resize();
    start();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerleave', onPointerLeave);
      document.removeEventListener('visibilitychange', onVisibility);
      mqReduce.removeEventListener('change', start);
      mqDark.removeEventListener('change', onScheme);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />;
}

export default function App() {
  return (
    <main className="bg-slate-50 dark:bg-slate-950">
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
        {/* 背景：パーティクルネットワーク */}
        <ParticleNetwork density={0.9} linkDistance={130} speed={0.35} mouseRadius={160} repel={0.6} />

        {/* 可読性のための中央ビネット */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(248,250,252,0.85)_0%,rgba(248,250,252,0)_60%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(2,6,23,0.85)_0%,rgba(2,6,23,0)_60%)]"
        />

        <div className="relative z-10 max-w-2xl text-center">
          <p className="text-xs font-semibold tracking-[0.35em] text-indigo-600 dark:text-indigo-400">CONNECTED EXPERIENCE</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight text-slate-900 sm:text-6xl dark:text-white">
            点と点をつなぎ、
            <br />
            体験をデザインする。
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-300">
            カーソルを動かすと、周囲の粒子がゆるやかに反応します。
          </p>
          <a
            href="#contact"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
          >
            プロジェクトを相談する <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>
    </main>
  );
}
