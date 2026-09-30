import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/* =========================================================
 * パーティクル文字（Particle Text Morph）
 * - たくさんの粒子が集まって文字（ロゴ）になり、マウスを近づけると散って、離れると元に戻る
 * - 仕組み：画面外の canvas に文字を描き、その「塗られているピクセル」を間引いて粒子の目標位置にする
 * - 粒子はバネ（目標へ戻る力）＋ 摩擦 ＋ マウスからの反発で毎フレーム動かす（Canvas 2D / 1万粒程度まで軽快）
 * - words を複数渡すと、一定時間ごとに別の文字へ粒子が組み替わる（モーフ）
 * - 初回は粒子が画面中に散らばった状態から集まる（GSAP で集合の強さを 0→1 に tween）
 * - 読み上げは aria-label、prefers-reduced-motion 時は反発・モーフなしの静止表示
 * ========================================================= */

type Props = {
  /** 表示する文字（複数でモーフ） */
  words?: string[];
  /** 粒子の間隔（px）。小さいほど粒子が増えて精細（重くなる） */
  gap?: number;
  /** 粒子の大きさ（px） */
  particleSize?: number;
  /** マウスの反発半径（px） */
  repelRadius?: number;
  /** 文字を切り替える間隔（秒） */
  interval?: number;
  color?: string;
};

type P = { x: number; y: number; vx: number; vy: number; tx: number; ty: number; a: number };

export function ParticleText({ words = ['EMO', 'DESIGN', 'MOTION'], gap = 5, particleSize = 2, repelRadius = 90, interval = 3.5, color = '#a5b4fc' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wordsKey = words.join('|');

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const list = wordsKey.split('|');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const particles: P[] = [];
    const mouse = { x: -9999, y: -9999 };
    const gather = { k: reduce ? 1 : 0 }; // 集合の強さ（0＝散らばる / 1＝文字に集まる）
    let w = 0;
    let h = 0;
    let wordIndex = 0;

    /** 文字を描いてピクセルから目標点を作る */
    const targetsFor = (text: string) => {
      const off = document.createElement('canvas');
      off.width = w;
      off.height = h;
      const o = off.getContext('2d');
      if (!o) return [];
      const fontSize = Math.min(h * 0.55, (w * 1.6) / Math.max(3, text.length));
      o.font = `900 ${fontSize}px system-ui, -apple-system, "Hiragino Sans", sans-serif`;
      o.textAlign = 'center';
      o.textBaseline = 'middle';
      o.fillStyle = '#fff';
      o.fillText(text, w / 2, h / 2);
      const data = o.getImageData(0, 0, w, h).data;
      const pts: { x: number; y: number }[] = [];
      for (let y = 0; y < h; y += gap) for (let x = 0; x < w; x += gap) if (data[(y * w + x) * 4 + 3] > 128) pts.push({ x: x + (Math.random() - 0.5) * gap * 0.6, y: y + (Math.random() - 0.5) * gap * 0.6 }); // 少し揺らして機械的な格子感をなくす
      return pts;
    };

    /** 粒子の目標を新しい文字に割り当て直す（足りなければ増やし、余ればフェードアウト） */
    const assign = (text: string) => {
      const pts = targetsFor(text);
      pts.sort(() => Math.random() - 0.5);
      for (let i = 0; i < Math.max(pts.length, particles.length); i++) {
        const t = pts[i];
        let p = particles[i];
        if (!p) {
          p = { x: Math.random() * w, y: Math.random() * h, vx: 0, vy: 0, tx: 0, ty: 0, a: 1 };
          particles.push(p);
        }
        if (t) {
          p.tx = t.x;
          p.ty = t.y;
          p.a = 1;
        } else {
          p.tx = Math.random() * w;
          p.ty = Math.random() * h;
          p.a = 0;
        }
      }
    };

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      assign(list[wordIndex % list.length]);
    };
    resize();
    window.addEventListener('resize', resize);

    const intro = gsap.to(gather, { k: 1, duration: 2.2, ease: 'power3.inOut', delay: 0.3 });
    const timer = !reduce && list.length > 1 ? window.setInterval(() => assign(list[++wordIndex % list.length]), interval * 1000) : 0;

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerleave', onLeave);

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = color;
      for (const p of particles) {
        // 目標へ戻るバネ
        p.vx += (p.tx - p.x) * 0.02 * gather.k;
        p.vy += (p.ty - p.y) * 0.02 * gather.k;
        // マウスからの反発
        if (!reduce) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < repelRadius * repelRadius) {
            const d = Math.sqrt(d2) || 1;
            const f = (1 - d / repelRadius) * 6;
            p.vx += (dx / d) * f;
            p.vy += (dy / d) * f;
          }
        }
        p.vx *= 0.86;
        p.vy *= 0.86;
        p.x += p.vx;
        p.y += p.vy;
        if (p.a <= 0) continue;
        ctx.globalAlpha = p.a;
        ctx.fillRect(p.x, p.y, particleSize, particleSize);
      }
      ctx.globalAlpha = 1;
    };
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      intro.kill();
      window.clearInterval(timer);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
    };
  }, [wordsKey, gap, particleSize, repelRadius, interval, color]);

  return <canvas ref={canvasRef} role="img" aria-label={words.join(' / ')} className="h-full w-full" />;
}

export default function App() {
  return (
    <main className="relative flex min-h-screen flex-col bg-neutral-950 text-white">
      <div className="px-8 pt-10 sm:px-16">
        <p className="text-xs font-semibold tracking-[0.3em] text-indigo-400">PARTICLE TEXT</p>
        <p className="mt-2 text-sm text-neutral-400">文字にカーソルを近づけると、粒子が散ります。</p>
      </div>
      <div className="h-[75vh] w-full">
        <ParticleText />
      </div>
    </main>
  );
}
