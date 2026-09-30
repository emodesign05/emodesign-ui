import { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/* =========================================================
 * シェーダーグラデーション背景（Shader Gradient Background）
 * - GLSL で描く、液体のようにゆっくり流れるグラデーション背景（ヒーローやセクション背景に）
 * - ノイズ（simplex noise）を何層か重ねて UV をゆがませ、3色を混ぜる → CSS では出せないなめらかな流れ
 * - マウス位置でわずかに流れがずれる（uMouse）
 * - 細かい粒子感（グレイン）を足してバンディング（色の段差）を防止
 * - React Three Fiber の画面いっぱいの板に描画。重さは画面解像度に比例するので dpr は最大 1.5
 * - prefers-reduced-motion 時は時間を止めて静止画に
 * ========================================================= */

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

// Ashima Arts の 2D simplex noise（MIT）
const fragment = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  uniform float uNoiseScale;
  uniform float uGrain;
  uniform vec2 uResolution;
  varying vec2 vUv;

  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 uv = vUv;
    uv.x *= uResolution.x / uResolution.y;
    float t = uTime * 0.12;
    vec2 m = (uMouse - 0.5) * 0.3;
    // ノイズで UV をゆがませる（2段）
    float n1 = snoise(uv * uNoiseScale + vec2(t, -t) + m);
    float n2 = snoise(uv * uNoiseScale * 1.8 - vec2(t * 1.3, t * 0.7) + n1);
    float mixAB = smoothstep(-0.6, 0.6, n1);
    float mixC = smoothstep(-0.2, 0.9, n2);
    vec3 color = mix(mix(uColorA, uColorB, mixAB), uColorC, mixC * 0.75);
    // グレイン
    float grain = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233)) + uTime) * 43758.5453);
    color += (grain - 0.5) * uGrain;
    gl_FragColor = vec4(color, 1.0);
  }
`;

type Props = {
  colorA?: string;
  colorB?: string;
  colorC?: string;
  /** 流れる速さ（倍率） */
  speed?: number;
  /** 模様の細かさ */
  noiseScale?: number;
  /** 粒子感 */
  grain?: number;
};

function GradientPlane({ colorA, colorB, colorC, speed, noiseScale, grain }: Required<Props>) {
  const { size } = useThree();
  const reduce = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uColorA: { value: new THREE.Color() },
      uColorB: { value: new THREE.Color() },
      uColorC: { value: new THREE.Color() },
      uNoiseScale: { value: 1 },
      uGrain: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
    }),
    [],
  );

  const matRef = useRef<THREE.ShaderMaterial>(null);
  const mouse = useMemo(() => new THREE.Vector2(), []);

  useFrame(({ pointer }, delta) => {
    const u = matRef.current?.uniforms;
    if (!u) return;
    if (!reduce) u.uTime.value += delta * speed;
    // pointer は -1〜1 → 0〜1 に変換してなめらかに追従
    (u.uMouse.value as THREE.Vector2).lerp(mouse.set(pointer.x * 0.5 + 0.5, pointer.y * 0.5 + 0.5), 0.05);
    (u.uColorA.value as THREE.Color).set(colorA);
    (u.uColorB.value as THREE.Color).set(colorB);
    (u.uColorC.value as THREE.Color).set(colorC);
    u.uNoiseScale.value = noiseScale;
    u.uGrain.value = grain;
    (u.uResolution.value as THREE.Vector2).set(size.width, size.height);
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial ref={matRef} vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} depthWrite={false} depthTest={false} />
    </mesh>
  );
}

export function ShaderGradientBackground({ colorA = '#4f46e5', colorB = '#ec4899', colorC = '#fbbf24', speed = 1, noiseScale = 0.9, grain = 0.06 }: Props) {
  return (
    <div aria-hidden className="absolute inset-0">
      <Canvas dpr={[1, 1.5]} gl={{ antialias: false, powerPreference: 'high-performance' }}>
        <GradientPlane colorA={colorA} colorB={colorB} colorC={colorC} speed={speed} noiseScale={noiseScale} grain={grain} />
      </Canvas>
    </div>
  );
}

export default function App() {
  return (
    <main className="relative flex min-h-screen items-center overflow-hidden">
      <ShaderGradientBackground />
      <div className="relative px-8 text-white sm:px-16">
        <p className="text-xs font-semibold tracking-[0.4em] text-white/80">SHADER GRADIENT</p>
        <h1 className="mt-4 max-w-3xl text-5xl font-black leading-tight tracking-tight drop-shadow sm:text-7xl">色が、流れ続ける。</h1>
        <p className="mt-5 max-w-md text-sm leading-relaxed text-white/85">GLSL のノイズで描く、CSS では出せないなめらかなグラデーション背景。</p>
      </div>
    </main>
  );
}
