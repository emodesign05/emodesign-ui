import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* =========================================================
 * スクロール連動の連番画像（Scroll-Scrubbed Image Sequence）
 * - スクロールに合わせて、連番画像をコマ送りで <canvas> に描画（AirPods の製品ページのような表現）
 * - GSAP ScrollTrigger：画面を pin で固定し、scrub で「今のフレーム番号」を 0 → 最終コマへ補間
 * - 画像は最初にまとめて読み込み（プリロード）、描画は canvas の drawImage だけなので軽い
 * - Retina 対応（devicePixelRatio）・画面サイズに合わせて cover 描画
 * - frames（画像 URL の配列）を渡さない場合は、デモ用に Canvas で立体オブジェクトを描いたコマを使う
 *   → 実案件では 3D ソフトや動画から書き出した連番 JPG/WebP の URL 配列を渡す
 * - prefers-reduced-motion 時は中間のコマを1枚だけ表示
 * ========================================================= */

type Props = {
  /** 連番画像の URL（例：/seq/0001.webp 〜）。未指定ならデモ用の描画 */
  frames?: string[];
  /** デモ描画のコマ数（frames 未指定時） */
  frameCount?: number;
  /** 再生にかけるスクロール量（vh） */
  scrollLength?: number;
  /** 追従の遅れ（秒） */
  scrub?: number;
};

/** デモ用：frame 番号に応じて回転する立体（リング＋球）を描く */
function drawDemoFrame(ctx: CanvasRenderingContext2D, w: number, h: number, i: number, total: number) {
  const t = i / Math.max(1, total - 1);
  ctx.clearRect(0, 0, w, h);
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#0b1026');
  bg.addColorStop(1, '#1e1b4b');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(w, h) * 0.28;
  // 球
  const sphere = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.35, r * 0.1, cx, cy, r);
  sphere.addColorStop(0, `hsl(${250 + t * 90} 90% 75%)`);
  sphere.addColorStop(1, `hsl(${230 + t * 90} 70% 25%)`);
  ctx.fillStyle = sphere;
  ctx.beginPath();
  ctx.arc(cx, cy, r * (0.55 + 0.1 * Math.sin(t * Math.PI)), 0, Math.PI * 2);
  ctx.fill();
  // 3本のリング（回転角を frame から計算）
  for (let k = 0; k < 3; k++) {
    const angle = t * Math.PI * 2 + (k * Math.PI) / 3;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle * 0.5 + k);
    ctx.scale(1, Math.abs(Math.cos(angle)) * 0.9 + 0.1);
    ctx.strokeStyle = `hsla(${200 + k * 50 + t * 60} 90% 70% / 0.85)`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, r * (1 + k * 0.18), 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  // コマ番号
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = `${Math.round(h * 0.022)}px ui-monospace, monospace`;
  ctx.fillText(`FRAME ${String(i + 1).padStart(3, '0')} / ${total}`, w * 0.04, h * 0.95);
}

export function ScrollImageSequence({ frames, frameCount = 120, scrollLength = 300, scrub = 0.5 }: Props) {
  const rootRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const total = frames?.length ?? frameCount;

  // 画像をプリロード
  useEffect(() => {
    imagesRef.current = (frames ?? []).map((src) => {
      const img = new Image();
      img.src = src;
      return img;
    });
  }, [frames]);

  useGSAP(
    () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;
      const state = { frame: 0 };

      const render = () => {
        const i = Math.round(state.frame);
        const w = canvas.width;
        const h = canvas.height;
        const img = imagesRef.current[i];
        if (img?.complete && img.naturalWidth) {
          // cover で描画
          const s = Math.max(w / img.naturalWidth, h / img.naturalHeight);
          const dw = img.naturalWidth * s;
          const dh = img.naturalHeight * s;
          ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
        } else {
          drawDemoFrame(ctx, w, h, i, total);
        }
      };
      const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = canvas.clientWidth * dpr;
        canvas.height = canvas.clientHeight * dpr;
        render();
      };
      resize();
      window.addEventListener('resize', resize);

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        state.frame = Math.floor(total / 2);
        render();
      } else {
        gsap
          .timeline({
            scrollTrigger: { trigger: '[data-stage]', start: 'top top', end: `+=${(window.innerHeight * scrollLength) / 100}`, pin: true, scrub: scrub || true },
          })
          .to(state, { frame: total - 1, ease: 'none', snap: 'frame', onUpdate: render }, 0)
          .fromTo('[data-caption]', { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.15 }, 0.1)
          .to('[data-caption]', { autoAlpha: 0, y: -30, duration: 0.15 }, 0.75);
      }
      return () => window.removeEventListener('resize', resize);
    },
    { scope: rootRef, dependencies: [total, scrollLength, scrub], revertOnUpdate: true },
  );

  return (
    <main ref={rootRef} className="bg-[#0b1026] text-white">
      <section className="flex h-[60vh] flex-col justify-end px-8 pb-12 sm:px-16">
        <p className="text-xs font-semibold tracking-[0.3em] text-indigo-300">IMAGE SEQUENCE</p>
        <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">スクロールで、コマ送り。</h1>
      </section>
      <section data-stage className="relative h-screen">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" role="img" aria-label="スクロールに合わせて回転するオブジェクト" />
        <div data-caption className="invisible absolute bottom-[12vh] left-8 max-w-sm sm:left-16">
          <p className="text-3xl font-bold leading-tight sm:text-4xl">あらゆる角度から、<br />見せる。</p>
          <p className="mt-3 text-sm text-white/70">動画ではなく連番画像なので、スクロールを戻せば逆再生も自在です。</p>
        </div>
      </section>
      <section className="flex h-[60vh] items-center justify-center px-6 text-sm text-white/60">シーケンスはここまで。</section>
    </main>
  );
}

export default function App() {
  return <ScrollImageSequence />;
}
