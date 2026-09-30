import { useEffect, useId, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* =========================================================
 * ズームスルーヒーロー（Scroll Zoom-Through / Text Mask Zoom）
 * - 大きな文字の形に切り抜かれた画像が、スクロールでぐんぐん拡大し、文字の中を通り抜けて全面の写真になる
 * - 文字のマスクは SVG の <mask>（白地に黒い文字 = 文字の部分だけ穴が開いた白いカバー）
 * - GSAP ScrollTrigger：pin で固定し、scrub でカバーを拡大 → フェードアウト、写真側はわずかに縮小して寄ってくる
 * - transform-origin を「通り抜けたい文字の位置」にすると、そこへ吸い込まれるように見える（focusX / focusY）
 * - 先頭でのオーバースクロール（Mac のゴムのような引っぱり）を止め、拡大率も 1 未満にならないよう固定 → 戻りすぎない
 * - prefers-reduced-motion 時は拡大せず、文字マスクの状態のまま表示
 * ========================================================= */

const PHOTO = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=2400&q=80';

type Props = {
  /** 切り抜く文字 */
  word?: string;
  /** 最大拡大率 */
  maxScale?: number;
  /** 通り抜ける位置（%）。文字の穴の位置に合わせる */
  focusX?: number;
  focusY?: number;
  /** 再生に使うスクロール量（vh） */
  scrollLength?: number;
};

export function ZoomThroughHero({ word = 'EXPLORE', maxScale = 40, focusX = 50, focusY = 50, scrollLength = 200 }: Props) {
  const rootRef = useRef<HTMLElement>(null);
  const maskId = `zoom-mask-${useId().replace(/:/g, '')}`;
  // SVG の横幅を画面の縦横比に合わせる（高さ 900 固定）→ どの画面幅でも文字が切れない
  const [vbWidth, setVbWidth] = useState(1600);
  useEffect(() => {
    const el = rootRef.current?.querySelector('[data-stage]');
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (height > 0) setVbWidth(Math.round((900 * width) / height));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  // 文字の大きさ：画面幅の 86% に収まるように（最大 300）
  const fontSize = Math.min(300, (vbWidth * 0.86) / (Math.max(word.length, 1) * 0.7));

  useGSAP(
    () => {
      // 先頭でさらに上へスクロールした時の「ゴムのような引っぱり（オーバースクロール）」を止める
      // → ヒーローが下にずれて、スタート位置より引いて（ズームアウトして）見えるのを防ぐ
      const html = document.documentElement;
      const prevOverscroll = html.style.overscrollBehaviorY;
      html.style.overscrollBehaviorY = 'none';
      document.body.style.overscrollBehaviorY = 'none';

      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // 拡大率が開始時（1）を下回らないように固定（どんなスクロールでも戻りすぎない）
        const atLeast = (min: number) => (v: string) => String(Math.max(min, parseFloat(v)));
        // 拡大は SVG 内部の <g> に transform 属性として掛ける（CSS の transform で巨大化させると、
        // Chrome が拡大途中の画像をキャッシュして、戻した時に白い四角や欠けた文字が残るため）
        gsap
          .timeline({
            scrollTrigger: {
              trigger: '[data-stage]',
              start: 'top top',
              // 画面サイズやブラウザのズームが変わっても、スクロール量を計算し直す
              end: () => `+=${(window.innerHeight * scrollLength) / 100}`,
              invalidateOnRefresh: true,
              pin: true,
              scrub: 0.5,
            },
          })
          .fromTo(
            '[data-zoom]',
            { scale: 1 },
            { scale: maxScale, svgOrigin: `${(vbWidth * focusX) / 100} ${(900 * focusY) / 100}`, ease: 'power2.in', duration: 1, modifiers: { scale: atLeast(1) } },
            0,
          )
          .to('[data-cover]', { autoAlpha: 0, duration: 0.15 }, 0.85)
          .fromTo('[data-photo]', { scale: 1.3 }, { scale: 1, ease: 'power1.out', duration: 1, modifiers: { scale: atLeast(1) } }, 0)
          .fromTo('[data-after]', { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.2 }, 0.9);
      });

      return () => {
        html.style.overscrollBehaviorY = prevOverscroll;
        document.body.style.overscrollBehaviorY = '';
      };
    },
    { scope: rootRef, dependencies: [maxScale, focusX, focusY, scrollLength, word, vbWidth], revertOnUpdate: true },
  );

  return (
    <main ref={rootRef} className="bg-white">
      <section data-stage className="relative h-screen overflow-hidden">
        {/* 背面の写真 */}
        <img data-photo src={PHOTO} alt="山と湖の風景" className="absolute inset-0 h-full w-full object-cover" />
        <div data-after className="invisible absolute inset-x-0 bottom-[12vh] px-8 text-center text-white">
          <p className="text-xs font-semibold tracking-[0.4em]">WELCOME</p>
          <p className="mt-3 text-4xl font-black drop-shadow-lg sm:text-6xl">景色の、その先へ。</p>
        </div>

        {/* 文字の形に穴が開いた白いカバー（これを拡大して通り抜ける） */}
        <svg data-cover aria-hidden className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" viewBox={`0 0 ${vbWidth} 900`}>
          <defs>
            <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width={vbWidth} height="900">
              <rect width={vbWidth} height="900" fill="white" />
              <text x={vbWidth / 2} y="450" textAnchor="middle" dominantBaseline="central" fontSize={fontSize} fontWeight="900" fontFamily="system-ui, sans-serif" letterSpacing={-fontSize * 0.04} fill="black">
                {word}
              </text>
            </mask>
          </defs>
          <g data-zoom>
            <rect width={vbWidth} height="900" fill="#fafaf9" mask={`url(#${maskId})`} />
          </g>
        </svg>
        <p className="absolute inset-x-0 bottom-8 text-center text-xs font-semibold tracking-[0.3em] text-stone-500">SCROLL ↓</p>
      </section>
      <section className="flex h-[70vh] items-center justify-center bg-stone-50 px-6 text-sm text-stone-500">本編のコンテンツが続きます。</section>
    </main>
  );
}

export default function App() {
  return <ZoomThroughHero />;
}
