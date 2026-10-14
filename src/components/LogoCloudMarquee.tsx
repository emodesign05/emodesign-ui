import { useRef } from 'react';
import type { ReactNode } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

/* =========================================================
 * ロゴクラウド（Logo Cloud Marquee：導入企業ロゴの無限ループ）
 * - 架空の企業ロゴ（SVG のワードマーク＋簡単な図形。実在ブランドではない）を横に無限ループで流す
 * - 仕組み：ロゴ列を 2 回並べたトラックを GSAP で xPercent: 0 → -50 にリピート。
 *   半分進んだ瞬間に先頭へ戻るので継ぎ目が見えない。速度は「px / 秒」で指定し、トラック幅から duration を計算
 *   （ResizeObserver で幅が変わったら duration だけ更新するので、位置は飛ばない）
 * - 両端は mask-image の線形グラデーションでフェード（背景色に依存しない）
 * - ホバーで一時停止：timeScale を 0 へトゥイーンして「スーッと減速して止まる」。離れると再加速
 * - dualRow で 2 段にし、2 段目は逆方向に流す
 * - ロゴは currentColor で単色描画。ホバーしたロゴだけ不透明度を上げる
 * - prefers-reduced-motion 時は流さず、ロゴを折り返し配置で静的に並べる
 * - スクリーンリーダーには 1 セット分だけをリストとして読ませ、複製分は aria-hidden
 * ========================================================= */

type Props = {
  /** 流れる速度（px / 秒） */
  speed?: number;
  /** 2 段にして、2 段目を逆方向に流す */
  dualRow?: boolean;
  /** ホバー（フォーカス）で一時停止する */
  pauseOnHover?: boolean;
  /** 両端のフェード幅（%） */
  fadeWidth?: number;
  /** ロゴ同士の間隔（px） */
  gap?: number;
  /** 流れる向き（1 段目） */
  direction?: 'left' | 'right';
};

type Logo = { name: string; mark: ReactNode; w: number };

/* ---- 架空ロゴ（すべて自作の図形＋ワードマーク） ---- */
const word = (x: number, text: string, weight = 700, spacing = 0) => (
  <text x={x} y="27" fontSize="20" fontWeight={weight} letterSpacing={spacing} fontFamily="ui-sans-serif, system-ui, sans-serif" fill="currentColor">
    {text}
  </text>
);

