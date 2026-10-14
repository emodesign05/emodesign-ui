import { useId, useMemo, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ArrowRight, Droplets, Leaf, Moon } from 'lucide-react';

gsap.registerPlugin(useGSAP);

/* =========================================================
 * SVG ブロブモーフィング（SVG Blob Morph）
 * - 有機的な形の SVG パスが、止まらずになめらかに変形し続ける。背景やアイコンの下敷き装飾に
 * - 仕組み（自作の補間・プラグイン不要）：
 *   1. 円周上に complexity 個の点を等間隔に置き、各点の半径を「周期の違う sin 波 2 本の和」で時間変化させる
 *      → 点の数は常に同じなので、どの瞬間の形同士もきれいにつながり、途切れのないモーフィングになる
 *   2. 点列を Catmull-Rom スプライン → 3 次ベジェ（C コマンド）に変換して、角のない閉じた曲線にする
 *   3. gsap.ticker で毎フレーム d 属性を書き換え、ブロブ全体もゆっくり回転、グラデーションの向きも回す
 *   ※ 決まった 2 つの形の間を変形させたい場合は GSAP の MorphSVGPlugin（gsap 3.15 に同梱・無料）でも可：
 *      gsap.registerPlugin(MorphSVGPlugin); gsap.to('#a', { morphSVG: '#b', duration: 2, repeat: -1, yoyo: true })
 * - layers 枚のブロブを少しずつ大きさ・位相をずらして重ね、半透明で奥行きを出す
 * - 画面外にある間・タブが非表示の間は計算を止める（IntersectionObserver）
 * - 装飾なので SVG は aria-hidden
 * - prefers-reduced-motion: reduce のときは最初の形のまま静止
 * ========================================================= */

type Props = {
  /** 変形の速さ（1 = 標準） */
  speed?: number;
  /** 形の複雑さ（輪郭の点の数, 3〜12） */
  complexity?: number;
  /** ゆらぎの大きさ（0〜0.4。半径に対する割合） */
  wobble?: number;
  /** グラデーションの開始色 */
  colorFrom?: string;
  /** グラデーションの終了色 */
  colorTo?: string;
  /** 重ねるブロブの数（1〜4） */
  layers?: number;
  /** ぼかし（px）。背景に敷くときは大きめに */
  blur?: number;
  /** SVG のクラス（サイズ・配置） */
  className?: string;
};

// シード付き乱数（毎回同じ形から始まるように）
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Wave = { f1: number; p1: number; f2: number; p2: number };
type Layer = { waves: Wave[]; r: number; cx: number; cy: number; spin: number; opacity: number };

function makeLayers(count: number, n: number): Layer[] {
  return Array.from({ length: count }, (_, i) => {
    const rand = rng(1000 + i * 97 + n * 13);
    return {
      waves: Array.from({ length: n }, () => ({
        f1: 0.35 + rand() * 0.5,
        p1: rand() * Math.PI * 2,
        f2: 0.7 + rand() * 0.9,
        p2: rand() * Math.PI * 2,
      })),
      r: 78 - i * 12,
      cx: 100 + (rand() - 0.5) * 14 * i,
      cy: 100 + (rand() - 0.5) * 14 * i,
      spin: (i % 2 === 0 ? 1 : -1) * (4 + rand() * 6),
      opacity: count === 1 ? 1 : 0.9 - i * 0.15,
    };
  });
}

/** t 秒時点のブロブのパス（Catmull-Rom → ベジェ） */
function blobPath(layer: Layer, t: number, wobble: number) {
  const n = layer.waves.length;
  // ゆらぎが大きくても viewBox からはみ出さないよう、基準半径を縮める
  const r = (layer.r * 1.18) / (1 + wobble);
  const pts = layer.waves.map((w, i) => {
    const a = (i / n) * Math.PI * 2;
    const k = 1 + wobble * (0.6 * Math.sin(t * w.f1 + w.p1) + 0.4 * Math.sin(t * w.f2 + w.p2));
    return [layer.cx + Math.cos(a) * r * k, layer.cy + Math.sin(a) * r * k];
  });
  const at = (i: number) => pts[(i + n) % n];
  let d = `M${at(0)[0].toFixed(2)},${at(0)[1].toFixed(2)}`;
  for (let i = 0; i < n; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += `C${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${p2[0].toFixed(2)},${p2[1].toFixed(2)}`;
  }
  return `${d}Z`;
}

