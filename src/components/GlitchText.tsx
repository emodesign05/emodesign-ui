import { useRef } from 'react';
import type { CSSProperties } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ArrowRight, Radio } from 'lucide-react';

gsap.registerPlugin(useGSAP);

/* =========================================================
 * グリッチテキスト（Glitch Text）
 * - 文字が断続的に「壊れる」演出。テック系・エンタメ系の黒背景ヒーロー向け
 * - 仕組み：
 *   1. RGB ずれ … ::before / ::after の擬似要素 2 層に content: attr(data-text) で同じ文字を出し、
 *      それぞれ別の色（赤系・青系）で mix-blend-mode: screen。位置と clip-path を CSS 変数で動かす
 *   2. 横に走る切れ目 … clip-path: inset(上% 0 下% 0) で横帯だけを切り出した層を左右にずらす
 *   3. ノイズ … SVG feTurbulence のノイズ画像を一瞬だけ重ね、位置をランダムに飛ばす
 * - GSAP のタイムラインで 1 回のグリッチ（数フレームのコマ送り）を作り、
 *   gsap.delayedCall でランダムな間隔をあけて繰り返す（frequency = 1 秒あたりの平均回数）
 * - hoverBoost を有効にすると、ホバー中は間隔が短く・ずれが大きくなる
 * - 擬似要素は読み上げ対象になりうるので、見た目の層は aria-hidden、テキストは sr-only で 1 回だけ読ませる
 * - prefers-reduced-motion: reduce のときはグリッチを発生させず、わずかな色ずれだけの静止表示
 * ========================================================= */

const NOISE =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.4 -0.2'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

const CSS = `
.glx-text{position:relative;display:inline-block}
.glx-text::before,.glx-text::after{content:attr(data-text);position:absolute;inset:0;pointer-events:none;mix-blend-mode:screen;opacity:var(--glx-o,0.85);will-change:transform,clip-path}
.glx-text::before{color:var(--glx-a);transform:translate3d(var(--glx-ax,0px),var(--glx-ay,0px),0);clip-path:var(--glx-clip-a,inset(0 0 0 0))}
.glx-text::after{color:var(--glx-b);transform:translate3d(var(--glx-bx,0px),var(--glx-by,0px),0);clip-path:var(--glx-clip-b,inset(0 0 0 0))}
`;

type Props = {
  /** 表示するテキスト */
  text?: string;
  /** 発生頻度（1 秒あたりの平均回数） */
  frequency?: number;
  /** 強さ（0〜1）。ずれ幅・傾き・ノイズの濃さ */
  intensity?: number;
  /** ずれ色 1（赤系） */
  colorA?: string;
  /** ずれ色 2（青系） */
  colorB?: string;
  /** ホバー中にグリッチを強くする */
  hoverBoost?: boolean;
  /** 追加クラス（フォントサイズ・太さなどは親か className で指定） */
  className?: string;
};

