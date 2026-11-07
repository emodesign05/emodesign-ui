import { useEffect, useMemo, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

/* =========================================================
 * 速度連動WebGLギャラリー（Scroll Velocity WebGL Gallery）
 * - スクロールの速さに合わせて画像が弓なりに曲がり、波打ち、RGB がずれる。止まるとスッと元に戻る
 * - 仕組み：DOM に「場所取り用の箱」を並べ、画面に固定した Canvas の板（plane）を毎フレームその箱の位置・大きさに合わせる
 *   → レイアウトは普通の CSS グリッドのまま、見た目だけ WebGL にできる（レスポンシブもそのまま効く）
 * - 正射影カメラ（orthographic）で 1 単位 = 1px。板の変形は頂点シェーダーでワールド座標（px）のまま行う
 * - 速度：毎フレームの scrollY の差分 → なめらかに追従させた値を uniform（uVelocity）に渡す
 * - Lenis（慣性スクロール）で DOM と WebGL のズレを防ぐ（smoothScroll=false でネイティブスクロール）
 * - セクションが画面外のときは描画を止める（IntersectionObserver で frameloop を切り替え）
 * - 画像の読み込み中・読み込めない時は Canvas で描いた代わりの模様を表示
 * - prefers-reduced-motion 時は変形させない（普通の画像として表示）
 * ========================================================= */

type Item = { title: string; meta: string; src: string; colors: [string, string] };

const ITEMS: Item[] = [
  { title: 'Morning Ridge', meta: 'Landscape / 2026', src: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1000&q=80', colors: ['#4f46e5', '#22d3ee'] },
  { title: 'Quiet Forest', meta: 'Nature / 2026', src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1000&q=80', colors: ['#059669', '#a3e635'] },
  { title: 'Night Summit', meta: 'Mountain / 2025', src: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1000&q=80', colors: ['#1e1b4b', '#818cf8'] },
  { title: 'Golden Field', meta: 'Landscape / 2025', src: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1000&q=80', colors: ['#d97706', '#fde047'] },
  { title: 'Concrete Lines', meta: 'Architecture / 2025', src: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1000&q=80', colors: ['#475569', '#e2e8f0'] },
  { title: 'Lake Mirror', meta: 'Nature / 2024', src: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1000&q=80', colors: ['#0e7490', '#67e8f9'] },
  { title: 'Valley Light', meta: 'Landscape / 2024', src: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1000&q=80', colors: ['#be185d', '#f9a8d4'] },
  { title: 'Hillside', meta: 'Landscape / 2024', src: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1000&q=80', colors: ['#15803d', '#fef08a'] },
];

const vertex = /* glsl */ `
  uniform float uVelocity;
  uniform float uBend;
  uniform float uWave;
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec4 world = modelMatrix * vec4(position, 1.0);
    // 弓なり：板の中央ほどスクロール方向と逆に遅れる（px 単位）
    world.y -= sin(uv.x * 3.14159265) * uVelocity * uBend;
    // 波：縦方向に横揺れ（速いほど大きい）
    world.x += sin(uv.y * 6.2831853 + uTime * 3.0) * abs(uVelocity) * uWave;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const fragment = /* glsl */ `
  uniform sampler2D uTexture;
  uniform vec2 uCover;
  uniform vec2 uSize;
  uniform float uRadius;
  uniform float uVelocity;
  uniform float uRgbShift;
  varying vec2 vUv;

  // 角丸の四角形の距離関数（px）
  float roundBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }

  void main() {
    // 速いほど少しズームアウト（画像が引き伸ばされる感じ）
    float zoom = 1.0 - min(abs(uVelocity), 1.0) * 0.06;
    vec2 uv = (vUv - 0.5) * uCover * zoom + 0.5;
    vec2 shift = vec2(0.0, uVelocity * uRgbShift);
    float r = texture2D(uTexture, uv + shift).r;
    float g = texture2D(uTexture, uv).g;
    float b = texture2D(uTexture, uv - shift).b;
    float d = roundBox((vUv - 0.5) * uSize, uSize * 0.5, min(uRadius, min(uSize.x, uSize.y) * 0.5));
    float alpha = 1.0 - smoothstep(-1.0, 0.0, d);
    gl_FragColor = vec4(r, g, b, alpha);
    #include <colorspace_fragment>
  }
`;

type Props = {
  /** 弓なりの強さ（最大何 px たわむか） */
  bend?: number;
  /** 波の強さ（px） */
  wave?: number;
  /** RGB のずれ */
  rgbShift?: number;
  /** 角丸（px） */
  radius?: number;
  /** Lenis の慣性スクロールを使う */
  smoothScroll?: boolean;
};

type Settings = Required<Omit<Props, 'smoothScroll'>> & { reduce: boolean };

/** 画像が来るまでの代わりの模様（2色グラデーション＋番号） */
function makeFallbackTexture(item: Item, index: number) {
  const c = document.createElement('canvas');
  c.width = 800;
  c.height = 1000;
  const g = c.getContext('2d');
  if (g) {
    const grad = g.createLinearGradient(0, 0, 800, 1000);
    grad.addColorStop(0, item.colors[0]);
    grad.addColorStop(1, item.colors[1]);
    g.fillStyle = grad;
    g.fillRect(0, 0, 800, 1000);
    g.fillStyle = 'rgba(255,255,255,0.85)';
    g.font = '700 220px system-ui, sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(String(index + 1).padStart(2, '0'), 400, 500);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function useImageTexture(item: Item, index: number) {
  const [texture, setTexture] = useState<THREE.Texture>(() => makeFallbackTexture(item, index));
  useEffect(() => {
    let alive = true;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    loader.load(item.src, (t) => {
      if (!alive) return;
      t.colorSpace = THREE.SRGBColorSpace;
      setTexture(t);
    });
    return () => {
      alive = false;
    };
  }, [item, index]);
  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

function GalleryPlane({ item, index, slot, settings }: { item: Item; index: number; slot: RefObject<HTMLElement | null>; settings: Settings }) {
  const texture = useImageTexture(item, index);
  const { size } = useThree();
  const mesh = useRef<THREE.Mesh>(null);
  // スクロール速度：scrollY の差分を -1〜1 に正規化し、なめらかに追従
  const lastY = useRef<number | null>(null);
  const velocity = useRef(0);
  const uniforms = useMemo(
    () => ({
      uTexture: { value: null as THREE.Texture | null },
      uCover: { value: new THREE.Vector2(1, 1) },
      uSize: { value: new THREE.Vector2(1, 1) },
      uRadius: { value: 0 },
      uVelocity: { value: 0 },
      uBend: { value: 0 },
      uWave: { value: 0 },
      uRgbShift: { value: 0 },
      uTime: { value: 0 },
    }),
    [],
  );

  useFrame((_, delta) => {
    const y = window.scrollY;
    const diff = lastY.current === null ? 0 : y - lastY.current;
    lastY.current = y;
    const target = settings.reduce ? 0 : THREE.MathUtils.clamp(diff / 60, -1, 1);
    // フレームレートに依存しない追従
    velocity.current += (target - velocity.current) * (1 - Math.exp(-delta * 8));

    const el = slot.current;
    const m = mesh.current;
    if (!el || !m) return;
    const r = el.getBoundingClientRect();
    // DOM の箱（画面座標）→ 中心原点・上向き Y の px 座標へ
    m.position.set(r.left + r.width / 2 - size.width / 2, size.height / 2 - (r.top + r.height / 2), 0);
    m.scale.set(r.width, r.height, 1);
    // 画面外は描かない
    m.visible = r.bottom > -200 && r.top < size.height + 200;

    const u = (m.material as THREE.ShaderMaterial).uniforms;
    u.uTexture.value = texture;
    const img = texture.image as { width: number; height: number } | undefined;
    const imgAspect = img && img.height ? img.width / img.height : 0.8;
    const planeAspect = r.width / Math.max(r.height, 1);
    (u.uCover.value as THREE.Vector2).set(planeAspect > imgAspect ? 1 : planeAspect / imgAspect, planeAspect > imgAspect ? imgAspect / planeAspect : 1);
    (u.uSize.value as THREE.Vector2).set(r.width, r.height);
    u.uRadius.value = settings.radius;
    u.uVelocity.value = velocity.current;
    u.uBend.value = settings.bend;
    u.uWave.value = settings.wave;
    u.uRgbShift.value = settings.rgbShift;
    if (!settings.reduce) u.uTime.value += delta;
  });

  return (
    <mesh ref={mesh} frustumCulled={false}>
      {/* 曲げるので分割数を多めに */}
      <planeGeometry args={[1, 1, 32, 32]} />
      <shaderMaterial vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} transparent depthWrite={false} />
    </mesh>
  );
}

export function VelocityWebGLGallery({ bend = 60, wave = 8, rgbShift = 0.02, radius = 16, smoothScroll = true }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  // 場所取り用の箱の ref（ITEMS と同じ数）
  const slots = useMemo(() => ITEMS.map(() => ({ current: null as HTMLElement | null })), []);
  const [active, setActive] = useState(false);
  const [glReady, setGlReady] = useState(false);
  const reduce = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);

  // 慣性スクロール（DOM と WebGL を同じフレームで動かす）
  useEffect(() => {
    if (!smoothScroll || reduce) return;
    const lenis = new Lenis({ autoRaf: true, lerp: 0.1 });
    return () => lenis.destroy();
  }, [smoothScroll, reduce]);

  // セクションが見えている間だけ描画
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const settings: Settings = { bend, wave, rgbShift, radius, reduce };

  return (
    <section ref={sectionRef} className="relative px-6 py-24 sm:px-12">
      {/* 画面に固定した Canvas。板は下の箱の位置に毎フレーム追従する */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-10" style={{ visibility: active ? 'visible' : 'hidden' }}>
        <Canvas
          orthographic
          camera={{ position: [0, 0, 100], zoom: 1 }}
          dpr={[1, 2]}
          frameloop={active ? 'always' : 'never'}
          gl={{ antialias: true, alpha: true }}
          onCreated={() => setGlReady(true)}
        >
          {ITEMS.map((item, i) => (
            <GalleryPlane key={item.title} item={item} index={i} slot={slots[i]} settings={settings} />
          ))}
        </Canvas>
      </div>

      <ul className="mx-auto grid max-w-5xl grid-cols-2 gap-x-5 gap-y-14 sm:gap-x-12 sm:gap-y-24 [&>li:nth-child(even)]:mt-20 sm:[&>li:nth-child(even)]:mt-40">
        {ITEMS.map((item, i) => (
          <li key={item.title}>
            <div
              ref={(el) => {
                slots[i].current = el;
              }}
              className={`aspect-[4/5] overflow-hidden rounded-2xl ${glReady ? '' : 'bg-white/5'}`}
            >
              {/* WebGL が使えない時の代わり。WebGL の準備ができたら透明にする（箱の大きさは保つ） */}
              <img src={item.src} alt={item.title} loading="lazy" className={`h-full w-full object-cover ${glReady ? 'opacity-0' : ''}`} />
            </div>
            {/* 文字は Canvas より手前に（板が大きくたわんでも隠れない） */}
            <div className="relative z-20 mt-4 flex items-baseline justify-between gap-3">
              <h3 className="text-base font-semibold text-white sm:text-xl">{item.title}</h3>
              <span className="shrink-0 text-[11px] tracking-wider text-white/50">{String(i + 1).padStart(2, '0')}</span>
            </div>
            <p className="relative z-20 mt-1 text-xs text-white/50">{item.meta}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function App() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <header className="flex h-[80vh] flex-col justify-end px-6 pb-16 sm:px-12">
        <p className="text-xs font-semibold tracking-[0.4em] text-white/60">SELECTED WORKS</p>
        <h1 className="mt-4 max-w-4xl text-5xl font-black leading-[1.05] tracking-tight sm:text-8xl">速く動かすほど、画像がしなる。</h1>
        <p className="mt-6 text-sm text-white/60">勢いよくスクロールしてみてください ↓</p>
      </header>
      <VelocityWebGLGallery />
      <footer className="flex h-[60vh] items-center justify-center text-sm text-white/40">ギャラリーはここまで。</footer>
    </main>
  );
}
