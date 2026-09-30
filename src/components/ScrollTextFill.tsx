import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

/* =========================================================
 * スクロール文字塗り（Scroll Text Fill / Reading Highlight）
 * - 長めの文章が、読み進める（スクロールする）につれて薄い色から濃い色へ1語ずつ塗られていく
 * - GSAP SplitText で単語（日本語は1文字）ごとに分割 → ScrollTrigger の scrub で順番に不透明度を上げる
 * - 文章の読み上げは SplitText が aria-label を付けて1つの文として扱う
 * - prefers-reduced-motion 時は最初から濃い色で表示
 * ========================================================= */

const TEXT =
  'わたしたちは、使う人の毎日に静かに寄り添うデザインをつくります。目立つためではなく、迷わないために。飾るためではなく、伝えるために。ひとつひとつの余白と動きに、意味を込めて。';

type Props = {
  text?: string;
  /** 塗られる前の薄さ（0〜1） */
  dimOpacity?: number;
  /** 分割単位 */
  splitBy?: 'char' | 'word';
  /** 塗りの色（空なら文字色のまま濃くなる） */
  highlight?: string;
};

export function ScrollTextFill({ text = TEXT, dimOpacity = 0.15, splitBy = 'char', highlight = '' }: Props) {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const type = splitBy === 'word' ? 'words' : 'chars';
      SplitText.create('[data-text]', {
        type,
        autoSplit: true,
        onSplit(self) {
          const targets = type === 'words' ? self.words : self.chars;
          return gsap.fromTo(
            targets,
            { opacity: dimOpacity },
            {
              opacity: 1,
              ...(highlight ? { color: highlight } : {}),
              ease: 'none',
              stagger: 0.1,
              scrollTrigger: { trigger: '[data-text]', start: 'top 75%', end: 'bottom 45%', scrub: true },
            },
          );
        },
      });
    },
    { scope: rootRef, dependencies: [text, dimOpacity, splitBy, highlight], revertOnUpdate: true },
  );

  return (
    <main ref={rootRef} className="bg-stone-50 text-stone-900 dark:bg-neutral-950 dark:text-white">
      <section className="flex h-[70vh] items-end px-8 pb-12 sm:px-16">
        <p className="text-xs font-semibold tracking-[0.3em] text-indigo-600 dark:text-indigo-400">SCROLL TEXT FILL ↓</p>
      </section>
      <section className="mx-auto max-w-4xl px-8 py-[20vh] sm:px-16">
        <p data-text className="text-3xl font-bold leading-[1.6] tracking-tight sm:text-5xl sm:leading-[1.5]">
          {text}
        </p>
      </section>
      <section className="h-[60vh]" />
    </main>
  );
}

export default function App() {
  return <ScrollTextFill />;
}
