import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { MousePointer2 } from 'lucide-react';

gsap.registerPlugin(useGSAP);

/* =========================================================
 * 文字ごとのホバー反応（Variable Font Hover）
 * - カーソルに近い文字ほど太く・大きく・濃くなる。見出しを「触れる」タイポグラフィに
 * - 仕組み：テキストを 1 文字ずつ <span> に分け、カーソルとの距離から 0〜1 の影響度を計算
 *   （radius の外は 0、中心ほど 1。smoothstep でなめらかに減衰）
 *   影響度を GSAP quickTo で各文字ごとに補間し、font-weight / font-variation-settings('wght')・scale・不透明度に反映
 * - フォント：外部フォントを読み込めない環境なので system-ui の可変ウェイト（100〜900）で動かしている
 *   OS によっては段階的（100 刻み）にしか変わらない。なめらかにしたい場合は可変フォントを読み込む：
 *     1) index.html の <head> に
 *        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet">
 *        （Roboto Flex なら family=Roboto+Flex:opsz,wdth,wght@8..144,25..151,100..1000 で幅や字面サイズの軸も使える）
 *     2) fontFamily に "'Inter', system-ui, sans-serif" を指定（props の fontFamily）
 *     3) 幅も変えたい場合は apply 内で `'wght' ${w}, 'wdth' ${75 + 50 * t}` のように軸を追加
 * - タッチ端末：タップ（＋横方向のなぞり）した位置に反応し、指を離すと少し後に元へ戻る
 * - 表示時に 1 度だけ、仮想カーソルが左から右へ通り過ぎるイントロ（intro=false で無効）
 * - 読み上げ：見た目の 1 文字 span は aria-hidden、テキスト全体は aria-label ではなく sr-only で 1 回だけ
 * - prefers-reduced-motion: reduce のときは拡大・イントロ・補間を行わず、太さだけ即座に切り替える
 * ========================================================= */

type Props = {
  /** 表示するテキスト（改行で複数行） */
  text?: string;
  /** 影響範囲（カーソルからの半径, px） */
  radius?: number;
  /** 最小ウェイト（遠い文字） */
  minWeight?: number;
  /** 最大ウェイト（カーソル直下の文字） */
  maxWeight?: number;
  /** カーソル直下の文字の拡大率（1 = 拡大なし） */
  maxScale?: number;
  /** 追従のなめらかさ（秒） */
  smooth?: number;
  /** 表示時に仮想カーソルが通り過ぎるイントロ */
  intro?: boolean;
  /** フォント（可変フォントを読み込んだ場合はここで指定） */
  fontFamily?: string;
  /** 追加クラス（文字サイズなど） */
  className?: string;
};

