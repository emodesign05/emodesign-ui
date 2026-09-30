import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin, useGSAP);

/* =========================================================
 * テキストスクランブル（Text Scramble / Decode）
 * - ランダムな文字がパラパラと入れ替わりながら、左から順に正しい文字へ確定していく
 * - GSAP ScrambleTextPlugin：画面に入った時に1回再生 ＋ ホバーで再生（リンクやボタンの演出に）
 * - 使うランダム文字の種類（英大文字・数字・記号・カタカナ）を切り替え可能
 * - 読み上げ用に aria-label で正しい文字列を渡す（見た目の文字は aria-hidden）
 * - prefers-reduced-motion 時は最初から正しい文字を表示
 * ========================================================= */

const CHARSETS = {
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  alnum: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  symbol: '!<>-_\\/[]{}—=+*^?#',
  katakana: 'アイウエオカキクケコサシスセソタチツテトナニヌネノ',
} as const;

type Charset = keyof typeof CHARSETS;

type ScrambleProps = {
  text: string;
  /** 再生時間（秒） */
  duration?: number;
  /** ランダム文字の種類 */
  chars?: Charset;
  /** 1秒あたりの入れ替わり回数の目安（0〜1、大きいほど激しく変わる） */
  speed?: number;
  /** ホバーでも再生する */
  replayOnHover?: boolean;
  className?: string;
};

export function ScrambleText({ text, duration = 1.2, chars = 'upper', speed = 0.6, replayOnHover = true, className = '' }: ScrambleProps) {
  const ref = useRef<HTMLSpanElement>(null);

  const { contextSafe } = useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      gsap.from(ref.current, {
        duration,
        scrambleText: { text: '', chars: CHARSETS[chars], speed, revealDelay: 0.2 },
        scrollTrigger: { trigger: ref.current, start: 'top 85%', once: true },
      });
    },
    { dependencies: [text, duration, chars, speed], revertOnUpdate: true },
  );

  const onEnter = () => {
    if (!replayOnHover || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    contextSafe(() => {
      gsap.to(ref.current, { duration: duration * 0.6, overwrite: true, scrambleText: { text, chars: CHARSETS[chars], speed } });
    })();
  };

  return (
    <span className={className} aria-label={text} onPointerEnter={onEnter}>
      <span ref={ref} aria-hidden>
        {text}
      </span>
    </span>
  );
}

const LINKS = ['WORKS', 'ABOUT', 'SERVICES', 'CONTACT'];

export default function App() {
  return (
    <main className="flex min-h-screen flex-col justify-center gap-12 bg-neutral-950 px-8 py-24 font-mono text-white sm:px-16">
      <p className="text-xs tracking-[0.4em] text-emerald-400">
        <ScrambleText text="SYSTEM ONLINE — TEXT SCRAMBLE" chars="symbol" duration={1.6} />
      </p>
      <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
        <ScrambleText text="DECODE THE FUTURE" duration={1.8} />
      </h1>
      <nav aria-label="デモ用メニュー">
        <ul className="flex flex-wrap gap-8 text-lg">
          {LINKS.map((l) => (
            <li key={l}>
              <a href="#" className="border-b border-white/20 pb-1 hover:border-emerald-400 hover:text-emerald-300">
                <ScrambleText text={l} duration={0.8} chars="alnum" />
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <p className="text-2xl">
        <ScrambleText text="ことばが、ほどけて、まとまる。" chars="katakana" duration={2} />
      </p>
      <p className="text-xs text-white/50">メニューにカーソルを乗せると、もう一度スクランブルします。</p>
    </main>
  );
}
