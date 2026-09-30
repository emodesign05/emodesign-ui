import { useId, useState } from 'react';

/* =========================================================
 * フィルムグレイン（SVG Film Grain Overlay）
 * - SVG の feTurbulence で生成したノイズを画面全体に重ね、フィルム写真のような粒子感を出す
 * - 背景位置を steps() で小刻みにずらし、ザラつきが“動いて見える”アニメーション
 *   （移動量は画面からはみ出している範囲内に収め、端にすき間ができてチカチカしないようにしている）
 * - pointer-events: none なので下の要素の操作を邪魔しない
 * - 画像ファイル不要（data URI） / 強さ・粒の細かさ・動きのON/OFFを調整可能
 * - prefers-reduced-motion 時は静止したグレイン
 * ========================================================= */

type GrainProps = {
  /** 不透明度（0〜1） */
  opacity?: number;
  /** 粒の細かさ（0.5〜1.2）。大きいほど細かい */
  frequency?: number;
  /** 動かす */
  animated?: boolean;
  /** 重ね方 */
  blend?: 'overlay' | 'soft-light' | 'multiply' | 'normal';
};

function grainTexture(frequency: number) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='${frequency}' numOctaves='3' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>`;
  return `url("data:image/svg+xml;utf8,${svg}")`;
}

export function FilmGrain({ opacity = 0.18, frequency = 0.85, animated = true, blend = 'overlay' }: GrainProps) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
      <style>{`
        /* 移動量は ±10%（要素は画面の2倍の大きさ＝上下左右に50%ずつはみ出している）
           → どのコマでも画面の端が必ず覆われ、上部などに“すき間”が出てチカチカ光ることがない */
        @keyframes grain-${id} {
          0%,100% { transform: translate(0,0) } 10% { transform: translate(-4%,-8%) } 20% { transform: translate(-9%,3%) }
          30% { transform: translate(5%,-10%) } 40% { transform: translate(-3%,9%) } 50% { transform: translate(-9%,6%) }
          60% { transform: translate(8%,0) } 70% { transform: translate(0,8%) } 80% { transform: translate(2%,10%) } 90% { transform: translate(-6%,5%) }
        }
        @media (prefers-reduced-motion: reduce) { .grain-${id} { animation: none !important; } }
      `}</style>
      <div
        className={`grain-${id} absolute -inset-[50%]`}
        style={{
          backgroundImage: grainTexture(frequency),
          opacity,
          mixBlendMode: blend,
          animation: animated ? `grain-${id} 0.8s steps(8) infinite` : 'none',
        }}
      />
    </div>
  );
}

export default function App() {
  const [on, setOn] = useState(true);
  const [opacity, setOpacity] = useState(0.18);
  const [animated, setAnimated] = useState(true);

  return (
    <main className="relative min-h-screen bg-stone-900 text-stone-100">
      <img
        src="https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=2000&q=80"
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-80"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/30 to-transparent" />

      {on && <FilmGrain opacity={opacity} animated={animated} blend="overlay" />}

      <section className="relative flex min-h-screen flex-col justify-end px-8 pb-16 sm:px-16">
        <p className="text-xs font-semibold tracking-[0.35em] text-amber-200/80">FILM GRAIN</p>
        <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-tight sm:text-7xl">フィルムの、温度。</h1>

        <form className="mt-10 flex flex-wrap items-center gap-6 rounded-2xl border border-white/15 bg-black/40 p-5 text-sm backdrop-blur" onSubmit={(e) => e.preventDefault()}>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={on} onChange={(e) => setOn(e.target.checked)} className="h-4 w-4 accent-amber-400" />
            グレイン
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={animated} onChange={(e) => setAnimated(e.target.checked)} className="h-4 w-4 accent-amber-400" />
            動かす
          </label>
          <label className="flex items-center gap-3">
            強さ
            <input type="range" min={0.05} max={0.5} step={0.01} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} className="w-40 accent-amber-400" />
            <span className="w-10 tabular-nums text-stone-300">{opacity.toFixed(2)}</span>
          </label>
        </form>
      </section>
    </main>
  );
}
