import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* =========================================================
 * 速度連動無限マーキー（Scroll Velocity Linked Marquee）
 * - 常に流れ続ける無限ループのテキスト帯
 * - スクロールの速さに比例して加速し、スクロール方向で流れる向きも反転
 * - GSAP：ScrollTrigger.getVelocity() で速度を取得 → gsap.to でなめらかに倍率へ → gsap.ticker で毎フレーム移動
 * - prefers-reduced-motion 時は静止表示
 * ========================================================= */

type MarqueeRowProps = {
  text: string;
  /** 基本速度（%/秒）。マイナスで逆方向 */
  baseVelocity: number;
  /** スクロール速度の影響度 */
  velocityFactor?: number;
  className?: string;
};

export function MarqueeRow({ text, baseVelocity, velocityFactor = 5, className = '' }: MarqueeRowProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const track = rootRef.current?.firstElementChild;
      if (!track) return;
      // 4回複製して -25%〜0% をループ → 継ぎ目が見えない
      const wrap = gsap.utils.wrap(-25, 0);
      const setX = gsap.quickSetter(track, 'xPercent');
      const state = { pos: 0, factor: 0, dir: 1 };

      // スクロール速度（px/秒）→ 倍率。止まると 0 に戻る
      ScrollTrigger.create({
        onUpdate: (self) => {
          const target = (self.getVelocity() / 1000) * velocityFactor;
          gsap.to(state, { factor: target, duration: 0.2, overwrite: true, onComplete: () => void gsap.to(state, { factor: 0, duration: 0.8 }) });
        },
      });

      const tick = (_t: number, deltaMs: number) => {
        if (state.factor < 0) state.dir = -1;
        else if (state.factor > 0) state.dir = 1;
        state.pos += state.dir * baseVelocity * (deltaMs / 1000) * (1 + Math.abs(state.factor));
        setX(wrap(state.pos));
      };
      gsap.ticker.add(tick);
      return () => gsap.ticker.remove(tick);
    },
    { scope: rootRef, dependencies: [baseVelocity, velocityFactor], revertOnUpdate: true },
  );

  return (
    <div ref={rootRef} className="flex overflow-hidden whitespace-nowrap" aria-hidden>
      <div className={`flex shrink-0 will-change-transform ${className}`}>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="flex shrink-0 items-center">
            {text}
            <span className="mx-6 inline-block h-3 w-3 rounded-full bg-current opacity-40 sm:mx-10 sm:h-4 sm:w-4" />
          </span>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <main className="bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
      <section className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
        <p className="text-xs font-semibold tracking-[0.3em] text-indigo-600 dark:text-indigo-400">SCROLL VELOCITY MARQUEE</p>
        <h1 className="mt-3 text-3xl font-bold sm:text-5xl">スクロールすると、加速する。</h1>
        <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">下へ・上へと速くスクロールしてみてください ↓</p>
      </section>

      {/* 読み上げ用の実テキスト（マーキーは装飾として aria-hidden） */}
      <h2 className="sr-only">Creative Development / Interaction Design / Motion Engineering</h2>
      <section className="space-y-2 border-y border-neutral-200 py-10 dark:border-neutral-800">
        <MarqueeRow
          text="CREATIVE DEVELOPMENT"
          baseVelocity={-4}
          className="text-5xl font-black tracking-tight sm:text-8xl"
        />
        <MarqueeRow
          text="INTERACTION × MOTION × DESIGN"
          baseVelocity={3}
          className="text-5xl font-black tracking-tight text-transparent [-webkit-text-stroke:1.5px_currentColor] sm:text-8xl"
        />
      </section>

      <section className="flex min-h-[120vh] items-center justify-center px-6">
        <p className="max-w-md text-center text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          速度は ScrollTrigger.getVelocity() で取得し、gsap.to でなめらかにしてから倍率に変換しています。止まると基本速度に戻ります。
        </p>
      </section>
    </main>
  );
}
