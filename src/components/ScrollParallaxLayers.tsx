import { useRef } from 'react';
import type { ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* =========================================================
 * パララックス（Scroll Parallax Layer）
 * - 奥の層ほどゆっくり、手前の層ほど速く動かして、スクロールに奥行きを出す
 * - <ParallaxLayer speed={0.2}> のように層ごとの速度を指定するだけ（data-speed 属性）
 * - GSAP ScrollTrigger：全層を1つのタイムラインにまとめ、scrub（秒）で軽く慣性をつける
 * - transform（yPercent）のみで動かすのでレイアウト再計算なし
 * - prefers-reduced-motion 時は静止
 * ========================================================= */

function ParallaxLayer({ speed, children, className = '' }: { speed: number; children?: ReactNode; className?: string }) {
  // speed 1 = セクション高さ分移動（-: 上へ / +: 下へ）
  return (
    <div data-speed={speed} className={`absolute inset-0 will-change-transform ${className}`}>
      {children}
    </div>
  );
}

export function ScrollParallaxLayers({ sunSpeed = 0.6, titleSpeed = 0.45, farSpeed = 0.35, midSpeed = 0.2, nearSpeed = 0.05, scrub = 0.6, sectionHeight = 140 }: { sunSpeed?: number; titleSpeed?: number; farSpeed?: number; midSpeed?: number; nearSpeed?: number; scrub?: number; sectionHeight?: number }) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: ref.current, start: 'top top', end: 'bottom top', scrub: scrub || true } });
        gsap.utils.toArray<HTMLElement>('[data-speed]').forEach((el) => {
          tl.to(el, { yPercent: Number(el.dataset.speed) * 100, ease: 'none' }, 0);
        });
        // 見出しは前半でフェードアウト
        tl.to('[data-title]', { autoAlpha: 0, ease: 'none', duration: 0.5 }, 0);
      });
    },
    { scope: ref, dependencies: [sunSpeed, titleSpeed, farSpeed, midSpeed, nearSpeed, scrub, sectionHeight], revertOnUpdate: true },
  );

  return (
    <main className="bg-slate-950">
      <section ref={ref} style={{ height: `${sectionHeight}vh` }}
        className="relative overflow-hidden bg-gradient-to-b from-indigo-950 via-violet-900 to-orange-300 dark:to-rose-400">
        {/* 空の星・太陽（最奥：ほぼ動かない） */}
        <ParallaxLayer speed={sunSpeed}>
          <div className="absolute left-1/2 top-[38%] h-40 w-40 -translate-x-1/2 rounded-full bg-gradient-to-b from-amber-200 to-orange-400 shadow-[0_0_120px_40px_rgba(251,191,36,0.35)]" />
        </ParallaxLayer>

        {/* 見出し（中間） */}
        <ParallaxLayer speed={titleSpeed} className="flex items-start justify-center pt-[18vh]">
          <div data-title className="px-6 text-center">
            <p className="text-xs font-semibold tracking-[0.4em] text-white/70">SCROLL PARALLAX</p>
            <h1 className="mt-4 text-5xl font-black tracking-tight text-white sm:text-8xl">DEPTH</h1>
          </div>
        </ParallaxLayer>

        {/* 山：奥 → 手前（速度を段階的に上げる） */}
        {[
          { speed: farSpeed, d: 'M0 300 L160 170 L300 240 L480 120 L660 230 L820 150 L1000 250 L1180 160 L1440 240 V400 H0Z', cls: 'fill-violet-800/80' },
          { speed: midSpeed, d: 'M0 330 L200 240 L380 300 L600 210 L800 300 L1020 230 L1220 310 L1440 260 V400 H0Z', cls: 'fill-indigo-900' },
          { speed: nearSpeed, d: 'M0 360 L240 300 L500 350 L740 290 L980 350 L1220 310 L1440 340 V400 H0Z', cls: 'fill-slate-950' },
        ].map((m, i) => (
          <ParallaxLayer key={i} speed={m.speed}>
            <svg aria-hidden viewBox="0 0 1440 400" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-[60%] w-full">
              <path d={m.d} className={m.cls} />
            </svg>
          </ParallaxLayer>
        ))}
      </section>

      <section className="relative z-10 -mt-px bg-slate-950 px-6 py-32 text-center text-slate-300">
        <p className="mx-auto max-w-lg text-sm leading-relaxed">
          太陽・見出し・3枚の山がそれぞれ異なる速度で動いています。speed の値を変えるだけで奥行きの強さを調整できます。
        </p>
      </section>
      <div className="h-[60vh] bg-slate-950" />
    </main>
  );
}


export default function App() {
  return <ScrollParallaxLayers />;
}
