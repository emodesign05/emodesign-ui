import { useEffect, useRef } from 'react';

/* =========================================================
 * ウォーターリップル（Canvas Water Ripple Effect）
 * - 2枚の高さマップを交互に計算する古典的な波動シミュレーション
 * - 波の傾きで背景画像のピクセルをずらし、水面の屈折を表現
 * - カーソル移動・クリックで波紋、何もしなくても時々しずくが落ちる
 * - 内部解像度を下げて計算し、拡大描画して軽量化（resolution）
 * - 画面外・タブ非表示で停止 / prefers-reduced-motion 時は静止画
 * ========================================================= */

type RippleOptions = {
  /** 計算解像度（0.25〜1）。低いほど軽く、柔らかい見た目 */
  resolution: number;
  /** 波の減衰（0.9〜0.99）。大きいほど長く残る */
  damping: number;
  /** 1回の波紋の強さ */
  strength: number;
  /** 波紋の半径（内部px） */
  radius: number;
  /** 自動でしずくが落ちる間隔（ms）。0 で無効 */
  dropInterval: number;
};

const DEFAULTS: RippleOptions = { resolution: 0.5, damping: 0.965, strength: 420, radius: 3, dropInterval: 900 };

/** 背景（グラデーション＋同心円＋テキスト）を描く。画像を使う場合はここを drawImage に置き換え */
function paintSource(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, '#0f172a');
  g.addColorStop(0.5, '#0e7490');
  g.addColorStop(1, '#312e81');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = Math.max(1, w / 600);
  for (let r = 20; r < Math.max(w, h); r += w / 30) {
    ctx.beginPath();
    ctx.arc(w * 0.7, h * 0.4, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.font = `900 ${Math.round(w / 7)}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('RIPPLE', w / 2, h / 2);
}

export function WaterRipple(props: Partial<RippleOptions>) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolution = DEFAULTS.resolution, damping = DEFAULTS.damping, strength = DEFAULTS.strength, radius = DEFAULTS.radius, dropInterval = DEFAULTS.dropInterval } = props;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });
    if (!canvas || !ctx) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const off = document.createElement('canvas');
    const offCtx = off.getContext('2d', { willReadFrequently: true });
    if (!offCtx) return;

    let w = 0;
    let h = 0;
    let bufA = new Float32Array(0);
    let bufB = new Float32Array(0);
    let source: ImageData | null = null;
    let output: ImageData | null = null;
    let raf = 0;
    let visible = true;
    let lastDrop = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = Math.max(2, Math.round(rect.width * resolution));
      h = Math.max(2, Math.round(rect.height * resolution));
      canvas.width = w;
      canvas.height = h;
      off.width = w;
      off.height = h;
      paintSource(offCtx, w, h);
      source = offCtx.getImageData(0, 0, w, h);
      output = ctx.createImageData(w, h);
      bufA = new Float32Array(w * h);
      bufB = new Float32Array(w * h);
      ctx.putImageData(source, 0, 0);
    };

    const disturb = (cx: number, cy: number, power: number) => {
      const x0 = Math.round(cx);
      const y0 = Math.round(cy);
      for (let y = -radius; y <= radius; y++) {
        for (let x = -radius; x <= radius; x++) {
          const px = x0 + x;
          const py = y0 + y;
          if (px < 1 || py < 1 || px >= w - 1 || py >= h - 1 || x * x + y * y > radius * radius) continue;
          bufA[py * w + px] += power;
        }
      }
    };

    const step = () => {
      if (!source || !output) return;
      // 波動方程式（近傍4点の平均 − 1つ前）
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const i = y * w + x;
          bufB[i] = ((bufA[i - 1] + bufA[i + 1] + bufA[i - w] + bufA[i + w]) / 2 - bufB[i]) * damping;
        }
      }
      // 屈折：傾きの分だけ参照ピクセルをずらす
      const src = source.data;
      const out = output.data;
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const i = y * w + x;
          const dx = bufB[i - 1] - bufB[i + 1];
          const dy = bufB[i - w] - bufB[i + w];
          const sx = Math.min(w - 1, Math.max(0, x + (dx >> 3)));
          const sy = Math.min(h - 1, Math.max(0, y + (dy >> 3)));
          const si = (sy * w + sx) * 4;
          const oi = i * 4;
          const shade = dx * 0.08; // 傾きでハイライト
          out[oi] = src[si] + shade;
          out[oi + 1] = src[si + 1] + shade;
          out[oi + 2] = src[si + 2] + shade;
          out[oi + 3] = 255;
        }
      }
      ctx.putImageData(output, 0, 0);
      const t = bufA;
      bufA = bufB;
      bufB = t;
    };

    const loop = (time: number) => {
      if (dropInterval > 0 && time - lastDrop > dropInterval) {
        lastDrop = time;
        disturb(Math.random() * w, Math.random() * h, strength * 0.6);
      }
      step();
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      cancelAnimationFrame(raf);
      if (!reduce && visible && document.visibilityState === 'visible') raf = requestAnimationFrame(loop);
    };

    const toLocal = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return [((e.clientX - rect.left) / rect.width) * w, ((e.clientY - rect.top) / rect.height) * h] as const;
    };
    const onMove = (e: PointerEvent) => {
      const [x, y] = toLocal(e);
      disturb(x, y, strength * 0.35);
    };
    const onDown = (e: PointerEvent) => {
      const [x, y] = toLocal(e);
      disturb(x, y, strength * 2);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      start();
    });
    io.observe(canvas);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerdown', onDown);
    document.addEventListener('visibilitychange', start);
    resize();
    start();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerdown', onDown);
      document.removeEventListener('visibilitychange', start);
    };
  }, [resolution, damping, strength, radius, dropInterval]);

  return <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full touch-none [image-rendering:auto]" />;
}

export default function App() {
  return (
    <main className="bg-slate-950">
      <section className="relative flex min-h-screen items-end overflow-hidden">
        <WaterRipple resolution={0.5} damping={0.965} strength={420} radius={3} dropInterval={900} />
        <div className="pointer-events-none relative z-10 w-full bg-gradient-to-t from-slate-950/80 to-transparent px-8 pb-16 pt-32 sm:px-16">
          <p className="text-xs font-semibold tracking-[0.3em] text-cyan-300">WATER RIPPLE</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-bold leading-tight text-white sm:text-6xl">水面に、触れる。</h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-300">
            カーソルを動かすと波紋が広がり、クリックすると大きな波が立ちます。
          </p>
        </div>
      </section>
    </main>
  );
}
