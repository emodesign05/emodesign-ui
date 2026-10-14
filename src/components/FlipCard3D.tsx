import { useState } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Compass, Layers, PenTool, RotateCcw, Sparkles, Video } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/* =========================================================
 * カード裏返し（3D Flip Card）
 * - ホバー／タップ／キーボードでカードが X 軸または Y 軸に 180° 回転し、裏面の説明を表示
 * - 仕組み：親に perspective、カード本体に transform-style: preserve-3d、
 *   表裏の 2 面に backface-visibility: hidden を付け、裏面だけ最初から 180° 回しておく
 * - 回転は framer-motion の「時間指定スプリング」（duration + bounce）で、止まり際にわずかに揺り戻す
 *   回転中はカードを少し持ち上げ（translateZ / 影）て、紙を返すような立体感を出す
 * - trigger="hover"：マウスはホバーで裏返り、離すと戻る。キーボードはフォーカスで裏返る。
 *   タップ（タッチ端末）やクリック／Enter で「裏返したまま固定」を切り替え
 * - trigger="click"：クリック／タップ／Enter / Space で表裏を切り替え
 * - カードは <button aria-pressed> なので Tab で移動でき、状態が支援技術に伝わる。
 *   見えていない面は aria-hidden で読み上げから外す
 * - prefers-reduced-motion: reduce のときは回転せず、表裏を即座に切り替える
 * ========================================================= */

type Item = {
  icon: LucideIcon;
  no: string;
  title: string;
  en: string;
  lead: string;
  body: string;
  tags: string[];
  /** 表面のグラデーション */
  bg: string;
};

const ITEMS: Item[] = [
  {
    icon: Compass,
    no: '01',
    title: 'ブランド設計',
    en: 'Branding',
    lead: 'らしさを言葉と形に',
    body: 'ヒアリングから理念・トーンを整理し、ロゴ・配色・書体までを一貫したルールにまとめます。',
    tags: ['ロゴ', 'VI', 'ガイドライン'],
    bg: 'from-indigo-500 via-violet-500 to-fuchsia-500',
  },
  {
    icon: PenTool,
    no: '02',
    title: 'UI デザイン',
    en: 'Interface',
    lead: '迷わない画面を',
    body: '情報設計とワイヤーで導線を固め、Figma で実装しやすいコンポーネント単位に仕上げます。',
    tags: ['IA', 'Figma', 'デザインシステム'],
    bg: 'from-sky-500 via-cyan-500 to-emerald-400',
  },
  {
    icon: Layers,
    no: '03',
    title: 'フロント実装',
    en: 'Development',
    lead: '動きまで設計どおりに',
    body: 'React / Tailwind で高速に組み、GSAP の演出やアクセシビリティまで丁寧に作り込みます。',
    tags: ['React', 'GSAP', 'a11y'],
    bg: 'from-amber-400 via-orange-500 to-rose-500',
  },
  {
    icon: Video,
    no: '04',
    title: 'モーション',
    en: 'Motion',
    lead: '数秒で伝わる映像',
    body: 'SNS 向けの短尺動画やロゴアニメーションを、ブランドの動き方のルールから設計します。',
    tags: ['SNS', 'ロゴアニメ', '短尺'],
    bg: 'from-rose-500 via-pink-500 to-purple-600',
  },
  {
    icon: Sparkles,
    no: '05',
    title: 'グラフィック',
    en: 'Print',
    lead: '手に取られる紙面',
    body: 'チラシ・パンフレット・パッケージまで、入稿データの細部まで責任を持って仕上げます。',
    tags: ['チラシ', 'パッケージ', '名刺'],
    bg: 'from-emerald-500 via-teal-500 to-sky-600',
  },
  {
    icon: RotateCcw,
    no: '06',
    title: '運用・改善',
    en: 'Growth',
    lead: '公開してからが本番',
    body: 'アクセス解析とヒートマップで課題を見つけ、小さな改善を毎月積み重ねていきます。',
    tags: ['解析', 'A/B テスト', '月次レポート'],
    bg: 'from-slate-700 via-slate-800 to-slate-950',
  },
];

type FlipCardProps = {
  item: Item;
  axis: 'x' | 'y';
  duration: number;
  trigger: 'hover' | 'click';
  perspective: number;
  bounce: number;
};

