import { useEffect, useRef, useState } from 'react';
import { ArrowUp } from 'lucide-react';

/* =========================================================
 * ページトップへ戻るボタン（Back to Top Button：進捗リング付き）
 * - 一定量（threshold px）スクロールすると、画面右下（または左下）にふわっと出現
 * - ボタンの周りの SVG 円が、ページの読了率に合わせて一周ぶん伸びていく
 *   仕組み：円周の長さを stroke-dasharray に入れ、stroke-dashoffset を「円周 ×（1 − 読了率）」にする
 * - スクロールごとの更新は requestAnimationFrame でまとめ、DOM を直接書き換える（再レンダーしない）
 *   出現 / 非表示の切り替え時だけ state を更新
 * - クリックでなめらかに最上部へ。reduced-motion 時は即時に移動
 *   移動後はページ先頭（#top 等の要素）にフォーカスを移し、キーボード操作でも迷子にならない
 * - aria-label に現在の読了率を含める
 * ========================================================= */

type Props = {
  /** ボタンが出現するスクロール量（px） */
  threshold?: number;
  /** ボタンの直径（px） */
  size?: number;
  /** リングの太さ（px） */
  strokeWidth?: number;
  /** リングの色 */
  color?: string;
  /** 配置 */
  side?: 'right' | 'left';
  /** 中央に％を表示（オフなら矢印アイコン） */
  showPercent?: boolean;
  /** 戻ったあとにフォーカスを移す要素の id（未指定なら body の先頭） */
  focusTargetId?: string;
};

export function BackToTop({
  threshold = 400,
  size = 56,
  strokeWidth = 3,
  color = '#6366f1',
  side = 'right',
  showPercent = false,
  focusTargetId,
}: Props) {
  const [visible, setVisible] = useState(false);
  const ringRef = useRef<SVGCircleElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const r = (size - strokeWidth) / 2 - 2;
  const circumference = 2 * Math.PI * r;

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = document.documentElement;
      const max = el.scrollHeight - window.innerHeight;
      const y = window.scrollY;
      const p = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
      const pct = Math.round(p * 100);
      ringRef.current?.style.setProperty('stroke-dashoffset', String(circumference * (1 - p)));
      if (textRef.current) textRef.current.textContent = `${pct}`;
      btnRef.current?.setAttribute('aria-label', `ページの先頭へ戻る（${pct}% 読了）`);
      setVisible(y > threshold); // 値が同じなら React は再レンダーしない
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [threshold, circumference]);

  const toTop = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    // フォーカスを先頭へ（スクロール位置はすでに動かしているので preventScroll）
    const target = (focusTargetId && document.getElementById(focusTargetId)) || document.body;
    if (target !== document.body && !target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  };

  return (
    <button
      ref={btnRef}
      type="button"
      id="back-to-top"
      onClick={toTop}
      aria-label="ページの先頭へ戻る（0% 読了）"
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      style={{ width: size, height: size }}
      className={`group fixed bottom-6 z-50 flex items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-[0_10px_30px_-10px_rgba(15,23,42,0.35)] ring-1 ring-slate-200/80 backdrop-blur-md transition-[opacity,transform,box-shadow] duration-300 hover:shadow-[0_14px_36px_-10px_rgba(15,23,42,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 motion-reduce:transition-opacity sm:bottom-8 dark:bg-slate-900/90 dark:text-slate-100 dark:ring-slate-700/80 ${
        side === 'right' ? 'right-4 sm:right-8' : 'left-4 sm:left-8'
      } ${visible ? 'translate-y-0 scale-100 opacity-100' : 'pointer-events-none translate-y-4 scale-90 opacity-0 motion-reduce:translate-y-0 motion-reduce:scale-100'}`}
    >
      <svg className="absolute inset-0 -rotate-90" width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={strokeWidth} className="stroke-slate-200 dark:stroke-slate-700" />
        <circle
          ref={ringRef}
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          className="transition-[stroke-dashoffset] duration-150 ease-out motion-reduce:transition-none"
        />
      </svg>
      {showPercent ? (
        <span className="relative flex flex-col items-center gap-0.5 leading-none">
          <ArrowUp className="h-3 w-3 opacity-60 transition-transform group-hover:-translate-y-0.5 motion-reduce:transition-none" aria-hidden="true" />
          <span className="text-[12px] font-bold tabular-nums">
            <span ref={textRef}>0</span>
            <span className="text-[9px] font-semibold opacity-60">%</span>
          </span>
        </span>
      ) : (
        <ArrowUp className="relative h-5 w-5 transition-transform duration-200 group-hover:-translate-y-0.5 motion-reduce:transition-none" aria-hidden="true" />
      )}
    </button>
  );
}

