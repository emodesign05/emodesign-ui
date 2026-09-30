import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';

/* =========================================================
 * ホバー画像ディストーション（WebGL Hover Distortion）
 * - 画像にマウスを乗せると、カーソルの周りが波打ち、RGB がずれて揺らぐ（クリエイティブ系ポートフォリオの定番）
 * - React Three Fiber で画像を板（plane）に貼り、自作のシェーダー（GLSL）で歪ませる
 *   - uHover：ホバー量（0→1 を GSAP で tween してなめらかに出し入れ）
 *   - uMouse：カーソル位置（UV 座標）。周囲だけ波紋状に歪む
 *   - uStrength / uRgbShift：歪み・色ずれの強さ
 * - 板は常に Canvas いっぱいに cover で表示（画像の縦横比を保持）
 * - 画像の読み込み中・読み込めない時は、Canvas で描いた代わりの模様を表示（エラーで真っ白にならない）
 * - prefers-reduced-motion 時は歪ませない（通常の画像として表示）
 * ========================================================= */

const IMAGE = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600&q=80';

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragment = /* glsl */ `
  uniform sampler2D uTexture;
  uniform vec2 uMouse;
  uniform float uHover;
  uniform float uTime;
  uniform float uStrength;
  uniform float uRgbShift;
  uniform vec2 uCover; // cover 表示のための UV 倍率
  varying vec2 vUv;

  void main() {
    vec2 uv = (vUv - 0.5) * uCover + 0.5;
    // カーソルからの距離に応じた波紋
    float d = distance(vUv, uMouse);
    float ripple = sin(d * 28.0 - uTime * 4.0) * exp(-d * 6.0);
    vec2 dir = normalize(vUv - uMouse + 1e-4);
    vec2 offset = dir * ripple * uStrength * uHover;
    // RGB を少しずつずらす
    float shift = uRgbShift * uHover * exp(-d * 4.0);
    float r = texture2D(uTexture, uv + offset + vec2(shift, 0.0)).r;
    float g = texture2D(uTexture, uv + offset).g;
    float b = texture2D(uTexture, uv + offset - vec2(shift, 0.0)).b;
    gl_FragColor = vec4(r, g, b, 1.0);
  }
`;

type Props = {
  src?: string;
  /** 歪みの強さ */
  strength?: number;
  /** RGB のずれ */
  rgbShift?: number;
  /** ホバーの出入りの時間（秒） */
  hoverDuration?: number;
};

/** 画像が来るまでの代わりの模様（グラデーション＋縞） */
function makeFallbackTexture() {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 640;
  const g = c.getContext('2d');
  if (g) {
    const grad = g.createLinearGradient(0, 0, 1024, 640);
    grad.addColorStop(0, '#4f46e5');
    grad.addColorStop(0.5, '#db2777');
    grad.addColorStop(1, '#f59e0b');
    g.fillStyle = grad;
    g.fillRect(0, 0, 1024, 640);
    g.strokeStyle = 'rgba(255,255,255,0.25)';
    g.lineWidth = 6;
    for (let x = -640; x < 1024; x += 48) {
      g.beginPath();
      g.moveTo(x, 640);
      g.lineTo(x + 640, 0);
      g.stroke();
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function useImageTexture(src: string) {
  const [texture, setTexture] = useState<THREE.Texture>(() => makeFallbackTexture());
  useEffect(() => {
    let alive = true;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    loader.load(src, (t) => {
      if (!alive) return;
      t.colorSpace = THREE.SRGBColorSpace;
      setTexture(t);
    });
    return () => {
      alive = false;
    };
  }, [src]);
  return texture;
}

function DistortPlane({ src, strength, rgbShift, hoverDuration }: Required<Props>) {
  const texture = useImageTexture(src);
  const { viewport } = useThree();
  const reduce = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);
  // uniforms は最初に1回だけ作り、値の更新は material 経由で行う（React の再描画と切り離す）
  const uniforms = useMemo(
    () => ({
      uTexture: { value: null as THREE.Texture | null },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uHover: { value: 0 },
      uTime: { value: 0 },
      uStrength: { value: 0 },
      uRgbShift: { value: 0 },
      uCover: { value: new THREE.Vector2(1, 1) },
    }),
    [],
  );
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const target = useRef(new THREE.Vector2(0.5, 0.5));

  useFrame((_, delta) => {
    const u = matRef.current?.uniforms;
    if (!u) return;
    u.uTexture.value = texture;
    u.uStrength.value = strength;
    u.uRgbShift.value = rgbShift;
    u.uTime.value += delta;
    (u.uMouse.value as THREE.Vector2).lerp(target.current, 0.12);
    // cover：画面と画像の縦横比から UV の倍率を決める
    const img = texture.image as { width: number; height: number } | undefined;
    if (img?.width) {
      const planeAspect = viewport.width / viewport.height;
      const imgAspect = img.width / img.height;
      (u.uCover.value as THREE.Vector2).set(planeAspect < imgAspect ? planeAspect / imgAspect : 1, planeAspect < imgAspect ? 1 : imgAspect / planeAspect);
    }
  });

  const hover = (value: number, duration: number) => {
    const u = matRef.current?.uniforms;
    if (u) gsap.to(u.uHover, { value, duration, ease: 'power2.out', overwrite: true });
  };

  return (
    <mesh
      scale={[viewport.width, viewport.height, 1]}
      onPointerMove={(e) => e.uv && target.current.copy(e.uv)}
      onPointerOver={() => !reduce && hover(1, hoverDuration)}
      onPointerOut={() => hover(0, hoverDuration * 1.5)}
    >
      <planeGeometry args={[1, 1, 1, 1]} />
      <shaderMaterial ref={matRef} vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} />
    </mesh>
  );
}

export function HoverImageDistortion({ src = IMAGE, strength = 0.03, rgbShift = 0.012, hoverDuration = 0.6 }: Props) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl bg-gradient-to-br from-slate-700 to-slate-900">
      <Canvas orthographic camera={{ position: [0, 0, 5], zoom: 1 }} dpr={[1, 2]} role="img" aria-label="マウスで揺らぐ風景写真">
        <DistortPlane src={src} strength={strength} rgbShift={rgbShift} hoverDuration={hoverDuration} />
      </Canvas>
    </div>
  );
}

export default function App() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-neutral-950 px-6 py-16 text-white">
      <div className="text-center">
        <p className="text-xs font-semibold tracking-[0.3em] text-indigo-400">WEBGL HOVER DISTORTION</p>
        <h1 className="mt-3 text-4xl font-black sm:text-5xl">触れると、景色が揺らぐ。</h1>
      </div>
      <div className="aspect-[16/10] w-full max-w-4xl">
        <HoverImageDistortion />
      </div>
    </main>
  );
}