export function GlitchText({
  text = 'SIGNAL LOST',
  frequency = 0.6,
  intensity = 0.5,
  colorA = '#ff2a6d',
  colorB = '#05d9e8',
  hoverBoost = true,
  className = '',
}: Props) {
  const rootRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const main = root.querySelector<HTMLElement>('[data-glx-main]');
      const slices = gsap.utils.toArray<HTMLElement>('[data-glx-slice]', root);
      const noise = root.querySelector<HTMLElement>('[data-glx-noise]');
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // 待機中のわずかな色ずれ（フォントサイズに比例）
      const unit = () => parseFloat(getComputedStyle(root).fontSize) || 16;
      const idle = () => {
        const d = Math.max(1, unit() * 0.012 * (0.5 + intensity));
        gsap.set(root, {
          '--glx-ax': `${-d}px`,
          '--glx-bx': `${d}px`,
          '--glx-ay': '0px',
          '--glx-by': '0px',
          '--glx-clip-a': 'inset(0% 0 0% 0)',
          '--glx-clip-b': 'inset(0% 0 0% 0)',
          '--glx-o': 0.75,
        });
        if (main) gsap.set(main, { x: 0, skewX: 0 });
        gsap.set(slices, { autoAlpha: 0, x: 0 });
        if (noise) gsap.set(noise, { autoAlpha: 0 });
      };
      idle();
      if (reduce || intensity <= 0) return;

      let hovering = false;
      let tl: gsap.core.Timeline | null = null;
      let next: gsap.core.Tween | null = null;

      const band = () => {
        const top = gsap.utils.random(0, 85);
        const h = gsap.utils.random(4, 28);
        return `inset(${top.toFixed(1)}% 0 ${Math.max(0, 100 - top - h).toFixed(1)}% 0)`;
      };

      const burst = () => {
        const k = intensity * (hovering && hoverBoost ? 1.8 : 1);
        const amp = unit() * 0.09 * k;
        const steps = Math.round(gsap.utils.random(3, 7));
        const dt = gsap.utils.random(0.035, 0.06);
        tl?.kill();
        tl = gsap.timeline({ onComplete: idle });
        for (let i = 0; i < steps; i++) {
          const t = i * dt;
          tl.set(
            root,
            {
              '--glx-ax': `${gsap.utils.random(-amp, amp)}px`,
              '--glx-bx': `${gsap.utils.random(-amp, amp)}px`,
              '--glx-ay': `${gsap.utils.random(-amp, amp) * 0.25}px`,
              '--glx-by': `${gsap.utils.random(-amp, amp) * 0.25}px`,
              '--glx-clip-a': Math.random() > 0.3 ? band() : 'inset(0% 0 0% 0)',
              '--glx-clip-b': Math.random() > 0.3 ? band() : 'inset(0% 0 0% 0)',
              '--glx-o': 1,
            },
            t,
          );
          if (main) tl.set(main, { x: gsap.utils.random(-amp, amp) * 0.3, skewX: gsap.utils.random(-10, 10) * k }, t);
          slices.forEach((s) => {
            const on = Math.random() > 0.35;
            tl?.set(s, { autoAlpha: on ? 1 : 0, x: gsap.utils.random(-amp * 1.6, amp * 1.6), clipPath: band() }, t);
          });
          if (noise) {
            tl.set(
              noise,
              {
                autoAlpha: gsap.utils.random(0.15, 0.55) * Math.min(1, k + 0.2),
                backgroundPosition: `${gsap.utils.random(0, 160)}px ${gsap.utils.random(0, 160)}px`,
              },
              t,
            );
          }
        }
        tl.to({}, { duration: dt });
        schedule();
      };

      const schedule = () => {
        next?.kill();
        const f = Math.max(0.05, frequency) * (hovering && hoverBoost ? 6 : 1);
        next = gsap.delayedCall(gsap.utils.random(0.35, 1.65) / f, burst);
      };

      const onEnter = () => {
        hovering = true;
        if (hoverBoost) burst();
      };
      const onLeave = () => {
        hovering = false;
        schedule();
      };
      root.addEventListener('pointerenter', onEnter);
      root.addEventListener('pointerleave', onLeave);
      schedule();

      return () => {
        root.removeEventListener('pointerenter', onEnter);
        root.removeEventListener('pointerleave', onLeave);
        tl?.kill();
        next?.kill();
      };
    },
    { scope: rootRef, dependencies: [frequency, intensity, hoverBoost, text], revertOnUpdate: true },
  );

  const vars = { '--glx-a': colorA, '--glx-b': colorB } as CSSProperties;

  return (
    <span className={`relative inline-block ${className}`}>
      <style>{CSS}</style>
      <span className="sr-only">{text}</span>
      <span ref={rootRef} aria-hidden data-text={text} style={vars} className="glx-text whitespace-nowrap">
        <span data-glx-main className="relative inline-block">
          {text}
        </span>
        {/* 横に走る切れ目（本体と同じ色の帯を左右にずらす） */}
        {[0, 1].map((i) => (
          <span key={i} data-glx-slice className="pointer-events-none invisible absolute inset-0 opacity-0">
            {text}
          </span>
        ))}
        {/* ノイズ */}
        <span
          data-glx-noise
          className="pointer-events-none invisible absolute -inset-x-[4%] -inset-y-[10%] opacity-0 mix-blend-overlay"
          style={{ backgroundImage: NOISE }}
        />
      </span>
    </span>
  );
}

export default function App() {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-black text-white">
      {/* 背景：グリッド・走査線・周辺減光 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 3px)' }}
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,black_85%)]" />
      <div aria-hidden className="pointer-events-none absolute -left-40 top-1/3 h-96 w-96 rounded-full bg-fuchsia-600/25 blur-[120px]" />
      <div aria-hidden className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-cyan-500/20 blur-[120px]" />

      <header className="relative z-10 flex items-center justify-between px-5 py-5 font-mono text-[11px] tracking-[0.3em] text-white/60 sm:px-10">
        <span>NEON//FRAME</span>
        <span className="flex items-center gap-2">
          <Radio className="h-3.5 w-3.5 text-rose-400" aria-hidden />
          LIVE 2026.11.21
        </span>
      </header>

      <section className="relative z-10 flex flex-1 flex-col justify-center px-5 pb-16 sm:px-10">
        <p className="font-mono text-xs tracking-[0.4em] text-cyan-300/80">
          <GlitchText text="// 電脳音楽祭 2026" intensity={0.35} frequency={0.4} />
        </p>
        <h1 className="mt-6 text-[clamp(3.5rem,16vw,13rem)] font-black leading-[0.85] tracking-tighter">
          <GlitchText text="SIGNAL" />
          <br />
          <GlitchText text="LOST" frequency={0.9} intensity={0.7} />
        </h1>
        <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-md text-sm leading-relaxed text-white/60">
            ノイズの向こうから届く、一夜限りのオーディオビジュアル・ライブ。文字にカーソルを乗せるとグリッチが激しくなります。
          </p>
          <a
            href="#ticket"
            onClick={(e) => e.preventDefault()}
            className="group inline-flex w-fit items-center gap-3 border border-white/30 px-6 py-3 font-mono text-sm tracking-widest transition-colors hover:border-white hover:bg-white hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
          >
            <GlitchText text="GET TICKET" intensity={0.6} frequency={0.2} />
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
          </a>
        </div>
      </section>
    </main>
  );
}
