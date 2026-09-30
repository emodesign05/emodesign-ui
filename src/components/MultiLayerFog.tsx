/* =========================================================
 * フォグレイヤー（Multi-Layered Animated Fog）
 * - ぼかした霧の層を3枚重ね、それぞれ違う速度・方向・濃さで横に流す
 * - 速度差によって奥行き（パララックス）が生まれ、背景に空気感を足せる
 * - CSS アニメーション（@keyframes）だけで動作。JS の毎フレーム処理なし
 * - 霧は SVG の feTurbulence で生成したノイズをマスクとして使用（画像ファイル不要）
 * - prefers-reduced-motion 時は静止
 * ========================================================= */

type FogLayer = {
  /** 1周にかかる秒数（大きいほどゆっくり） */
  duration: number;
  /** 不透明度 */
  opacity: number;
  /** 縦位置（%） */
  top: string;
  /** 高さ（%） */
  height: string;
  /** 逆方向に流す */
  reverse?: boolean;
  /** ノイズの細かさ（小さいほど大きな塊） */
  frequency: number;
  seed: number;
};

const LAYERS: FogLayer[] = [
  { duration: 120, opacity: 0.35, top: '35%', height: '70%', frequency: 0.004, seed: 3 },
  { duration: 80, opacity: 0.45, top: '50%', height: '60%', reverse: true, frequency: 0.006, seed: 7 },
  { duration: 50, opacity: 0.55, top: '65%', height: '50%', frequency: 0.009, seed: 11 },
];

/** 横にタイル可能な霧テクスチャ（SVG data URI） */
function fogTexture(frequency: number, seed: number) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='600'><filter id='f' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' baseFrequency='${frequency} ${frequency * 2.2}' numOctaves='4' seed='${seed}' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.6 -0.55'/></filter><rect width='100%' height='100%' filter='url(%23f)'/></svg>`;
  return `url("data:image/svg+xml;utf8,${svg}")`;
}

export function Fog({ layers = LAYERS }: { layers?: FogLayer[] }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <style>{`
        @keyframes fog-drift { from { transform: translate3d(0,0,0); } to { transform: translate3d(-50%,0,0); } }
        @media (prefers-reduced-motion: reduce) { .fog-layer { animation: none !important; } }
      `}</style>
      {layers.map((l, i) => (
        <div
          key={i}
          className="fog-layer absolute left-0 w-[200%]"
          style={{
            top: l.top,
            height: l.height,
            opacity: l.opacity,
            backgroundImage: fogTexture(l.frequency, l.seed),
            backgroundRepeat: 'repeat-x',
            backgroundSize: '50% 100%',
            animation: `fog-drift ${l.duration}s linear infinite ${l.reverse ? 'reverse' : 'normal'}`,
            maskImage: 'linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)',
          }}
        />
      ))}
    </div>
  );
}

export default function App() {
  return (
    <main className="bg-slate-200 dark:bg-slate-950">
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-slate-300 via-slate-200 to-slate-400 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
        {/* 山の稜線（奥 → 手前） */}
        <svg aria-hidden viewBox="0 0 1440 400" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-[55%] w-full">
          <path d="M0 260 L180 150 L320 220 L520 90 L700 200 L880 120 L1080 230 L1260 140 L1440 210 V400 H0Z" className="fill-slate-400/70 dark:fill-slate-800/80" />
          <path d="M0 320 L220 230 L400 300 L620 200 L820 290 L1040 220 L1240 300 L1440 250 V400 H0Z" className="fill-slate-500/80 dark:fill-slate-900" />
          <path d="M0 370 L260 310 L520 360 L760 300 L1000 360 L1240 320 L1440 350 V400 H0Z" className="fill-slate-600 dark:fill-black" />
        </svg>

        <Fog />

        <div className="relative z-10 px-6 text-center">
          <p className="text-xs font-semibold tracking-[0.35em] text-slate-700 dark:text-slate-300">MULTI-LAYERED FOG</p>
          <h1 className="mt-4 text-5xl font-bold leading-tight text-slate-900 sm:text-7xl dark:text-white">霧の向こうへ。</h1>
          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            速さの違う3枚の霧が重なり合い、画面に奥行きと空気感を与えます。
          </p>
        </div>
      </section>
    </main>
  );
}