function FlipCard({ item, axis, duration, trigger, perspective, bounce }: FlipCardProps) {
  const reduce = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pinned, setPinned] = useState(false);
  // hover モードでキーボード操作中に Enter で表へ戻したかどうか
  const [kbdOff, setKbdOff] = useState(false);
  // 直前のポインター種別（クリックがマウス／タッチのどちら由来かを判定する）
  const [lastPointer, setLastPointer] = useState('mouse');

  const flipped = trigger === 'hover' ? hovered || pinned || (focused && !kbdOff) : pinned;
  const angle = flipped ? 180 : 0;
  const rotate = axis === 'y' ? { rotateY: angle, rotateX: 0 } : { rotateX: -angle, rotateY: 0 };
  const backFace: CSSProperties = {
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    transform: axis === 'y' ? 'rotateY(180deg)' : 'rotateX(180deg)',
  };
  const frontFace: CSSProperties = { backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' };

  const onEnter = (e: ReactPointerEvent) => {
    if (e.pointerType === 'mouse') setHovered(true);
  };
  const onLeave = (e: ReactPointerEvent) => {
    if (e.pointerType === 'mouse') setHovered(false);
  };

  const Icon = item.icon;

  return (
    <div style={{ perspective }} className="h-80 sm:h-[22rem]">
      <motion.button
        type="button"
        aria-pressed={flipped}
        aria-label={`${item.title}：${flipped ? '表面に戻す' : '詳しい説明を見る'}`}
        onPointerEnter={onEnter}
        onPointerLeave={onLeave}
        onPointerDown={(e) => setLastPointer(e.pointerType)}
        onFocus={(e) => setFocused(e.currentTarget.matches(':focus-visible'))}
        onBlur={() => {
          setFocused(false);
          setKbdOff(false);
        }}
        onClick={(e) => {
          if (trigger === 'click') return setPinned((p) => !p);
          // hover モード：キーボード（detail=0）は表裏の切替、タッチはタップで固定切替、マウスはホバーに任せる
          if (e.detail === 0) setKbdOff((v) => !v);
          else if (lastPointer !== 'mouse') setPinned((p) => !p);
        }}
        initial={false}
        animate={rotate}
        transition={reduce ? { duration: 0 } : { type: 'spring', duration, bounce }}
        style={{ transformStyle: 'preserve-3d' }}
        className="group relative block h-full w-full cursor-pointer rounded-3xl text-left outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-4 focus-visible:ring-offset-slate-100 dark:focus-visible:ring-offset-slate-950"
      >
        {/* 表面 */}
        <span
          aria-hidden={flipped}
          style={frontFace}
          className={`absolute inset-0 flex flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br p-6 text-white shadow-[0_20px_50px_-20px_rgba(15,23,42,0.5)] ${item.bg}`}
        >
          {/* 光沢と粒子感 */}
          <span className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/25 blur-3xl" />
          <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_120%,rgba(0,0,0,0.35),transparent_60%)]" />
          <span className="relative flex items-start justify-between">
            <span className="font-mono text-xs tracking-[0.3em] text-white/80">{item.no}</span>
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/30 backdrop-blur">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
          </span>
          <span className="relative">
            <span className="block text-xs font-semibold uppercase tracking-[0.35em] text-white/70">{item.en}</span>
            <span className="mt-2 block text-3xl font-black tracking-tight sm:text-[2rem]">{item.title}</span>
            <span className="mt-3 flex items-center gap-2 text-sm text-white/85">
              {item.lead}
              <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-black/20 px-3 py-1 text-[11px] font-medium backdrop-blur">
                {trigger === 'hover' ? 'Hover' : 'Click'}
                <RotateCcw className="h-3 w-3" aria-hidden />
              </span>
            </span>
          </span>
        </span>

        {/* 裏面 */}
        <span
          aria-hidden={!flipped}
          style={backFace}
          className="absolute inset-0 flex flex-col overflow-hidden rounded-3xl bg-white p-6 text-slate-900 shadow-[0_20px_50px_-20px_rgba(15,23,42,0.35)] ring-1 ring-slate-200 dark:bg-slate-900 dark:text-white dark:ring-white/10"
        >
          <span className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${item.bg}`} />
          <span className="flex items-center justify-between">
            <span className="font-mono text-xs tracking-[0.3em] text-slate-400">{item.no} / DETAIL</span>
            <ArrowUpRight className="h-5 w-5 text-slate-400 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
          </span>
          <span className="mt-5 block text-2xl font-black tracking-tight">{item.title}</span>
          <span className="mt-3 block text-sm leading-relaxed text-slate-600 dark:text-slate-300">{item.body}</span>
          <span className="mt-auto flex flex-wrap gap-2 pt-4">
            {item.tags.map((t) => (
              <span key={t} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-white/10 dark:text-slate-200">
                {t}
              </span>
            ))}
          </span>
        </span>
      </motion.button>
    </div>
  );
}

type Props = {
  /** 回転軸（'y' = 左右に返す / 'x' = 上下に返す） */
  axis?: 'x' | 'y';
  /** 回転にかかる時間（秒） */
  duration?: number;
  /** 裏返すきっかけ（'hover' = ホバー＆フォーカス / 'click' = クリック・タップ・Enter） */
  trigger?: 'hover' | 'click';
  /** 奥行き（perspective, px）。小さいほどパースが強い */
  perspective?: number;
  /** 止まり際の揺り戻し（0〜0.5） */
  bounce?: number;
  /** カードの枚数（1〜6） */
  count?: number;
};

export function FlipCardGrid({ axis = 'y', duration = 0.8, trigger = 'hover', perspective = 1200, bounce = 0.2, count = 6 }: Props) {
  const items = ITEMS.slice(0, Math.max(1, Math.min(ITEMS.length, count)));
  return (
    <ul className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <li key={item.no}>
          <FlipCard item={item} axis={axis} duration={duration} trigger={trigger} perspective={perspective} bounce={bounce} />
        </li>
      ))}
    </ul>
  );
}

export default function App() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-16 text-slate-900 sm:px-8 sm:py-24 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-xs tracking-[0.35em] text-indigo-600 dark:text-indigo-400">SERVICES</p>
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h1 className="text-4xl font-black tracking-tight sm:text-6xl">できること</h1>
          <p className="max-w-sm text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            カードにカーソルを乗せる（スマホはタップ、キーボードは Tab）と、裏面に詳しい説明が現れます。
          </p>
        </div>
        <div className="mt-10">
          <FlipCardGrid />
        </div>
      </div>
    </main>
  );
}