/* ---------- デモ ---------- */

const SECTIONS = [
  { h: 'はじめに', p: 'Webサイトを訪れた人が、最後まで心地よく読み進められるかどうか。それを左右するのは、派手な演出よりも、文字組みや余白、操作の迷いにくさといった地味な部分です。' },
  { h: '長いページに必要なもの', p: '記事やランディングページが長くなるほど、「いまどこにいるのか」「すぐに上へ戻れるか」が大切になります。読了率のリングは、残りの分量をさりげなく伝えてくれます。' },
  { h: '出現のタイミング', p: 'ページを開いてすぐにボタンが出ていると、視線のノイズになります。ある程度スクロールしてから現れるようにすると、必要な人にだけ届く控えめな存在になります。' },
  { h: 'なめらかなスクロール', p: '一瞬で最上部へ飛ぶと、どこへ移動したのか分かりにくくなります。なめらかに戻ることで、ページの流れを保ったまま先頭へ戻れます。ただし動きを減らす設定の人には即時に移動します。' },
  { h: '押しやすさ', p: 'スマートフォンでは親指が届きやすい右下が定位置です。44px 以上の大きさを確保し、ほかの固定要素と重ならないよう余白を取るのがポイントです。' },
  { h: 'おわりに', p: '小さなボタンひとつでも、配慮を重ねることで体験は変わります。細部まで丁寧に設計されたページは、訪れた人の信頼につながります。' },
];

/** デモ用の長いダミー記事＋ボタン */
export function BackToTopDemo(props: Props) {
  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header id="article-top" className="mx-auto max-w-2xl px-5 pb-10 pt-20 outline-none sm:px-6 sm:pt-28">
        <p className="text-xs font-semibold tracking-[0.3em] text-indigo-600 dark:text-indigo-400">COLUMN</p>
        <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-5xl">読み終わるまで、迷わせない。</h1>
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">2026.10.12 ・ 約6分で読めます ・ 下へスクロールしてください</p>
        <div className="mt-10 aspect-[16/9] rounded-3xl bg-gradient-to-br from-indigo-100 via-violet-100 to-fuchsia-100 dark:from-indigo-950 dark:via-violet-950 dark:to-fuchsia-950" />
      </header>
      <article className="mx-auto max-w-2xl space-y-14 px-5 pb-48 sm:px-6">
        {[0, 1, 2].flatMap((round) =>
          SECTIONS.map((s, i) => (
            <section key={`${round}-${i}`}>
              <h2 className="text-xl font-bold sm:text-2xl">
                <span className="mr-3 font-mono text-sm text-indigo-500">{String(round * SECTIONS.length + i + 1).padStart(2, '0')}</span>
                {s.h}
              </h2>
              <p className="mt-4 text-[15px] leading-loose text-slate-600 dark:text-slate-300">{s.p}</p>
              <p className="mt-4 text-[15px] leading-loose text-slate-600 dark:text-slate-300">{s.p}</p>
            </section>
          )),
        )}
        <p className="rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400">
          最後まで読んでいただきありがとうございました。右下のボタンで先頭へ戻れます。
        </p>
      </article>
      <BackToTop focusTargetId="article-top" {...props} />
    </div>
  );
}

export default function App() {
  return <BackToTopDemo />;
}
