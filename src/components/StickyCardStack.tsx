import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Compass, Layers, PenTool, Rocket } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* =========================================================
 * スティッキーカードスタック（Sticky Stacking Cards）
 * - カードが画面上部で止まり、次のカードが上に重なっていく（サービス紹介・制作フローなどに）
 * - 位置の固定は CSS sticky（top をカードごとに少しずつずらして束ねる）
 * - 下に隠れていくカードの縮小・暗転だけ GSAP ScrollTrigger の scrub で制御
 * - prefers-reduced-motion 時は縮小・暗転なし（重なりのみ）
 * ========================================================= */

const STEPS = [
  { icon: Compass, no: '01', title: 'ヒアリング', body: '課題とゴールを言葉にし、進む方向を決めます。', color: 'bg-indigo-600' },
  { icon: PenTool, no: '02', title: 'デザイン', body: '情報設計からビジュアルまで、体験をかたちにします。', color: 'bg-rose-500' },
  { icon: Layers, no: '03', title: '実装', body: '表現を損なわず、速く・壊れにくいコードに落とし込みます。', color: 'bg-amber-500' },
  { icon: Rocket, no: '04', title: '公開・改善', body: '公開後も数字を見ながら、磨き続けます。', color: 'bg-emerald-600' },
];

type Props = {
  /** 1枚奥に行くごとの縮小量 */
  scaleStep?: number;
  /** 重なった時のカード上端のずれ（px） */
  offset?: number;
  /** 奥のカードの暗さ（0〜1） */
  dim?: number;
};

export function StickyCardStack({ scaleStep = 0.05, offset = 24, dim = 0.35 }: Props) {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const cards = gsap.utils.toArray<HTMLElement>('[data-card]');
        cards.forEach((card, i) => {
          const behind = cards.length - 1 - i; // この後に重なる枚数
          if (behind === 0) return;
          // 次のカードが重なり始めてから、最後のカードが止まるまでの間に縮小・暗転
          gsap
            .timeline({ scrollTrigger: { trigger: cards[i + 1], start: 'top bottom', endTrigger: cards[cards.length - 1], end: `top ${120 + offset * (cards.length - 1)}px`, scrub: true } })
            .to(card, { scale: 1 - scaleStep * behind, ease: 'none' }, 0)
            .to(card.querySelector('[data-dim]'), { opacity: dim, ease: 'none' }, 0);
        });
      });
    },
    { scope: rootRef, dependencies: [scaleStep, offset, dim], revertOnUpdate: true },
  );

  return (
    <main ref={rootRef} className="bg-stone-100 text-stone-900 dark:bg-neutral-950 dark:text-white">
      <section className="mx-auto max-w-4xl px-6 pb-16 pt-[20vh]">
        <p className="text-xs font-semibold tracking-[0.3em] text-indigo-600 dark:text-indigo-400">STICKY CARD STACK</p>
        <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">制作の流れ</h1>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-[40vh]">
        {STEPS.map((s, i) => (
          <article
            key={s.no}
            data-card
            className={`sticky mb-[12vh] flex h-[60vh] origin-top flex-col justify-between overflow-hidden rounded-[2rem] p-8 text-white shadow-2xl will-change-transform sm:p-12 ${s.color}`}
            style={{ top: 120 + i * offset }}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold tabular-nums text-white/80">{s.no} / 0{STEPS.length}</span>
              <s.icon className="h-8 w-8 text-white/90" aria-hidden />
            </div>
            <div>
              <h2 className="text-4xl font-bold sm:text-6xl">{s.title}</h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-white/85 sm:text-base">{s.body}</p>
            </div>
            {/* 奥に行くほど暗くする */}
            <div data-dim aria-hidden className="pointer-events-none absolute inset-0 bg-black opacity-0" />
          </article>
        ))}
      </section>
    </main>
  );
}

export default function App() {
  return <StickyCardStack />;
}
