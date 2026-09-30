import { useId, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ArrowDown } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* =========================================================
 * 回転テキストバッジ（Circular Rotating Text Badge）
 * - 円に沿って並んだ文字がくるくる回るバッジ（「Scroll down」「Contact」などの装飾ボタンに）
 * - 文字は SVG の <textPath> で円周に配置（文字数に合わせて textLength で一周ぴったりに）
 * - GSAP：無限回転（repeat: -1）＋ ホバーで加速（timeScale を tween）＋ スクロール速度にも反応
 * - 読み上げは aria-label の1文。prefers-reduced-motion 時は回転しない
 * ========================================================= */

type Props = {
  text?: string;
  /** 直径（px） */
  size?: number;
  /** 1周にかかる秒数 */
  duration?: number;
  /** ホバー時の速度倍率 */
  hoverBoost?: number;
  /** スクロールの速さで回転を加速する */
  scrollBoost?: boolean;
  href?: string;
};

export function RotatingBadge({ text = 'SCROLL DOWN • SCROLL DOWN • ', size = 140, duration = 12, hoverBoost = 4, scrollBoost = true, href = '#next' }: Props) {
  const rootRef = useRef<HTMLAnchorElement>(null);
  const pathId = useId().replace(/:/g, '');

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const spin = gsap.to('[data-ring]', { rotate: 360, duration, ease: 'none', repeat: -1, transformOrigin: '50% 50%' });
      const root = rootRef.current;
      let hovering = false;
      const onEnter = () => {
        hovering = true;
        gsap.to(spin, { timeScale: hoverBoost, duration: 0.6, ease: 'power2.out', overwrite: true });
      };
      const onLeave = () => {
        hovering = false;
        gsap.to(spin, { timeScale: 1, duration: 1, ease: 'power2.out', overwrite: true });
      };
      root?.addEventListener('pointerenter', onEnter);
      root?.addEventListener('pointerleave', onLeave);
      if (scrollBoost) {
        ScrollTrigger.create({
          onUpdate: (self) => {
            if (hovering) return;
            // 速くスクロールするほど速く、上方向なら逆回転
            const boost = gsap.utils.clamp(-6, 6, self.getVelocity() / 300);
            gsap.to(spin, { timeScale: boost === 0 ? 1 : boost, duration: 0.2, overwrite: true, onComplete: () => void gsap.to(spin, { timeScale: 1, duration: 1 }) });
          },
        });
      }
      return () => {
        root?.removeEventListener('pointerenter', onEnter);
        root?.removeEventListener('pointerleave', onLeave);
      };
    },
    { scope: rootRef, dependencies: [duration, hoverBoost, scrollBoost], revertOnUpdate: true },
  );

  return (
    <a
      ref={rootRef}
      href={href}
      aria-label={text.split('•')[0].trim()}
      className="group relative inline-flex items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      style={{ width: size, height: size }}
    >
      <svg data-ring viewBox="0 0 200 200" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <path id={pathId} d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
        </defs>
        <text className="fill-current text-[17px] font-semibold uppercase tracking-[0.2em]">
          <textPath href={`#${pathId}`} textLength={2 * Math.PI * 78 - 4} lengthAdjust="spacing">
            {text}
          </textPath>
        </text>
      </svg>
      <span className="flex h-1/2 w-1/2 items-center justify-center rounded-full bg-current transition-transform duration-300 group-hover:scale-110">
        <ArrowDown className="h-1/2 w-1/2 text-white mix-blend-difference" aria-hidden />
      </span>
    </a>
  );
}

export default function App() {
  return (
    <main className="bg-stone-100 text-stone-900 dark:bg-neutral-950 dark:text-white">
      <section className="relative flex min-h-screen flex-col justify-center px-8 sm:px-16">
        <p className="text-xs font-semibold tracking-[0.3em] text-indigo-600 dark:text-indigo-400">ROTATING TEXT BADGE</p>
        <h1 className="mt-4 max-w-3xl text-5xl font-black leading-tight tracking-tight sm:text-7xl">小さな回転が、視線を誘う。</h1>
        <div className="absolute bottom-10 right-8 sm:right-16">
          <RotatingBadge />
        </div>
      </section>
      <section id="next" className="flex min-h-[80vh] items-center justify-center text-sm text-stone-500">
        バッジにカーソルを乗せると加速し、スクロールの速さにも反応します。
      </section>
    </main>
  );
}
