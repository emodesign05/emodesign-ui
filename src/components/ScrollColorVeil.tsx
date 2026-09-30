import { useMemo, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* =========================================================
 * ナイトベール（Scroll-Driven Color Veil Overlay）
 * - スクロールに合わせて、画面全体を覆う色のベールが「朝 → 昼 → 夕暮れ → 夜」と移り変わる
 * - 夜に近づくと星が浮かび、文字色も自動で反転
 * - GSAP ScrollTrigger：背景色・文字色・ベール・星の不透明度を1本のタイムラインにまとめ、ページ全体のスクロールに scrub で同期
 * - prefers-reduced-motion 時も色の変化は保つ（位置の動きがないため）が、星のまたたきは停止
 * ========================================================= */

const STOPS = [0, 0.33, 0.66, 1];
const SKY = ['#fef3c7', '#bae6fd', '#fb923c', '#0b1026'];
const VEIL = ['rgba(251,191,36,0.15)', 'rgba(255,255,255,0)', 'rgba(190,24,93,0.25)', 'rgba(15,23,42,0.55)'];
const TEXT = ['#1c1917', '#0f172a', '#1c1917', '#e2e8f0'];

const SCENES = [
  { time: '06:00', title: 'Morning', body: 'やわらかい光が、一日のはじまりを告げる。' },
  { time: '12:00', title: 'Noon', body: '澄んだ空の下で、すべてがくっきりと見える。' },
  { time: '18:00', title: 'Dusk', body: '空が燃えるように色づき、影が長く伸びる。' },
  { time: '24:00', title: 'Night', body: '静けさの中に、星がひとつずつ灯る。' },
];

/** 再現性のある乱数で星の配置を作る */
function makeStars(count: number) {
  let s = 7;
  const rand = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  return Array.from({ length: count }, () => ({ x: rand() * 100, y: rand() * 100, size: 1 + rand() * 2, delay: rand() * 3 }));
}

export function ScrollColorVeil({ starCount = 90, twinkle = true, starFrom = 0.6 }: { starCount?: number; twinkle?: boolean; starFrom?: number }) {
  const rootRef = useRef<HTMLElement>(null);
  const stars = useMemo(() => makeStars(starCount), [starCount]);

  useGSAP(
    () => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: document.documentElement, start: 'top top', end: 'bottom bottom', scrub: 0.3 } });
      // STOPS の区間ごとに色を補間（0〜1 のタイムライン上に配置）
      for (let i = 1; i < STOPS.length; i++) {
        const at = STOPS[i - 1];
        const d = STOPS[i] - at;
        tl.to(rootRef.current, { backgroundColor: SKY[i], color: TEXT[i], duration: d, ease: 'none' }, at);
        tl.to('[data-veil]', { backgroundColor: VEIL[i], duration: d, ease: 'none' }, at);
      }
      tl.fromTo('[data-stars]', { opacity: 0 }, { opacity: 1, duration: Math.min(1, starFrom + 0.35) - starFrom, ease: 'none' }, starFrom);
    },
    { scope: rootRef, dependencies: [starFrom, starCount], revertOnUpdate: true },
  );
  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <main ref={rootRef} style={{ backgroundColor: SKY[0], color: TEXT[0] }} className="relative">
      {/* 固定ベール＋星 */}
      <div aria-hidden className="pointer-events-none fixed inset-0">
        <div data-stars className="absolute inset-0 opacity-0">
          <style>{`@keyframes veil-twinkle{0%,100%{opacity:.3}50%{opacity:1}}@media (prefers-reduced-motion: reduce){.veil-star{animation:none!important}}`}</style>
          {stars.map((st, i) => (
            <span
              key={i}
              className="veil-star absolute rounded-full bg-white"
              style={{
                left: `${st.x}%`,
                top: `${st.y}%`,
                width: st.size,
                height: st.size,
                animation: reduce || !twinkle ? undefined : `veil-twinkle ${2 + st.delay}s ease-in-out ${st.delay}s infinite`,
              }}
            />
          ))}
        </div>
        <div data-veil style={{ backgroundColor: VEIL[0] }} className="absolute inset-0 mix-blend-multiply" />
      </div>

      {SCENES.map((s) => (
        <section key={s.title} className="relative flex min-h-screen flex-col justify-center px-8 sm:px-20">
          <p className="text-xs font-semibold tabular-nums tracking-[0.35em] opacity-70">{s.time}</p>
          <h2 className="mt-3 text-6xl font-black tracking-tight sm:text-8xl">{s.title}</h2>
          <p className="mt-5 max-w-md text-sm leading-relaxed opacity-80">{s.body}</p>
        </section>
      ))}
      <h1 className="sr-only">ナイトベール：スクロールで移り変わる一日の色</h1>
    </main>
  );
}


export default function App() {
  return <ScrollColorVeil />;
}
