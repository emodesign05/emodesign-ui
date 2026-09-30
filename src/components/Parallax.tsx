import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Sparkles, ArrowRight, MousePointer } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

// ==========================================
// 1. GSAP ScrollTrigger による慣性付きパララックス
//    - scrub に秒数を渡すと、スクロール位置に「その秒数かけて追いつく」＝スクロール速度に左右されない一定の慣性になる
//    - prefers-reduced-motion 時は背景を動かさず、文字も常に表示
// ==========================================
interface ParallaxSectionInertiaFixedProps {
  /** 追従の遅れ（秒）。0 で密着、大きいほどゆったり */
  scrub?: number;
  shift?: number;
  imageOpacity?: number;
  height?: number;
  imageSrc?: string;
  title?: string;
  subtitle?: string;
  description?: string;
}

export const ParallaxSectionInertiaFixed: React.FC<ParallaxSectionInertiaFixedProps> = ({
  imageSrc = 'https://images.unsplash.com/photo-1780442466306-1cf3f14261d1?q=80&w=2532&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  subtitle = 'STABLE INERTIA PARALLAX',
  title = 'スクロール量に左右されない、常に均一で滑らかな慣性表現',
  description = 'GSAP ScrollTrigger の scrub（秒数指定）で、どんなスクロールスピードでも一定の心地よい追従感を実現します。',
  scrub = 1,
  shift = 12.5,
  imageOpacity = 0.5,
  height = 85,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const st = { trigger: containerRef.current, start: 'top bottom', end: 'bottom top', scrub: scrub || true };
        // 背景：セクションが画面に入ってから出るまでに -shift*0.8% → +shift*1.2% 移動
        gsap.fromTo('[data-bg]', { yPercent: -shift * 0.8 }, { yPercent: shift * 1.2, ease: 'none', scrollTrigger: st });
        // 文字：中央付近で最もはっきり（フェードイン → 保持 → フェードアウト）
        gsap
          .timeline({ scrollTrigger: st })
          .fromTo('[data-text]', { autoAlpha: 0, scale: 0.95 }, { autoAlpha: 1, scale: 1, ease: 'power1.out', duration: 0.3 }, 0.2)
          .to('[data-text]', { autoAlpha: 0, scale: 0.95, ease: 'power1.in', duration: 0.3 }, 0.5)
          .set({}, {}, 1); // タイムライン全体の長さを 1 に揃える
      });
    },
    { scope: containerRef, dependencies: [scrub, shift, height], revertOnUpdate: true },
  );

  return (
    <div
      ref={containerRef}
      style={{ height: `${height}vh` }}
      className="relative w-full min-h-[600px] overflow-hidden bg-slate-950 flex items-center justify-center"
    >
      {/* A. 安定慣性付き背景レイヤー */}
      <div data-bg className="absolute inset-0 w-full h-[130%] -top-[15%] pointer-events-none will-change-transform">
        {/* 背景画像 */}
        <img
          src={imageSrc}
          alt="Parallax Background"
          style={{ opacity: imageOpacity }}
          className="w-full h-full object-cover"
        />
        {/* オーバーレイフィルター */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/40 to-slate-950" />
        
        {/* 演出用オーブ */}
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[130px]" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[130px]" />
      </div>

      {/* B. 前面コンテンツレイヤー */}
      <div
        data-text
        className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-6"
      >
        {/* サブタイトルタグ */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{subtitle}</span>
        </div>

        {/* メインタイトル */}
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
          {title}
        </h2>

        {/* 説明文 */}
        <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-normal">
          {description}
        </p>

        {/* CTAボタン */}
        <div className="pt-4 flex items-center justify-center gap-4">
          <button className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all duration-200 flex items-center gap-2 cursor-pointer active:scale-95">
            <span>詳細を見る</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* C. スクロール指示マーク */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-slate-500 text-xs z-10">
        <MousePointer className="w-4 h-4 animate-bounce text-indigo-400" />
        <span>Scroll Down</span>
      </div>
    </div>
  );
};

// ==========================================
// 2. 動作確認用メインアプリケーション
// ==========================================
export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      
      {/* 上部ダミーエリア */}
      <section className="h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-3 bg-slate-900 border-b border-slate-800">
        <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Section 01</span>
        <h1 className="text-2xl font-bold text-white">下にスクロールして一定感のある慣性を確認</h1>
        <p className="text-slate-400 text-sm">↓ スクロールしてください</p>
      </section>

      {/* 修正版パララックスセクション本体 */}
      <ParallaxSectionInertiaFixed />

      {/* 下部ダミーエリア */}
      <section className="h-[80vh] flex flex-col items-center justify-center p-6 text-center space-y-3 bg-slate-900 border-t border-slate-800">
        <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Section 03</span>
        <h2 className="text-2xl font-bold text-white">安定したスクロール体験</h2>
        <p className="text-slate-400 text-sm max-w-md">
          スクロール速度に関わらず、均一で心地よい視差効果が維持されます。
        </p>
      </section>

    </div>
  );
}