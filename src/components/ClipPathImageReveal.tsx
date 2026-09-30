import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* =========================================================
 * イメージクリップリビール（Clip-path Image Reveal）
 * - 画像が画面に入ると、clip-path で切り抜かれた状態から開くように現れる
 * - 開くと同時に中の画像がわずかに縮小（1.3 → 1）し、奥から寄ってくるような質感に
 * - from で 下から / 左から / 中央から / 円形 を切り替え
 * - <ScrubReveal> はスクロール量に連動して開閉する版
 * - GSAP ScrollTrigger で「画面の 65% 位置に来たら1回再生」／ScrubReveal は scrub でスクロール量に同期
 * - prefers-reduced-motion 時はフェードのみ
 * ========================================================= */

type From = 'bottom' | 'left' | 'center' | 'circle';

const CLIP_START: Record<From, string> = {
  bottom: 'inset(100% 0% 0% 0%)',
  left: 'inset(0% 100% 0% 0%)',
  center: 'inset(50% 50% 50% 50%)',
  circle: 'circle(0% at 50% 50%)',
};
const CLIP_END: Record<From, string> = {
  bottom: 'inset(0% 0% 0% 0%)',
  left: 'inset(0% 0% 0% 0%)',
  center: 'inset(0% 0% 0% 0%)',
  circle: 'circle(75% at 50% 50%)',
};

export function ClipReveal({ src, alt, from = 'bottom', duration = 1.2, delay = 0, className = '' }: { src: string; alt: string; from?: From; duration?: number; delay?: number; className?: string }) {
  // clip-path で隠れた要素ではなく、クリップされない外側のラッパーをトリガーにする
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const st = { trigger: ref.current, start: 'top 65%', once: true };
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap
          .timeline({ scrollTrigger: st, delay })
          .fromTo('figure', { clipPath: CLIP_START[from] }, { clipPath: CLIP_END[from], duration, ease: 'power4.inOut' }, 0)
          .fromTo('img', { scale: 1.3 }, { scale: 1, duration: duration + 0.4, ease: 'expo.out' }, 0);
      });
      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.fromTo('figure', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, delay, scrollTrigger: st });
      });
    },
    { scope: ref, dependencies: [from, duration, delay], revertOnUpdate: true },
  );
  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <figure className="h-full w-full overflow-hidden" style={{ clipPath: CLIP_START[from] }}>
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      </figure>
    </div>
  );
}

/** スクロール量に合わせて開く版 */
function ScrubReveal({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap
          .timeline({ scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'center center', scrub: true } })
          .fromTo('figure', { clipPath: 'inset(22% 22% 22% 22% round 48px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none' }, 0)
          .fromTo('img', { scale: 1.25 }, { scale: 1, ease: 'none' }, 0);
      });
    },
    { scope: ref },
  );
  return (
    <div ref={ref} className="h-[80vh] w-full">
      <figure className="h-full w-full overflow-hidden">
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      </figure>
    </div>
  );
}

const IMG = {
  a: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1600&q=80',
  b: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80',
  c: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1200&q=80',
  d: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80',
  e: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=2000&q=80',
};

export default function App() {
  return (
    <main className="bg-stone-50 text-stone-900 dark:bg-neutral-950 dark:text-white">
      <section className="flex min-h-[70vh] flex-col justify-center px-6 sm:px-16">
        <p className="text-xs font-semibold tracking-[0.3em] text-indigo-600 dark:text-indigo-400">CLIP-PATH REVEAL</p>
        <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-6xl">幕が上がるように、写真が現れる。</h1>
        <p className="mt-4 text-sm text-stone-600 dark:text-neutral-400">スクロールしてください ↓</p>
      </section>

      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 pb-24 md:grid-cols-12">
        <ClipReveal src={IMG.a} alt="霧の森" from="bottom" className="aspect-[4/5] rounded-2xl md:col-span-7" />
        <div className="flex flex-col justify-end gap-8 md:col-span-5">
          <ClipReveal src={IMG.b} alt="木漏れ日" from="left" delay={0.15} className="aspect-square rounded-2xl" />
          <p className="text-sm leading-relaxed text-stone-600 dark:text-neutral-400">from="bottom" / "left" / "center" / "circle" で開き方を切り替えられます。</p>
        </div>
        <ClipReveal src={IMG.c} alt="丘陵" from="center" className="aspect-[16/10] rounded-2xl md:col-span-6" />
        <ClipReveal src={IMG.d} alt="湖と山" from="circle" delay={0.1} className="aspect-[16/10] rounded-2xl md:col-span-6" />
      </section>

      <section className="px-4 pb-32 sm:px-8">
        <p className="mb-6 text-center text-xs font-semibold tracking-[0.3em] text-stone-500">SCROLL-LINKED</p>
        <ScrubReveal src={IMG.e} alt="山並みの夕景" />
      </section>
    </main>
  );
}