export function BlobMorph({
  speed = 1,
  complexity = 7,
  wobble = 0.18,
  colorFrom = '#6366f1',
  colorTo = '#ec4899',
  layers = 3,
  blur = 0,
  className = 'h-full w-full',
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const uid = useId().replace(/:/g, '');
  const n = Math.round(Math.min(12, Math.max(3, complexity)));
  const count = Math.round(Math.min(4, Math.max(1, layers)));
  const data = useMemo(() => makeLayers(count, n), [count, n]);
  const initial = useMemo(() => data.map((l) => blobPath(l, 0, wobble)), [data, wobble]);

  useGSAP(
    () => {
      const svg = svgRef.current;
      if (!svg || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const paths = Array.from(svg.querySelectorAll<SVGPathElement>('[data-blob]'));
      const groups = Array.from(svg.querySelectorAll<SVGGElement>('[data-blob-g]'));
      const grads = Array.from(svg.querySelectorAll<SVGLinearGradientElement>('[data-blob-grad]'));
      let visible = true;
      let time = 0;

      const tick = (_: number, deltaMs: number) => {
        if (!visible || document.hidden) return;
        time += (Math.min(deltaMs, 50) / 1000) * speed;
        data.forEach((l, i) => {
          paths[i]?.setAttribute('d', blobPath(l, time, wobble));
          groups[i]?.setAttribute('transform', `rotate(${(time * l.spin) % 360} 100 100)`);
          grads[i]?.setAttribute('gradientTransform', `rotate(${(time * 12 + i * 60) % 360} 0.5 0.5)`);
        });
      };
      gsap.ticker.add(tick);

      const io = new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
      });
      io.observe(svg);
      return () => {
        gsap.ticker.remove(tick);
        io.disconnect();
      };
    },
    { scope: svgRef, dependencies: [data, speed, wobble], revertOnUpdate: true },
  );

  return (
    <svg ref={svgRef} viewBox="0 0 200 200" aria-hidden overflow="visible" className={className} style={blur ? { filter: `blur(${blur}px)` } : undefined}>
      <defs>
        {data.map((_, i) => (
          <linearGradient key={i} id={`${uid}-g${i}`} data-blob-grad x1="0" y1="0" x2="1" y2="1" gradientTransform={`rotate(${i * 60} 0.5 0.5)`}>
            <stop offset="0%" stopColor={i % 2 === 0 ? colorFrom : colorTo} />
            <stop offset="100%" stopColor={i % 2 === 0 ? colorTo : colorFrom} />
          </linearGradient>
        ))}
      </defs>
      {data.map((l, i) => (
        <g key={i} data-blob-g>
          <path data-blob d={initial[i]} fill={`url(#${uid}-g${i})`} opacity={l.opacity} />
        </g>
      ))}
    </svg>
  );
}

const FEATURES = [
  { icon: Droplets, title: '水分を記録', body: '一日の水分量をワンタップで。', from: '#38bdf8', to: '#6366f1' },
  { icon: Leaf, title: '呼吸のガイド', body: '形の動きに合わせて深呼吸。', from: '#34d399', to: '#14b8a6' },
  { icon: Moon, title: '眠りを整える', body: '就寝前のルーティンを提案。', from: '#a78bfa', to: '#ec4899' },
];

export default function App() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fbf8ff] text-slate-900 dark:bg-[#0b0814] dark:text-white">
      {/* 背景の大きなブロブ */}
      <div aria-hidden className="pointer-events-none absolute -right-[20%] -top-[15%] w-[90vw] max-w-[900px] opacity-80 sm:-right-[10%]">
        <BlobMorph blur={30} speed={0.6} complexity={6} wobble={0.2} />
      </div>
      <div aria-hidden className="pointer-events-none absolute -bottom-[25%] -left-[25%] w-[70vw] max-w-[640px] opacity-60">
        <BlobMorph blur={40} speed={0.5} colorFrom="#22d3ee" colorTo="#a78bfa" layers={2} />
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-white/30 backdrop-blur-3xl dark:bg-black/30" />

      <section className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-5 py-20 sm:px-10">
        <p className="font-mono text-xs tracking-[0.35em] text-indigo-600 dark:text-indigo-300">FLUO — WELLNESS APP</p>
        <h1 className="mt-5 max-w-3xl text-5xl font-black leading-[1.05] tracking-tight sm:text-7xl">
          ゆらぐ形に、
          <br />
          呼吸をあわせて。
        </h1>
        <p className="mt-6 max-w-lg text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          背景の形は止まることなく、ゆっくりと別の形へ変わり続けます。アイコンの下敷きにも小さく使えます。
        </p>
        <a
          href="#start"
          onClick={(e) => e.preventDefault()}
          className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 dark:bg-white dark:text-slate-900"
        >
          無料ではじめる
          <ArrowRight className="h-4 w-4" aria-hidden />
        </a>

        <ul className="mt-16 grid gap-4 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body, from, to }) => (
            <li key={title} className="flex items-center gap-4 rounded-3xl bg-white/70 p-5 ring-1 ring-slate-900/5 backdrop-blur dark:bg-white/5 dark:ring-white/10">
              <span className="relative flex h-16 w-16 shrink-0 items-center justify-center">
                <BlobMorph className="absolute inset-0 h-full w-full" colorFrom={from} colorTo={to} layers={2} complexity={5} speed={1.4} wobble={0.22} />
                <Icon className="relative h-6 w-6 text-white" aria-hidden />
              </span>
              <span>
                <span className="block font-bold">{title}</span>
                <span className="mt-1 block text-sm text-slate-600 dark:text-slate-400">{body}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
