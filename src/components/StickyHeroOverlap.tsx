import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ArrowDown } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* =========================================================
 * ヒーローピン＋オーバーラップ（Sticky Hero Overlap Section）
 * - ヒーローを position: sticky で画面に固定し、次のセクションが上に重なりながら覆っていく
 * - 覆われるにつれてヒーローが少し縮小・暗転し、奥へ下がるような奥行きを演出
 * - GSAP ScrollTrigger の pin（pinSpacing: false）でヒーローを固定し、縮小・角丸・暗転を scrub で同期
 * - prefers-reduced-motion 時は縮小・暗転なし（重なりのみ）
 * ========================================================= */

const HERO_IMAGE = 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=2000&q=80';

const FEATURES = [
  { no: '01', title: 'Strategy', body: '課題の整理から、届けるべき体験を設計します。' },
  { no: '02', title: 'Design', body: 'ブランドの世界観を、画面の隅々まで一貫させます。' },
  { no: '03', title: 'Engineering', body: '表現を損なわず、速く・壊れにくい実装に落とし込みます。' },
];

export function StickyHeroOverlap({ minScale = 0.9, maxRadius = 32, maxDim = 0.6 }: { minScale?: number; maxRadius?: number; maxDim?: number }) {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      // ヒーローを固定（スペースを空けない＝次のセクションがそのまま上に重なる）
      ScrollTrigger.create({ trigger: '[data-hero]', start: 'top top', endTrigger: '[data-cover]', end: 'top top', pin: true, pinSpacing: false });
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // 覆うセクションが画面下端に入ってから、上端に達するまで
        gsap
          .timeline({ scrollTrigger: { trigger: '[data-cover]', start: 'top bottom', end: 'top top', scrub: true } })
          .fromTo('[data-hero-inner]', { scale: 1, borderRadius: 0 }, { scale: minScale, borderRadius: maxRadius, ease: 'none' }, 0)
          .fromTo('[data-dim]', { opacity: 0 }, { opacity: maxDim, ease: 'none' }, 0);
      });
    },
    { scope: rootRef, dependencies: [minScale, maxRadius, maxDim], revertOnUpdate: true },
  );

  return (
    <main ref={rootRef} className="bg-neutral-950">
      {/* ---- 固定されるヒーロー ---- */}
      <div data-hero className="h-screen overflow-hidden">
        <div data-hero-inner className="relative h-full w-full origin-top overflow-hidden will-change-transform">
          <img src={HERO_IMAGE} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60" />
          <div className="relative flex h-full flex-col justify-end px-8 pb-16 text-white sm:px-16">
            <p className="text-xs font-semibold tracking-[0.3em] text-white/80">STICKY HERO OVERLAP</p>
            <h1 className="mt-4 max-w-3xl text-5xl font-bold leading-[1.05] sm:text-7xl">
              景色の上に、
              <br />
              物語が重なる。
            </h1>
            <p className="mt-6 flex items-center gap-2 text-sm text-white/80">
              <ArrowDown className="h-4 w-4 animate-bounce motion-reduce:animate-none" /> スクロール
            </p>
          </div>
          {/* 覆われるほど暗くする */}
          <div data-dim aria-hidden className="absolute inset-0 bg-black opacity-0" />
        </div>
      </div>

      {/* ---- 上に重なってくるセクション ---- */}
      <section
        data-cover
        className="relative z-10 rounded-t-[2rem] bg-white px-8 py-24 text-slate-900 shadow-[0_-30px_60px_-20px_rgba(0,0,0,0.5)] sm:px-16 dark:bg-slate-900 dark:text-white"
      >
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-semibold tracking-[0.3em] text-indigo-600 dark:text-indigo-400">WHAT WE DO</p>
          <h2 className="mt-3 text-3xl font-bold sm:text-5xl">ひとつの体験として、つくる。</h2>
          <ul className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
            {FEATURES.map((f) => (
              <li key={f.no} className="rounded-2xl border border-slate-200 p-8 dark:border-slate-800">
                <span className="text-xs font-semibold tabular-nums text-slate-400">{f.no}</span>
                <h3 className="mt-4 text-xl font-bold">{f.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{f.body}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="h-[60vh]" />
      </section>
    </main>
  );
}


export default function App() {
  return <StickyHeroOverlap />;
}
