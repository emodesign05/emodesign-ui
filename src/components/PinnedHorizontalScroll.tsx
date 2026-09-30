import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* =========================================================
 * 横スクロールセクション（Pinned Horizontal Scroll）
 * - 縦にスクロールすると、セクションが画面に固定されたまま中身が横へ流れる
 * - GSAP ScrollTrigger：pin で固定 → 横方向の移動量（トラックの幅 − 画面幅）をそのまま縦のスクロール量に割り当て
 * - containerAnimation で、横移動中の各カードにも個別の演出（画像のパララックス・フェード）を付けられる
 * - 画面幅が変わっても invalidateOnRefresh で移動量を再計算
 * - prefers-reduced-motion 時は通常の横スクロール（overflow-x: auto）にフォールバック
 * ========================================================= */

const WORKS = [
  { no: '01', title: 'Aurora Brand', tag: 'Branding', color: 'from-indigo-500 to-sky-400' },
  { no: '02', title: 'Kumo App', tag: 'Product', color: 'from-rose-500 to-orange-400' },
  { no: '03', title: 'Mori Studio', tag: 'Web', color: 'from-emerald-500 to-lime-400' },
  { no: '04', title: 'Nami Journal', tag: 'Editorial', color: 'from-fuchsia-500 to-violet-500' },
  { no: '05', title: 'Hoshi Store', tag: 'EC', color: 'from-amber-400 to-yellow-300' },
  { no: '06', title: 'Sora Motion', tag: 'Motion', color: 'from-cyan-500 to-teal-400' },
];

type Props = {
  /** カード1枚の幅（px） */
  cardWidth?: number;
  /** カード同士の間隔（px） */
  gap?: number;
  /** 追従の遅れ（秒） */
  scrub?: number;
  /** 横移動中にカード内の色面を逆方向に動かす（奥行き） */
  innerParallax?: boolean;
};

export function PinnedHorizontalScroll({ cardWidth = 420, gap = 32, scrub = 0.6, innerParallax = true }: Props) {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const track = rootRef.current?.querySelector<HTMLElement>('[data-track]');
        if (!track) return;
        // 横に動かす距離 = トラック全体の幅 − 画面幅
        const distance = () => track.scrollWidth - window.innerWidth;
        const move = gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: '[data-pin]',
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: scrub || true,
            invalidateOnRefresh: true,
          },
        });
        // 各カード：画面の右端から入ってくる間にフェードイン、色面は逆方向へ（containerAnimation）
        gsap.utils.toArray<HTMLElement>('[data-card]').forEach((card) => {
          gsap.from(card, { autoAlpha: 0.2, scale: 0.92, ease: 'none', scrollTrigger: { trigger: card, containerAnimation: move, start: 'left right', end: 'left 60%', scrub: true } });
          if (innerParallax) {
            gsap.fromTo(card.querySelector('[data-inner]'), { xPercent: 8 }, { xPercent: -8, ease: 'none', scrollTrigger: { trigger: card, containerAnimation: move, start: 'left right', end: 'right left', scrub: true } });
          }
        });
      });
    },
    { scope: rootRef, dependencies: [cardWidth, gap, scrub, innerParallax], revertOnUpdate: true },
  );

  return (
    <main ref={rootRef} className="bg-neutral-950 text-white">
      <section className="flex h-[70vh] flex-col justify-end px-8 pb-16 sm:px-16">
        <p className="text-xs font-semibold tracking-[0.3em] text-indigo-400">HORIZONTAL SCROLL</p>
        <h1 className="mt-4 text-5xl font-black tracking-tight sm:text-7xl">縦に回すと、横に流れる。</h1>
      </section>

      <section data-pin className="flex h-screen items-center overflow-hidden motion-reduce:overflow-x-auto">
        <div data-track className="flex items-center pl-8 pr-[10vw] will-change-transform sm:pl-16" style={{ gap }}>
          <div className="shrink-0 pr-8" style={{ width: Math.min(cardWidth, 360) }}>
            <p className="text-xs font-semibold tracking-[0.3em] text-neutral-400">SELECTED WORKS</p>
            <p className="mt-4 text-3xl font-bold leading-tight">実績を、<br />ひと続きの帯で。</p>
            <p className="mt-6 flex items-center gap-2 text-sm text-neutral-400">
              スクロール <ArrowRight className="h-4 w-4" aria-hidden />
            </p>
          </div>
          {WORKS.map((w) => (
            <article key={w.no} data-card className="relative shrink-0 overflow-hidden rounded-3xl bg-neutral-900" style={{ width: cardWidth, height: 'min(62vh, 560px)' }}>
              <div data-inner className={`absolute inset-y-0 bg-gradient-to-br ${w.color} opacity-90`} style={{ left: '-15%', right: '-15%' }} aria-hidden />
              <div className="relative flex h-full flex-col justify-between p-8">
                <span className="text-sm font-semibold tabular-nums text-white/80">{w.no}</span>
                <div>
                  <p className="text-xs font-semibold tracking-[0.2em] text-white/80">{w.tag}</p>
                  <h2 className="mt-2 text-3xl font-bold">{w.title}</h2>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="flex h-[70vh] items-center justify-center px-6 text-sm text-neutral-400">横スクロールが終わると、縦に戻ります。</section>
    </main>
  );
}

export default function App() {
  return <PinnedHorizontalScroll />;
}
