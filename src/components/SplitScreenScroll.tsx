import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';

/* =========================================================
 * 画面分割スクロール（Split-Screen Scroll）
 * - PC（lg 以上）：片側（既定は左）を position: sticky で画面に固定し、反対側の章だけがスクロール
 *   右の章が画面の中央線をまたぐと、固定側の画像・見出しがクロスフェードで切り替わる
 * - 現在の章の検出は IntersectionObserver（rootMargin で「画面の中央の 1 本線」だけを判定領域にする）
 * - 画像は全章ぶんを重ねておき、opacity と scale を framer-motion でなめらかに補間（読み込み済みなのでチラつかない）
 *   見出しは「前の章なら上へ・次の章なら下へ」抜けるので、スクロール方向に合った動きになる
 * - 固定側の章インジケーター（ボタン）で任意の章へ移動。aria-current で現在の章を伝える
 * - スマホ／タブレット（lg 未満）：分割をやめ、各章の中に画像を差し込んで縦積み表示
 * - reverse で左右を入れ替え（固定側が右になる）
 * - prefers-reduced-motion: reduce のときは拡大・移動をやめ、切り替えは即時（スクロール移動も瞬時）
 * ========================================================= */

const IMG = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=80`;

const CHAPTERS = [
  {
    en: 'Read the Land',
    title: '土地を読む',
    body: '風の向き、朝日の入る角度、隣家との距離。まずは一日その場所に立ち、図面に描けない情報を集めるところから始めます。',
    stats: [['敷地調査', '3 日'], ['ヒアリング', '4 回']],
    img: IMG('photo-1500530855697-b586d89ba3ee'),
    tint: 'from-emerald-700 to-stone-900',
  },
  {
    en: 'Design the Light',
    title: '光を設計する',
    body: '窓は「外を見るため」だけでなく「光を受けとめる器」。季節ごとの影の落ち方をシミュレーションし、開口の位置を決めます。',
    stats: [['日照検討', '12 パターン'], ['模型', '1/50']],
    img: IMG('photo-1600585154340-be6161a56a0c'),
    tint: 'from-amber-600 to-stone-900',
  },
  {
    en: 'Choose Materials',
    title: '素材を選ぶ',
    body: '経年で味わいが増す無垢材、手ざわりの良い左官壁。10 年後の姿まで想像しながら、長く付き合える素材を選びます。',
    stats: [['使用樹種', '5 種'], ['サンプル', '40 点']],
    img: IMG('photo-1441974231531-c6227db76b6e'),
    tint: 'from-lime-700 to-stone-900',
  },
  {
    en: 'Craft by Hand',
    title: '手で仕上げる',
    body: '現場では職人と毎週打ち合わせ。図面どおりに作るだけでなく、その場で見つけた「もっと良くなる余地」を拾い上げます。',
    stats: [['工期', '7 か月'], ['現場定例', '28 回']],
    img: IMG('photo-1506744038136-46273834b3fb'),
    tint: 'from-sky-700 to-slate-900',
  },
  {
    en: 'Live and Pass On',
    title: '住み継ぐ',
    body: '引き渡しは終わりではなく始まり。定期点検と小さな手入れを重ね、次の世代まで住み継げる家に育てていきます。',
    stats: [['定期点検', '10 年'], ['リフォーム相談', '随時']],
    img: IMG('photo-1470071459604-3b5ec3a7fe05'),
    tint: 'from-teal-700 to-slate-900',
  },
  {
    en: 'Leave the Margin',
    title: '余白を残す',
    body: '暮らしは変わり続けるもの。すべてを決めきらず、住む人が手を加えられる「余白」を意図的に残しておきます。',
    stats: [['可変間仕切り', '3 か所'], ['将来の増築', '想定済み']],
    img: IMG('photo-1501785888041-af3ef285b470'),
    tint: 'from-rose-700 to-stone-900',
  },
];

const pad = (n: number) => String(n).padStart(2, '0');

type Props = {
  /** 章の数（2〜6） */
  chapters?: number;
  /** 左右を入れ替える（固定側を右にする） */
  reverse?: boolean;
  /** クロスフェードの時間（秒） */
  fadeDuration?: number;
  /** 切り替わり時に画像が寄ってくる量（1 = なし） */
  zoom?: number;
};

export function SplitScreenScroll({ chapters = 4, reverse = false, fadeDuration = 0.9, zoom = 1.12 }: Props) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const items = CHAPTERS.slice(0, Math.max(2, Math.min(CHAPTERS.length, chapters)));

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const els = Array.from(list.querySelectorAll<HTMLElement>('[data-chapter]'));
    // 画面の中央 1 本線（上下 50% を除外）をまたいでいる章を「現在の章」にする
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.chapter));
        });
      },
      { rootMargin: '-50% 0px -50% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items.length]);

  const goTo = (i: number) => {
    listRef.current?.querySelector(`[data-chapter="${i}"]`)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  };

  const ease = [0.22, 1, 0.36, 1] as const;
  const t = reduce ? { duration: 0 } : { duration: fadeDuration, ease };

  return (
    <section aria-label="制作のながれ" className={`relative lg:flex ${reverse ? 'lg:flex-row-reverse' : ''}`}>
      {/* 固定側（PC のみ） */}
      <div className="hidden lg:sticky lg:top-0 lg:block lg:h-screen lg:w-1/2">
        <div className="relative h-full w-full overflow-hidden bg-stone-900">
          {items.map((c, i) => (
            <motion.div
              key={c.title}
              aria-hidden={i !== active}
              initial={false}
              animate={{ opacity: i === active ? 1 : 0, scale: reduce ? 1 : i === active ? 1 : zoom }}
              transition={t}
              className={`absolute inset-0 bg-gradient-to-br ${c.tint}`}
            >
              <img src={c.img} alt="" className="h-full w-full object-cover" loading={i === 0 ? 'eager' : 'lazy'} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/30" />
            </motion.div>
          ))}

          {/* 見出し（前の章は上へ、次の章は下へ抜ける） */}
          <div className="absolute inset-x-0 bottom-0 p-12 text-white xl:p-16">
            <div className="relative h-40 overflow-hidden">
              {items.map((c, i) => (
                <motion.div
                  key={c.title}
                  aria-hidden={i !== active}
                  initial={false}
                  animate={{ opacity: i === active ? 1 : 0, y: reduce || i === active ? 0 : i < active ? -60 : 60 }}
                  transition={t}
                  className="absolute inset-x-0 bottom-0"
                >
                  <p className="font-mono text-xs tracking-[0.35em] text-white/70">
                    CHAPTER {pad(i + 1)} — {c.en.toUpperCase()}
                  </p>
                  <p className="mt-3 text-6xl font-black tracking-tight xl:text-7xl">{c.title}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* 章インジケーター */}
          <nav aria-label="章へ移動" className={`absolute top-10 flex items-center gap-4 text-white ${reverse ? 'right-12 flex-row-reverse' : 'left-12'}`}>
            <span className="font-mono text-sm tabular-nums">
              {pad(active + 1)} <span className="text-white/50">/ {pad(items.length)}</span>
            </span>
            <ol className="flex gap-1.5">
              {items.map((c, i) => (
                <li key={c.title}>
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={`第${i + 1}章「${c.title}」へ移動`}
                    aria-current={i === active ? 'step' : undefined}
                    className="group flex h-6 items-center rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <span className="relative block h-0.5 w-8 overflow-hidden rounded-full bg-white/30">
                      <motion.span
                        initial={false}
                        animate={{ scaleX: i <= active ? 1 : 0 }}
                        transition={reduce ? { duration: 0 } : { duration: 0.6, ease }}
                        className="absolute inset-0 origin-left bg-white"
                      />
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>

      {/* スクロールする側 */}
      <div ref={listRef} className="lg:w-1/2">
        {items.map((c, i) => (
          <article
            key={c.title}
            data-chapter={i}
            className="flex min-h-[80vh] flex-col justify-center border-b border-stone-200 px-5 py-16 sm:px-10 lg:min-h-screen lg:px-16 xl:px-24 dark:border-stone-800"
          >
            {/* スマホでは画像を章の中に差し込む */}
            <div className={`relative mb-8 aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br lg:hidden ${c.tint}`}>
              <img src={c.img} alt="" className="h-full w-full object-cover" loading="lazy" />
            </div>
            <p className="font-mono text-xs tracking-[0.35em] text-stone-500">
              {pad(i + 1)} / {pad(items.length)}
            </p>
            <h3 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">{c.title}</h3>
            <p className="mt-1 text-sm font-medium text-stone-400">{c.en}</p>
            <p className="mt-6 max-w-md text-base leading-loose text-stone-600 dark:text-stone-300">{c.body}</p>
            <dl className="mt-10 grid max-w-md grid-cols-2 gap-6 border-t border-stone-200 pt-6 dark:border-stone-800">
              {c.stats.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs text-stone-500">{k}</dt>
                  <dd className="mt-1 text-2xl font-bold tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function App() {
  return (
    <main className="bg-[#f5f2ec] text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <header className="flex min-h-[70vh] flex-col justify-end px-5 pb-16 sm:px-10 lg:px-16">
        <p className="font-mono text-xs tracking-[0.35em] text-stone-500">ATELIER NIWA — PROCESS</p>
        <h1 className="mt-4 max-w-4xl text-5xl font-black leading-[1.05] tracking-tight sm:text-7xl">
          一軒の家が、
          <br />
          できるまで。
        </h1>
        <p className="mt-6 flex items-center gap-2 text-sm text-stone-500">
          <ArrowDown className="h-4 w-4 motion-safe:animate-bounce" aria-hidden />
          スクロールすると、左の写真と見出しが章ごとに切り替わります
        </p>
      </header>
      <SplitScreenScroll chapters={6} />
      <footer className="flex min-h-[60vh] flex-col items-center justify-center px-5 text-center">
        <p className="font-mono text-xs tracking-[0.35em] text-stone-500">CONTACT</p>
        <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">まずは、お話から。</h2>
      </footer>
    </main>
  );
}
