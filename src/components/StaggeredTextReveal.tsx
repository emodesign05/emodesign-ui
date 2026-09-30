import { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';
import { RotateCcw } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

/* =========================================================
 * 文字スタガーアニメーション（Staggered Text Reveal）
 * - 1文字（または1単語）ずつ、マスクの下からせり上がって表示
 * - GSAP SplitText で分割（mask オプションで1文字ずつ overflow:hidden の枠を自動生成）
 *   日本語・絵文字も崩れず、読み上げ用の aria-label も SplitText が自動で付与
 * - ScrollTrigger で画面内に入った時に1回だけ再生
 * - autoSplit：フォント読み込みや画面幅の変化で改行位置が変わっても自動で分割し直す
 * - prefers-reduced-motion 時はフェードのみ
 * ========================================================= */

type SplitBy = 'char' | 'word';

type StaggeredTextProps = {
  text: string;
  as?: 'p' | 'h1' | 'h2' | 'h3' | 'span' | 'div';
  splitBy?: SplitBy;
  /** 1文字ごとの遅延（秒） */
  stagger?: number;
  /** 開始までの遅延（秒） */
  delay?: number;
  className?: string;
};

export function StaggeredText({ text, as = 'p', splitBy = 'char', stagger = 0.035, delay = 0, className = '' }: StaggeredTextProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  // タグ名だけ差し替える（型は p として扱う）
  const Tag = as as 'p';

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const type = splitBy === 'word' ? 'words' : 'chars';
      SplitText.create(el, {
        type,
        mask: type, // 1つずつマスク（下からせり上がる）
        autoSplit: true,
        onSplit(self) {
          gsap.set(el, { visibility: 'visible' });
          const targets = type === 'words' ? self.words : self.chars;
          return gsap.from(targets, {
            ...(reduce ? { opacity: 0, duration: 0.4 } : { yPercent: 110, rotate: 6, opacity: 0, filter: 'blur(6px)', duration: 0.8, ease: 'expo.out' }),
            transformOrigin: 'left bottom',
            stagger: reduce ? 0 : stagger,
            delay,
            scrollTrigger: { trigger: el, start: 'top 80%', once: true },
          });
        },
      });
    },
    { dependencies: [text, splitBy, stagger, delay], revertOnUpdate: true },
  );

  return (
    <Tag ref={ref} className={className} style={{ visibility: 'hidden' }}>
      {text}
    </Tag>
  );
}

export default function App() {
  // key を変えて再マウント → アニメーションを再生し直す
  const [replay, setReplay] = useState(0);

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900 dark:bg-neutral-950 dark:text-neutral-50">
      <section className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center gap-10 px-6 py-24">
        {/* key を変えるのはテキスト部分だけ（ボタンのフォーカスを失わないため） */}
        <div key={replay} className="flex flex-col gap-10">
        <StaggeredText
          text="EMOTIONAL DESIGN"
          splitBy="char"
          stagger={0.04}
          className="text-xs font-semibold tracking-[0.4em] text-indigo-600 dark:text-indigo-400"
        />
        <StaggeredText
          as="h1"
          text="言葉が、ひとつずつ届く。"
          stagger={0.06}
          delay={0.3}
          className="text-4xl font-bold leading-tight tracking-tight sm:text-6xl md:text-7xl"
        />
        <StaggeredText
          as="p"
          splitBy="word"
          text="Crafted interfaces that move with intention — every letter arrives at its own pace."
          stagger={0.05}
          delay={0.9}
          className="max-w-2xl text-base leading-relaxed text-stone-600 sm:text-lg dark:text-neutral-400"
        />
        </div>

        <button
          type="button"
          onClick={() => setReplay((n) => n + 1)}
          className="inline-flex w-fit items-center gap-2 rounded-full border border-stone-300 px-5 py-2.5 text-sm font-medium transition hover:bg-stone-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-neutral-700 dark:hover:bg-white dark:hover:text-neutral-900"
        >
          <RotateCcw className="h-4 w-4" /> もう一度再生
        </button>
      </section>
    </main>
  );
}
