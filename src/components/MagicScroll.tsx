import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Battery, Camera, Cpu } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* =========================================================
 * マジックスクロール（Scroll-Pinned Storytelling / Magic Scroll）
 * - セクションを画面に固定（pin）したまま、スクロール量に合わせて「物語」が進む演出
 *   （Apple の製品ページのような、スクロールで製品が回転・移動し、説明が入れ替わる表現）
 * - GSAP ScrollTrigger の pin + scrub で、1本のタイムラインをスクロール位置に同期
 *   1. 製品（デバイス）が奥から登場 → 3D 回転しながら右へ寄る
 *   2. 画面の色・背景の円が変化し、左の説明文が章ごとに入れ替わる
 *   3. 最後にデバイスが正面を向き、見出しで締める
 * - 章はデータ（CHAPTERS）で管理。追加するとタイムラインも自動で伸びる
 * - prefers-reduced-motion 時はピン留めせず、全章を縦に並べて静的表示
 * ========================================================= */

const CHAPTERS = [
  { icon: Cpu, eyebrow: '01 — PERFORMANCE', title: '速さは、\n静けさから。', body: '新しいチップが、重い処理も音もなく片付けます。', screen: 'from-indigo-500 via-violet-500 to-fuchsia-500' },
  { icon: Camera, eyebrow: '02 — CAMERA', title: '光を、\nそのまま残す。', body: '暗い場所でも、見たままの色で写します。', screen: 'from-amber-300 via-orange-400 to-rose-500' },
  { icon: Battery, eyebrow: '03 — BATTERY', title: '一日を、\n最後まで。', body: '朝から夜まで、充電を気にせず使えます。', screen: 'from-emerald-300 via-teal-400 to-cyan-500' },
];

type MagicScrollProps = {
  /** スクロールへの追従の遅れ（秒）。0 で密着 */
  scrub?: number;
  /** 1章あたりのスクロール量（vh） */
  chapterLength?: number;
  /** デバイスの最大回転角（度） */
  rotate?: number;
  /** 背景の変化（暗 → 明）を使うか */
  bgShift?: boolean;
};