const LOGOS: Logo[] = [
  { name: 'Sorafune', w: 151, mark: (<><path d="M4 26 Q18 6 32 26 Z" fill="currentColor" /><path d="M2 30h32" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />{word(42, 'Sorafune')}</>) },
  { name: 'Kiriha', w: 119, mark: (<><polygon points="18,4 32,30 4,30" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round" />{word(42, 'kiriha', 600, 1)}</>) },
  { name: 'Velmora', w: 131, mark: (<><circle cx="12" cy="18" r="9" fill="currentColor" /><circle cx="24" cy="18" r="9" fill="none" stroke="currentColor" strokeWidth="3" />{word(42, 'Velmora', 500)}</>) },
  { name: 'HEXALD', w: 151, mark: (<><polygon points="18,3 31,10.5 31,25.5 18,33 5,25.5 5,10.5" fill="currentColor" /><polygon points="18,11 24,14.5 24,21.5 18,25 12,21.5 12,14.5" fill="white" className="dark:fill-slate-950" />{word(42, 'HEXALD', 800, 2)}</>) },
  { name: 'Ondaku', w: 139, mark: (<><path d="M2 20 q6-10 12 0 t12 0 t12 0" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />{word(46, 'Ondaku', 600)}</>) },
  { name: 'Mirelo', w: 118, mark: (<><rect x="4" y="5" width="26" height="26" rx="7" fill="currentColor" /><path d="M11 24 L23 12" stroke="white" strokeWidth="3.5" strokeLinecap="round" className="dark:stroke-slate-950" />{word(40, 'mirelo', 700)}</>) },
  { name: 'Hoshizu', w: 141, mark: (<><path d="M18 3 L21.5 14.5 L33 18 L21.5 21.5 L18 33 L14.5 21.5 L3 18 L14.5 14.5 Z" fill="currentColor" />{word(42, 'Hoshizu', 600, 0.5)}</>) },
  { name: 'ZENTORA', w: 166, mark: (<><circle cx="18" cy="18" r="13" fill="none" stroke="currentColor" strokeWidth="3" /><circle cx="18" cy="18" r="5" fill="currentColor" />{word(42, 'ZENTORA', 300, 3)}</>) },
  { name: 'Tessaly', w: 130, mark: (<><rect x="4" y="4" width="12" height="12" fill="currentColor" /><rect x="20" y="4" width="12" height="12" fill="currentColor" opacity=".5" /><rect x="4" y="20" width="12" height="12" fill="currentColor" opacity=".5" /><rect x="20" y="20" width="12" height="12" fill="currentColor" />{word(42, 'Tessaly', 700)}</>) },
  { name: 'Arcwyn', w: 131, mark: (<><path d="M4 30 A14 14 0 0 1 32 30" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" /><path d="M11 30 A7 7 0 0 1 25 30" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />{word(42, 'Arcwyn', 600)}</>) },
];

function LogoItem({ logo }: { logo: Logo }) {
  return (
    <svg
      viewBox={`0 0 ${logo.w} 36`}
      height="36"
      width={logo.w}
      role="img"
      aria-label={`${logo.name}（架空の企業）`}
      className="h-7 w-auto shrink-0 sm:h-9"
    >
      {logo.mark}
    </svg>
  );
}

function Row({ logos, reverse, speed, gap, pauseOnHover, fade }: { logos: Logo[]; reverse: boolean; speed: number; gap: number; pauseOnHover: boolean; fade: number }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const track = trackRef.current;
      const root = rootRef.current;
      if (!track || !root) return;
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const durationFor = () => Math.max(1, track.scrollWidth / 2 / Math.max(1, speed));
        const tween = gsap.fromTo(
          track,
          { xPercent: reverse ? -50 : 0 },
          { xPercent: reverse ? 0 : -50, duration: durationFor(), ease: 'none', repeat: -1 },
        );
        const ro = new ResizeObserver(() => {
          const p = tween.progress();
          tween.duration(durationFor()).progress(p);
        });
        ro.observe(track);

        const slow = () => pauseOnHover && gsap.to(tween, { timeScale: 0, duration: 0.6, ease: 'power2.out', overwrite: true });
        const resume = () => gsap.to(tween, { timeScale: 1, duration: 0.8, ease: 'power2.in', overwrite: true });
        root.addEventListener('pointerenter', slow);
        root.addEventListener('pointerleave', resume);
        return () => {
          ro.disconnect();
          root.removeEventListener('pointerenter', slow);
          root.removeEventListener('pointerleave', resume);
        };
      });
      return () => mm.revert();
    },
    { scope: rootRef, dependencies: [speed, reverse, pauseOnHover, gap], revertOnUpdate: true },
  );

  const mask = `linear-gradient(to right, transparent, #000 ${fade}%, #000 ${100 - fade}%, transparent)`;
  // 1 セットで画面幅を超えるよう、ロゴを 2 周分並べたものを 1 セットとする
  const set = [...logos, ...logos];

  return (
    <div ref={rootRef} className="relative overflow-hidden py-3" style={{ maskImage: mask, WebkitMaskImage: mask }}>
      {/* reduced-motion：静的な折り返し配置 */}
      <ul className="hidden flex-wrap items-center justify-center gap-y-6 px-4 motion-reduce:flex" style={{ columnGap: gap }} aria-label="導入企業">
        {logos.map((l) => (
          <li key={l.name} className="text-slate-500 dark:text-slate-400">
            <LogoItem logo={l} />
          </li>
        ))}
      </ul>
      <div ref={trackRef} data-track className="flex w-max motion-reduce:hidden">
        {[0, 1].map((copy) => (
          <ul
            key={copy}
            aria-hidden={copy === 1 ? true : undefined}
            aria-label={copy === 0 ? '導入企業' : undefined}
            className="flex shrink-0 items-center"
            style={{ gap, paddingRight: gap }}
          >
            {set.map((l, i) => (
              <li
                key={`${l.name}-${i}`}
                aria-hidden={copy === 1 || i >= logos.length ? true : undefined}
                className="text-slate-400 transition-[color,opacity] duration-300 hover:text-slate-900 dark:text-slate-500 dark:hover:text-white"
              >
                <LogoItem logo={l} />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}

export function LogoCloudMarquee({
  speed = 40,
  dualRow = true,
  pauseOnHover = true,
  fadeWidth = 12,
  gap = 56,
  direction = 'left',
}: Props) {
  const reverse = direction === 'right';
  const half = Math.ceil(LOGOS.length / 2);
  const rowB = [...LOGOS.slice(half), ...LOGOS.slice(0, half)];
  return (
    <div className="w-full">
      <Row logos={LOGOS} reverse={reverse} speed={speed} gap={gap} pauseOnHover={pauseOnHover} fade={fadeWidth} />
      {dualRow && <Row logos={rowB} reverse={!reverse} speed={speed * 0.85} gap={gap} pauseOnHover={pauseOnHover} fade={fadeWidth} />}
    </div>
  );
}

export default function App() {
  return (
    <main className="flex min-h-screen flex-col justify-center bg-white py-20 text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto mb-12 max-w-3xl px-4 text-center">
        <p className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          導入実績 1,200 社以上（※ロゴはすべて架空です）
        </p>
        <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-5xl">業界をリードするチームが、選んでいます。</h1>
        <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-400">
          ロゴにカーソルを合わせると、流れがゆっくり止まります。
        </p>
      </div>
      <LogoCloudMarquee />
      <div className="mx-auto mt-14 grid max-w-3xl grid-cols-3 gap-4 px-4 text-center">
        {[
          ['98%', '継続率'],
          ['4.9', '満足度'],
          ['24h', 'サポート'],
        ].map(([n, l]) => (
          <div key={l}>
            <p className="text-2xl font-bold tracking-tight sm:text-4xl">{n}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{l}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