export function VariableFontHover({
  text = 'DESIGN\nIN MOTION',
  radius = 220,
  minWeight = 150,
  maxWeight = 900,
  maxScale = 1.18,
  smooth = 0.45,
  intro = true,
  fontFamily = 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
  className = 'text-[clamp(3rem,13vw,10rem)] leading-[0.95] tracking-tight',
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const chars = gsap.utils.toArray<HTMLElement>('[data-vf-char]', root);
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const lo = Math.min(minWeight, maxWeight);
      const hi = Math.max(minWeight, maxWeight);

      // 影響度 t（0〜1）→ 見た目へ反映
      const states = chars.map((el) => {
        const s = { t: 0 };
        const apply = () => {
          const w = Math.round(lo + (hi - lo) * s.t);
          el.style.fontWeight = String(w);
          el.style.fontVariationSettings = `'wght' ${w}`;
          el.style.opacity = String(0.45 + 0.55 * s.t);
          el.style.transform = reduce ? '' : `scale(${1 + (maxScale - 1) * s.t})`;
        };
        apply();
        const to = reduce
          ? (v: number) => {
              s.t = v;
              apply();
            }
          : gsap.quickTo(s, 't', { duration: smooth, ease: 'power3.out', onUpdate: apply });
        return { el, to, cx: 0, cy: 0 };
      });

      // 文字の中心座標をキャッシュ（太さが変わると少しずれるが、反応の見た目には十分）
      const measure = () => {
        states.forEach((st) => {
          const r = st.el.getBoundingClientRect();
          st.cx = r.left + r.width / 2;
          st.cy = r.top + r.height / 2;
        });
      };
      const update = (x: number, y: number) => {
        states.forEach((st) => {
          const d = Math.hypot(st.cx - x, st.cy - y);
          const t = Math.max(0, 1 - d / radius);
          st.to(t * t * (3 - 2 * t));
        });
      };
      const release = () => states.forEach((st) => st.to(0));

      let releaseCall: gsap.core.Tween | null = null;
      let introTween: gsap.core.Tween | null = null;

      const onEnter = () => {
        introTween?.kill();
        measure();
      };
      const onMove = (e: PointerEvent) => {
        releaseCall?.kill();
        update(e.clientX, e.clientY);
      };
      const onDown = (e: PointerEvent) => {
        introTween?.kill();
        measure();
        update(e.clientX, e.clientY);
      };
      const onUp = (e: PointerEvent) => {
        if (e.pointerType === 'mouse') return;
        releaseCall?.kill();
        releaseCall = gsap.delayedCall(0.6, release);
      };
      const onLeave = (e: PointerEvent) => {
        if (e.pointerType === 'mouse') release();
      };

      root.addEventListener('pointerenter', onEnter);
      root.addEventListener('pointermove', onMove);
      root.addEventListener('pointerdown', onDown);
      root.addEventListener('pointerup', onUp);
      root.addEventListener('pointercancel', onUp);
      root.addEventListener('pointerleave', onLeave);
      window.addEventListener('scroll', measure, { passive: true });
      window.addEventListener('resize', measure);

      // イントロ：仮想カーソルが左から右へ通り過ぎる
      if (intro && !reduce) {
        measure();
        const box = root.getBoundingClientRect();
        const p = { x: box.left - radius };
        introTween = gsap.to(p, {
          x: box.right + radius,
          duration: 1.8,
          delay: 0.3,
          ease: 'power2.inOut',
          onUpdate: () => {
            const b = root.getBoundingClientRect();
            update(p.x, b.top + b.height / 2);
          },
          onComplete: release,
        });
      }

      return () => {
        root.removeEventListener('pointerenter', onEnter);
        root.removeEventListener('pointermove', onMove);
        root.removeEventListener('pointerdown', onDown);
        root.removeEventListener('pointerup', onUp);
        root.removeEventListener('pointercancel', onUp);
        root.removeEventListener('pointerleave', onLeave);
        window.removeEventListener('scroll', measure);
        window.removeEventListener('resize', measure);
        releaseCall?.kill();
        introTween?.kill();
      };
    },
    { scope: rootRef, dependencies: [text, radius, minWeight, maxWeight, maxScale, smooth, intro], revertOnUpdate: true },
  );

  const lines = text.split('\n');

  return (
    <div ref={rootRef} className={`select-none touch-pan-y ${className}`} style={{ fontFamily }}>
      <span className="sr-only">{text.replace(/\n/g, ' ')}</span>
      {lines.map((line, li) => (
        <span key={li} aria-hidden className="block whitespace-nowrap">
          {Array.from(line).map((ch, ci) => (
            <span
              key={ci}
              data-vf-char
              className="inline-block origin-[50%_70%] will-change-transform"
              style={{ fontWeight: Math.min(minWeight, maxWeight) }}
            >
              {ch === ' ' ? ' ' : ch}
            </span>
          ))}
        </span>
      ))}
    </div>
  );
}

export default function App() {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[#f4f1ea] text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <header className="flex items-center justify-between px-5 py-5 font-mono text-[11px] tracking-[0.3em] text-stone-500 sm:px-10">
        <span>STUDIO KATACHI</span>
        <span className="hidden sm:inline">TYPE / MOTION / SYSTEM</span>
      </header>
      <section className="flex flex-1 flex-col justify-center px-5 pb-16 sm:px-10">
        <p className="mb-6 flex items-center gap-2 text-xs font-medium text-stone-500">
          <MousePointer2 className="h-3.5 w-3.5" aria-hidden />
          文字の上でカーソルを動かしてください（スマホはタップ）
        </p>
        <h1>
          <VariableFontHover />
        </h1>
        <div className="mt-12 grid gap-8 border-t border-stone-300 pt-8 sm:grid-cols-3 dark:border-stone-800">
          {[
            ['01', '書体を設計する', '文字の太さ・幅・間隔を、ブランドの声に合わせて調整します。'],
            ['02', '動きを与える', '可変フォントの軸をアニメーションさせ、読むたびに表情が変わる見出しに。'],
            ['03', '仕組みにする', 'Web・SNS・映像で同じルールを使えるよう、トークンとして整理します。'],
          ].map(([no, title, body]) => (
            <div key={no}>
              <p className="font-mono text-xs text-stone-400">{no}</p>
              <h2 className="mt-2 text-lg font-bold">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-400">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