export function MagicScroll({ scrub = 0.8, chapterLength = 120, rotate = 28, bgShift = true }: MagicScrollProps) {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const chapters = gsap.utils.toArray<HTMLElement>('[data-chapter]');
        const screens = gsap.utils.toArray<HTMLElement>('[data-screen]');
        const total = (window.innerHeight * chapterLength * (chapters.length + 1)) / 100;

        const tl = gsap.timeline({
          defaults: { ease: 'power2.inOut' },
          scrollTrigger: { trigger: '[data-stage]', start: 'top top', end: `+=${total}`, pin: true, scrub: scrub || true },
        });

        // イントロ：大きな見出しが退場し、デバイスが奥から登場
        tl.to('[data-intro]', { autoAlpha: 0, scale: 0.9, duration: 0.6 }, 0)
          .fromTo('[data-device]', { scale: 0.5, y: () => window.innerHeight * 0.3, rotateX: 50, autoAlpha: 0 }, { scale: 1, y: 0, rotateX: 0, autoAlpha: 1, duration: 1 }, 0.2);
        if (bgShift) tl.to('[data-bg]', { backgroundColor: '#f8fafc', duration: 1 }, 0.4).to('[data-intro-text]', { color: '#0f172a', duration: 1 }, 0.4);
        // 背景が暗いままなら文字を白に
        else gsap.set(['[data-chapter] h2', '[data-outro] p'], { color: '#ffffff' });

        // 各章：デバイスが左右に振れながら回転、画面の色と説明文が入れ替わる
        chapters.forEach((ch, i) => {
          const at = 1.2 + i * 1.4;
          const side = i % 2 === 0 ? 1 : -1;
          tl.to('[data-device]', { xPercent: 45 * side, rotateY: -rotate * side, rotateZ: 4 * side, duration: 1 }, at)
            .to('[data-orb]', { scale: 1 + i * 0.35, xPercent: -30 * side, duration: 1 }, at)
            .fromTo(ch, { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, duration: 0.5 }, at + 0.2)
            .to(screens[i], { autoAlpha: 1, duration: 0.4 }, at + 0.1);
          if (i < chapters.length - 1) tl.to(ch, { autoAlpha: 0, y: -60, duration: 0.4 }, at + 1.1);
          // 章ごとの左右の配置（奇数章は右に説明文）
          gsap.set(ch, { left: side > 0 ? '6%' : 'auto', right: side > 0 ? 'auto' : '6%' });
        });

        // フィナーレ：正面を向いて中央に戻る
        const end = 1.2 + chapters.length * 1.4;
        tl.to(chapters[chapters.length - 1], { autoAlpha: 0, duration: 0.4 }, end)
          .to('[data-device]', { xPercent: 0, rotateY: 0, rotateZ: 0, scale: 0.75, y: () => window.innerHeight * 0.06, duration: 1 }, end)
          .fromTo('[data-outro]', { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.6 }, end + 0.4);
      });
    },
    { scope: rootRef, dependencies: [scrub, chapterLength, rotate, bgShift], revertOnUpdate: true },
  );

  return (
    <main ref={rootRef}>
      <section data-stage data-bg className="relative h-screen overflow-hidden bg-slate-950 [perspective:1400px] motion-reduce:h-auto">
        {/* 背景の光の円 */}
        <div data-orb aria-hidden className="absolute left-1/2 top-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-indigo-400/40 to-fuchsia-400/30 blur-3xl" />

        {/* イントロ見出し */}
        <div data-intro className="absolute inset-x-0 top-[12vh] z-10 px-6 text-center motion-reduce:relative motion-reduce:top-0 motion-reduce:py-24">
          <p className="text-xs font-semibold tracking-[0.4em] text-indigo-400">MAGIC SCROLL</p>
          <h1 data-intro-text className="mt-4 text-5xl font-black tracking-tight text-white sm:text-7xl">
            スクロールで、物語が進む。
          </h1>
        </div>

        {/* デバイス（製品） */}
        <div className="absolute inset-0 flex items-center justify-center [transform-style:preserve-3d] motion-reduce:relative motion-reduce:py-10">
          <div
            data-device
            className="relative aspect-[9/19] h-[62vh] rounded-[2.6rem] border-[10px] border-slate-900 bg-slate-900 shadow-[0_40px_120px_-20px_rgba(15,23,42,0.6)] [transform-style:preserve-3d] will-change-transform"
          >
            <div className="absolute inset-0 overflow-hidden rounded-[2rem] bg-slate-800">
              {CHAPTERS.map((c, i) => (
                <div key={c.eyebrow} data-screen className={`absolute inset-0 bg-gradient-to-br ${c.screen} ${i === 0 ? '' : 'opacity-0'}`}>
                  <c.icon className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 text-white/90" aria-hidden />
                </div>
              ))}
              <div className="absolute left-1/2 top-3 h-6 w-24 -translate-x-1/2 rounded-full bg-slate-950" aria-hidden />
            </div>
          </div>
        </div>

        {/* 章ごとの説明文 */}
        {CHAPTERS.map((c) => (
          <div
            key={c.eyebrow}
            data-chapter
            className="invisible absolute top-1/2 z-10 w-[min(420px,40vw)] -translate-y-1/2 motion-reduce:visible motion-reduce:relative motion-reduce:top-0 motion-reduce:mx-auto motion-reduce:w-auto motion-reduce:translate-y-0 motion-reduce:px-6 motion-reduce:py-12"
          >
            <p className="text-xs font-semibold tracking-[0.3em] text-indigo-500">{c.eyebrow}</p>
            <h2 className="mt-3 whitespace-pre-line text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">{c.title}</h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">{c.body}</p>
          </div>
        ))}

        {/* フィナーレ */}
        <div data-outro className="invisible absolute inset-x-0 top-[9vh] z-10 text-center motion-reduce:visible motion-reduce:relative motion-reduce:py-16">
          <p className="text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">すべてを、ひとつに。</p>
        </div>
      </section>
      <section className="flex h-[70vh] items-center justify-center bg-slate-50 px-6 text-center text-sm text-slate-500">
        ピン留めが解除され、通常のスクロールに戻ります。
      </section>
    </main>
  );
}

export default function App() {
  return <MagicScroll />;
}
