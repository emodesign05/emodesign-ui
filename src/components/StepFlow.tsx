import { useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { MotionValue } from 'framer-motion';
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { CalendarCheck, ClipboardList, MessageCircle, Smile, Sparkles } from 'lucide-react';

/* =========================================================
 * ご利用の流れ（Step Flow / Timeline）
 * - 番号付きステップを、スマホでは縦、PC（md 以上）では横に並べるタイムライン
 * - スクロールに合わせてステップ間の線が伸び、線が届いたステップの丸が点灯する
 * - 仕組み：framer-motion の useScroll でセクションの通過率（0〜1）を取り、
 *   線は scaleY / scaleX に、点灯は「通過率 ≧ i / (ステップ数 - 1)」で判定（useMotionValueEvent で state 化）
 * - scrub を false にすると、画面に入ったときに一度だけ順番に点灯する演出になる
 * - サロン・士業・採用ページの「ご利用の流れ」「選考フロー」などに
 * - アクセシビリティ：<ol> の順序付きリスト。点灯は装飾なので aria には出さない
 * - prefers-reduced-motion: reduce のときは線を最初から全表示し、全ステップを点灯状態で固定
 * ========================================================= */

const ACCENTS = {
  indigo: { bg: 'bg-indigo-600', text: 'text-indigo-600 dark:text-indigo-400', ring: 'ring-indigo-100 dark:ring-indigo-950', soft: 'bg-indigo-50 dark:bg-indigo-950/60' },
  rose: { bg: 'bg-rose-500', text: 'text-rose-600 dark:text-rose-400', ring: 'ring-rose-100 dark:ring-rose-950', soft: 'bg-rose-50 dark:bg-rose-950/60' },
  emerald: { bg: 'bg-emerald-600', text: 'text-emerald-600 dark:text-emerald-400', ring: 'ring-emerald-100 dark:ring-emerald-950', soft: 'bg-emerald-50 dark:bg-emerald-950/60' },
  amber: { bg: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400', ring: 'ring-amber-100 dark:ring-amber-950', soft: 'bg-amber-50 dark:bg-amber-950/60' },
} as const;

const STEPS = [
  { icon: MessageCircle, title: 'お問い合わせ', body: 'フォームまたはお電話でお気軽にご連絡ください。24時間以内にご返信します。', time: '当日' },
  { icon: ClipboardList, title: '無料カウンセリング', body: 'ご要望やお悩みを丁寧にヒアリングし、最適なプランをご提案します。', time: '約60分' },
  { icon: CalendarCheck, title: 'お見積り・ご契約', body: '内容と費用を明確にご説明。ご納得いただいてからのご契約です。', time: '3営業日' },
  { icon: Sparkles, title: '施術・サービス開始', body: '担当スタッフが責任を持って対応。進捗も随時ご報告します。', time: '1〜2週間' },
  { icon: Smile, title: 'アフターフォロー', body: '終了後も定期的にご連絡し、気になる点はいつでもご相談いただけます。', time: '継続' },
];

// 線（ステップ i の丸の中心 → 次の丸の中心）。縦は gap-10(2.5rem)、横は gap-4(1rem) ぶん伸ばす
const SEG_V = 'left-6 top-6 h-[calc(100%+2.5rem)] w-[var(--lw)] -translate-x-1/2';
const SEG_H = 'left-1/2 top-6 h-[var(--lw)] w-[calc(100%+1rem)] -translate-y-1/2';
const SEG_AUTO = `${SEG_V} md:left-1/2 md:h-[var(--lw)] md:w-[calc(100%+1rem)] md:translate-x-0 md:-translate-y-1/2`;
// 塗りは --p（0〜1）で伸ばす。縦は scaleY、横は scaleX
const FILL_V = 'origin-top [transform:scaleY(var(--p))]';
const FILL_H = 'origin-left [transform:scaleX(var(--p))]';

function Segment({
  index,
  total,
  progress,
  mode,
  className,
  fill,
}: {
  index: number;
  total: number;
  progress: MotionValue<number>;
  mode: 'scrub' | 'play' | 'idle' | 'full';
  className: string;
  fill: string;
}) {
  // 全体の通過率から「この区間の進み具合」を切り出す
  const p = useTransform(progress, (v) => Math.min(1, Math.max(0, v * (total - 1) - index)));
  const dir = className === SEG_H ? FILL_H : className === SEG_V ? FILL_V : `${FILL_V} md:origin-left md:[transform:scaleX(var(--p))]`;
  const per = 1.2 / (total - 1);
  return (
    <div aria-hidden className={`absolute z-0 ${className}`}>
      <div className="absolute inset-0 rounded-full bg-slate-200 dark:bg-slate-800" />
      {mode === 'scrub' ? (
        <motion.div className={`absolute inset-0 rounded-full ${fill} ${dir}`} style={{ '--p': p } as unknown as CSSProperties} />
      ) : (
        <div
          className={`absolute inset-0 rounded-full ${fill} ${dir}`}
          style={
            {
              '--p': mode === 'idle' ? 0 : 1,
              transition: mode === 'play' ? `transform ${per}s linear ${index * per}s` : 'none',
            } as CSSProperties
          }
        />
      )}
    </div>
  );
}

export type StepFlowProps = {
  /** アクセント色 */
  accent?: keyof typeof ACCENTS;
  /** 並び方：auto = スマホ縦／PC 横、vertical = 常に縦、horizontal = 常に横 */
  layout?: 'auto' | 'vertical' | 'horizontal';
  /** true = スクロール量に連動して線が伸びる / false = 画面に入ったら一度だけ順番に点灯 */
  scrub?: boolean;
  /** 線の太さ（px） 1〜6 */
  lineWidth?: number;
  /** ステップ番号を丸の中に出すか（false ならアイコン） */
  showNumber?: boolean;
};

export function StepFlow({ accent = 'indigo', layout = 'auto', scrub = true, lineWidth = 2, showNumber = true }: StepFlowProps) {
  const ac = ACCENTS[accent];
  const reduce = useReducedMotion();
  const ref = useRef<HTMLOListElement>(null);
  const n = STEPS.length;

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 80%', 'end 40%'] });
  const smooth = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });
  const [lit, setLit] = useState(-1);
  const [inView, setInView] = useState(false);

  useMotionValueEvent(smooth, 'change', (v) => {
    if (!scrub) return;
    const next = Math.floor(v * (n - 1) + 0.02);
    setLit((prev) => (prev === next ? prev : next));
  });

  const activeIndex = reduce ? n - 1 : scrub ? lit : inView ? n - 1 : -1;

  // レイアウト別のクラス
  const isH = layout === 'horizontal';
  const isV = layout === 'vertical';
  const list = isH ? 'grid-cols-5' : isV ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-5';
  const item = isH ? 'flex-col items-center text-center' : isV ? 'flex-row' : 'flex-row md:flex-col md:items-center md:text-center';
  const gap = isH ? 'gap-4' : isV ? 'gap-10' : 'gap-10 md:gap-4';
  const textWrap = isH ? 'mt-5' : isV ? 'pt-1' : 'pt-1 md:mt-5 md:pt-0';
  const seg = isH ? SEG_H : isV ? SEG_V : SEG_AUTO;

  return (
    <motion.ol
      ref={ref}
      onViewportEnter={() => setInView(true)}
      viewport={{ once: true, amount: 0.4 }}
      className={`relative grid w-full min-w-0 max-w-6xl ${list} ${gap}`}
      style={{ '--lw': `${lineWidth}px` } as CSSProperties}
    >
      {STEPS.map((s, i) => {
        const on = i <= activeIndex;
        const Icon = s.icon;
        return (
          <li key={s.title} className={`relative flex gap-5 ${item}`} data-step={i + 1} data-active={on}>
            {i < n - 1 && (
              <Segment index={i} total={n} progress={smooth} mode={reduce ? 'full' : scrub ? 'scrub' : inView ? 'play' : 'idle'} className={seg} fill={ac.bg} />
            )}
            <div
              className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold ring-8 ${
                on ? `${ac.bg} ${ac.ring} text-white` : 'bg-white text-slate-400 ring-white dark:bg-slate-900 dark:text-slate-500 dark:ring-slate-900'
              } border ${on ? 'border-transparent' : 'border-slate-200 dark:border-slate-700'}`}
              style={{
                transition: reduce ? 'none' : 'background-color .4s ease, color .4s ease, box-shadow .4s ease, transform .4s cubic-bezier(.34,1.56,.64,1)',
                transform: on && !reduce ? 'scale(1.06)' : 'scale(1)',
                transitionDelay: !scrub && !reduce && inView ? `${(i * 1.2) / (n - 1)}s` : '0s',
              }}
            >
              {showNumber ? <span className="tabular-nums">{String(i + 1).padStart(2, '0')}</span> : <Icon aria-hidden className="h-5 w-5" />}
            </div>

            <div className={`min-w-0 ${textWrap}`}>
              <p className={`text-[11px] font-bold tracking-[0.18em] ${on ? ac.text : 'text-slate-400'}`} style={{ transition: reduce ? 'none' : 'color .4s' }}>
                STEP {i + 1}
              </p>
              <h3 className="mt-1 text-base font-bold text-slate-900 dark:text-white">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{s.body}</p>
              <span className={`mt-3 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${on ? `${ac.soft} ${ac.text}` : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                目安：{s.time}
              </span>
            </div>
          </li>
        );
      })}
    </motion.ol>
  );
}

export default function App() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 dark:bg-slate-950">
      <div className="flex h-[60vh] flex-col items-center justify-center text-center">
        <p className="text-xs font-bold tracking-[0.2em] text-indigo-600">FLOW</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">ご利用の流れ</h2>
        <p className="mt-3 text-sm text-slate-500">下へスクロールすると、線が伸びて各ステップが点灯します</p>
      </div>
      <div className="mx-auto flex max-w-6xl justify-center rounded-3xl border border-slate-200 bg-white px-5 py-14 sm:px-10 dark:border-slate-800 dark:bg-slate-900">
        <StepFlow />
      </div>
      <div className="h-[80vh]" />
    </main>
  );
}
