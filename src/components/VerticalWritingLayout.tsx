import { motion, useReducedMotion } from 'framer-motion';
import type { CSSProperties, ReactNode } from 'react';

/* =========================================================
 * 縦書きレイアウト（Vertical Writing Layout）
 * - 大見出しは writing-mode: vertical-rl の縦書き、本文は読みやすい横書き、という和風の定番構成
 *   （旅館・飲食店・老舗・和菓子店などのサイト向け）
 * - 縦書き見出しは右側に置き、本文・写真を左へ流す（右から左へ読む流れに合わせる）
 * - 書体は明朝体：font-serif ＋ "Noto Serif JP" / ヒラギノ明朝 / 游明朝 のフォールバック指定のみ（外部フォント読み込みなし）
 * - 余白を大きく取り、スクロールで要素がふわっと浮かび上がる（framer-motion の whileInView、1 回だけ）
 * - horizontalOnMobile が true なら、md 未満の幅では見出しも横書きに切り替えて読みやすくする
 * - 見出しは本物の <h1>/<h2>（縦書きでもスクリーンリーダーは通常通り読む）。飾りの縦線・印は aria-hidden
 * - prefers-reduced-motion 時はふわっと表示を無効化（最初から表示）
 * ========================================================= */

const MINCHO = '"Noto Serif JP", "Noto Serif CJK JP", "Source Han Serif JP", "Hiragino Mincho ProN", "Hiragino Mincho Pro", "Yu Mincho", "YuMincho", "HG明朝E", "MS PMincho", serif';

const SECTIONS = [
  {
    no: '壱',
    title: '湯けむりに、ほどける。',
    lead: '源泉かけ流しの露天風呂',
    body: '山あいに湧く柔らかな湯を、加水せずそのままに。夜には湯面に月が揺れ、朝には鳥の声が湯けむりの向こうから届きます。時間を忘れて、ただ湯に身をあずけるひとときを。',
    image: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=900&q=80',
  },
  {
    no: '弐',
    title: '旬を、ひと皿ずつ。',
    lead: '季節の会席料理',
    body: '朝どれの山菜、渓流の魚、契約農家の米。料理長が素材と向き合い、その日いちばんの姿で器に盛ります。地酒とともに、ゆっくりとお楽しみください。',
    image: 'https://images.unsplash.com/photo-1540648639573-8c848de23f0a?auto=format&fit=crop&w=900&q=80',
  },
  {
    no: '参',
    title: '静けさを、もてなす。',
    lead: '全八室の離れ',
    body: 'すべての客室を離れとし、隣の気配を感じない造りにしました。縁側から望む庭は、四季ごとに表情を変えます。何もしない贅沢を、どうぞ。',
    image: 'https://images.unsplash.com/photo-1624253321171-1be53e12f5f4?auto=format&fit=crop&w=900&q=80',
  },
];

export interface VerticalWritingLayoutProps {
  /** 差し色（朱色など） */
  accent?: string;
  /** スマホ幅（md 未満）では見出しを横書きに切り替える */
  horizontalOnMobile?: boolean;
  /** ふわっと表示の時間（秒） */
  duration?: number;
  /** ふわっと表示で浮き上がる距離（px） */
  distance?: number;
  /** 背景のトーン */
  tone?: 'washi' | 'sumi';
}

function Reveal({ children, delay = 0, duration, distance, className }: { children: ReactNode; delay?: number; duration: number; distance: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: distance, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function VerticalWritingLayout({
  accent = '#b4372f',
  horizontalOnMobile = true,
  duration = 1.2,
  distance = 24,
  tone = 'washi',
}: VerticalWritingLayoutProps) {
  const sumi = tone === 'sumi';
  // 縦書きのクラス：スマホで横書きに切り替える場合は md 以上だけ縦書き
  const vertical = horizontalOnMobile ? '[writing-mode:horizontal-tb] md:[writing-mode:vertical-rl]' : '[writing-mode:vertical-rl]';
  const c = {
    bg: sumi ? 'bg-[#1c1b19] text-[#e9e4d8]' : 'bg-[#f7f3ea] text-[#2b2723]',
    sub: sumi ? 'text-[#a8a193]' : 'text-[#6b645a]',
    line: sumi ? 'bg-[#e9e4d8]/20' : 'bg-[#2b2723]/15',
    img: sumi ? 'bg-[#2a2926]' : 'bg-[#e6dfd0]',
  };
  const style = { fontFamily: MINCHO, '--accent': accent } as CSSProperties;

  return (
    <div className={`font-serif ${c.bg}`} style={style}>
      {/* ヒーロー：大きな縦書きタイトル */}
      <section className="relative mx-auto flex min-h-[92vh] max-w-6xl flex-col items-center justify-center gap-12 px-6 py-24 md:flex-row-reverse md:items-center md:gap-20">
        <Reveal duration={duration} distance={distance}>
          <h1 className={`${vertical} text-4xl font-semibold leading-[1.6] tracking-[0.25em] sm:text-5xl md:text-6xl md:leading-[1.9]`}>
            山の湯宿
            <br />
            しずく
            <span aria-hidden className="ml-3 inline-block align-middle text-base tracking-normal md:ml-0 md:mt-4" style={{ color: accent }}>◆</span>
          </h1>
        </Reveal>
        <span aria-hidden className={`hidden h-48 w-px md:block ${c.line}`} />
        <Reveal duration={duration} distance={distance} delay={0.3} className="max-w-sm text-center md:text-left">
          <p className="text-[11px] tracking-[0.4em]" style={{ color: accent }}>
            SHIZUKU ONSEN RYOKAN
          </p>
          <p className={`mt-6 text-sm leading-[2.2] sm:text-base ${c.sub}`}>
            創業百二十年。
            <br />
            谷あいの小さな宿で、
            <br />
            湯と、食と、静けさを。
          </p>
          <a
            href="#"
            className="mt-10 inline-flex items-center gap-3 border-b pb-1 text-sm tracking-[0.2em] transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-4"
            style={{ borderColor: accent, '--tw-ring-color': accent } as CSSProperties}
          >
            ご予約・空室確認
            <span aria-hidden>→</span>
          </a>
        </Reveal>
      </section>

      {/* 各セクション：右に縦書き見出し、左に写真＋横書き本文 */}
      {SECTIONS.map((s, i) => (
        <section key={s.no} className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <div className="flex flex-col gap-10 md:flex-row-reverse md:gap-16">
            <Reveal duration={duration} distance={distance} className="flex shrink-0 items-start gap-4 md:flex-col md:items-center">
              <span
                aria-hidden
                className="flex h-10 w-10 items-center justify-center rounded-full border text-sm"
                style={{ borderColor: accent, color: accent }}
              >
                {s.no}
              </span>
              <h2 className={`${vertical} text-2xl font-semibold leading-[1.7] tracking-[0.2em] sm:text-3xl md:text-4xl`}>{s.title}</h2>
            </Reveal>

            <div className="grid flex-1 items-center gap-10 md:grid-cols-5">
              <Reveal duration={duration} distance={distance} delay={0.15} className={`md:col-span-3 ${i % 2 === 1 ? 'md:order-2' : ''}`}>
                <div className={`aspect-[4/3] overflow-hidden ${c.img}`}>
                  <img src={s.image} alt="" loading="lazy" className="h-full w-full object-cover" />
                </div>
              </Reveal>
              <Reveal duration={duration} distance={distance} delay={0.3} className={`md:col-span-2 ${i % 2 === 1 ? 'md:order-1' : ''}`}>
                <p className="text-xs tracking-[0.3em]" style={{ color: accent }}>
                  {s.lead}
                </p>
                <p className={`mt-5 text-sm leading-[2.3] sm:text-[15px] ${c.sub}`}>{s.body}</p>
              </Reveal>
            </div>
          </div>
        </section>
      ))}

      <footer className="mx-auto max-w-6xl px-6 pb-20 pt-10">
        <span aria-hidden className={`block h-px w-full ${c.line}`} />
        <p className={`mt-8 text-center text-xs tracking-[0.3em] ${c.sub}`}>山の湯宿 しずく ── 架空の旅館です</p>
      </footer>
    </div>
  );
}

export default function App() {
  return <VerticalWritingLayout />;
}
