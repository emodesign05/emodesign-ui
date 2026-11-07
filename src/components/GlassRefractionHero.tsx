import { useEffect, useMemo, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';

/* =========================================================
 * ガラス屈折オブジェクト（Glass Refraction Hero）
 * - 透明なガラスの立体が、後ろの大きな見出しや模様をゆがめて映す（屈折・色収差）
 * - drei の MeshTransmissionMaterial：背景を一度テクスチャに描き、厚み・屈折率（ior）・色収差でずらして映す
 * - 背景の見出しは 2D Canvas で描いたテクスチャを板に貼る → 日本語フォントの読み込み不要でガラス越しに屈折する
 * - 操作
 *   - マウス：立体がカーソルの方向へ傾く
 *   - スクロール：sticky で画面に留めたまま、進み具合に合わせて回転・縮小
 *   - クリック / タップ：勢いよくスピン（だんだん減速）
 * - 環境光は Lightformer で組んだ自前の環境マップ（HDR ファイルの外部読み込みなし）
 * - 画面外では描画を止める。重いので quality='low' でサンプル数と解像度を下げられる
 * - prefers-reduced-motion 時は自動回転・追従・スクロール回転を止める
 * ========================================================= */

type Shape = 'knot' | 'torus' | 'crystal' | 'capsule';

type Props = {
  /** 背景に描く見出し（\n で改行） */
  title?: string;
  /** 立体の形 */
  shape?: Shape;
  /** ガラスの厚み（大きいほど強く屈折） */
  thickness?: number;
  /** 屈折率 */
  ior?: number;
  /** 色収差（虹色のにじみ） */
  chromaticAberration?: number;
  /** すりガラス度 */
  roughness?: number;
  /** カーソル追従の強さ */
  follow?: number;
  /** 背景色 */
  bgColor?: string;
  /** 見出しの色 */
  textColor?: string;
  /** 模様の差し色 */
  accentColor?: string;
  /** 描画品質 */
  quality?: 'low' | 'high';
  /** スクロールの長さ（vh） */
  scrollLength?: number;
};

const BACK_Z = -2.5;

/** 背景の板に貼るテクスチャ（見出し＋円＋ストライプ）を 2D Canvas で描く */
function drawBackdrop(width: number, height: number, title: string, bg: string, text: string, accent: string) {
  const scale = Math.min(2, 2048 / Math.max(width, height));
  const w = Math.max(2, Math.round(width * scale));
  const h = Math.max(2, Math.round(height * scale));
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d');
  if (g) {
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
    // 細いストライプ（屈折したときにゆがみが分かりやすい）
    g.strokeStyle = accent;
    g.globalAlpha = 0.18;
    g.lineWidth = Math.max(1, w / 600);
    for (let x = -h; x < w; x += w / 40) {
      g.beginPath();
      g.moveTo(x, h);
      g.lineTo(x + h, 0);
      g.stroke();
    }
    // 差し色の円
    g.globalAlpha = 1;
    const r = Math.min(w, h) * 0.2;
    g.fillStyle = accent;
    g.beginPath();
    g.arc(w * 0.78, h * 0.28, r, 0, Math.PI * 2);
    g.fill();
    g.beginPath();
    g.arc(w * 0.2, h * 0.75, r * 0.45, 0, Math.PI * 2);
    g.fill();
    // 見出し：幅の 86% に収まる大きさで中央に
    const lines = title.split('\n');
    g.fillStyle = text;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    const family = '"Helvetica Neue", Arial, "Hiragino Sans", "Noto Sans JP", sans-serif';
    let size = h / (lines.length + 0.4);
    g.font = `900 ${size}px ${family}`;
    const widest = Math.max(...lines.map((l) => g.measureText(l).width), 1);
    size = Math.min(size, (size * w * 0.86) / widest);
    g.font = `900 ${size}px ${family}`;
    const lh = size * 0.95;
    lines.forEach((l, i) => g.fillText(l, w / 2, h / 2 + (i - (lines.length - 1) / 2) * lh));
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function Backdrop({ title, bgColor, textColor, accentColor }: { title: string; bgColor: string; textColor: string; accentColor: string }) {
  const { viewport, camera, size } = useThree();
  const vp = viewport.getCurrentViewport(camera, [0, 0, BACK_Z]);
  const texture = useMemo(
    () => drawBackdrop(size.width, size.height, title, bgColor, textColor, accentColor),
    [size.width, size.height, title, bgColor, textColor, accentColor],
  );
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <mesh position={[0, 0, BACK_Z]} scale={[vp.width, vp.height, 1]}>
      <planeGeometry />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

function ShapeGeometry({ shape }: { shape: Shape }) {
  if (shape === 'torus') return <torusGeometry args={[1, 0.42, 96, 192]} />;
  if (shape === 'crystal') return <icosahedronGeometry args={[1.35, 0]} />;
  if (shape === 'capsule') return <capsuleGeometry args={[0.7, 1.2, 16, 64]} />;
  return <torusKnotGeometry args={[0.9, 0.32, 256, 48]} />;
}

type GlassProps = Required<Pick<Props, 'shape' | 'thickness' | 'ior' | 'chromaticAberration' | 'roughness' | 'follow' | 'quality'>> & {
  progressRef: RefObject<number>;
  spinRef: RefObject<number>;
  reduce: boolean;
};

function GlassObject({ shape, thickness, ior, chromaticAberration, roughness, follow, quality, progressRef, spinRef, reduce }: GlassProps) {
  const mesh = useRef<THREE.Mesh>(null);
  const angle = useRef(0);
  const { viewport } = useThree();
  // 狭い画面では小さく
  const fit = Math.min(1, viewport.width / 5.5);

  useFrame(({ pointer }, delta) => {
    const m = mesh.current;
    if (!m) return;
    const p = reduce ? 0 : progressRef.current;
    // タップのスピンは時間とともに減速
    spinRef.current *= Math.exp(-delta * 1.8);
    if (!reduce) angle.current += delta * (0.25 + spinRef.current);
    const k = 1 - Math.exp(-delta * 4);
    const f = reduce ? 0 : follow;
    const tx = -pointer.y * 0.5 * f + p * Math.PI * 0.8;
    const ty = pointer.x * 0.8 * f + angle.current + p * Math.PI * 1.5;
    m.rotation.x += (tx - m.rotation.x) * k;
    m.rotation.y += (ty - m.rotation.y) * k;
    const s = fit * (1 - p * 0.35);
    m.scale.setScalar(s);
    m.position.y = p * 0.6;
  });

  return (
    <mesh ref={mesh}>
      <ShapeGeometry shape={shape} />
      <MeshTransmissionMaterial
        transmission={1}
        thickness={thickness}
        ior={ior}
        chromaticAberration={chromaticAberration}
        roughness={roughness}
        anisotropy={0.2}
        distortion={0.25}
        distortionScale={0.4}
        temporalDistortion={reduce ? 0 : 0.08}
        backside
        backsideThickness={thickness * 0.3}
        samples={quality === 'high' ? 10 : 4}
        resolution={quality === 'high' ? 1024 : 512}
        color="#ffffff"
      />
    </mesh>
  );
}

export function GlassRefractionHero({
  title = 'LIQUID\nGLASS',
  shape = 'knot',
  thickness = 1.2,
  ior = 1.4,
  chromaticAberration = 0.25,
  roughness = 0.05,
  follow = 1,
  bgColor = '#0b0b0f',
  textColor = '#f5f5f4',
  accentColor = '#f97316',
  quality = 'high',
  scrollLength = 200,
}: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef(0);
  const spinRef = useRef(0);
  const [active, setActive] = useState(true);
  const reduce = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);

  // スクロール進捗（セクション内を何割進んだか）
  useEffect(() => {
    const onScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const range = Math.max(r.height - window.innerHeight, 1);
      progressRef.current = THREE.MathUtils.clamp(-r.top / range, 0, 1);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // 画面外では描画を止める
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative" style={{ height: `${Math.max(100, scrollLength)}vh`, background: bgColor }}>
      <div
        className="sticky top-0 h-screen overflow-hidden"
        onPointerDown={() => {
          if (!reduce) spinRef.current = Math.min(spinRef.current + 6, 14);
        }}
      >
        <Canvas
          dpr={[1, quality === 'high' ? 2 : 1.25]}
          camera={{ position: [0, 0, 6], fov: 35 }}
          frameloop={active ? 'always' : 'never'}
          gl={{ antialias: true }}
          role="img"
          aria-label="背景の見出しを屈折させて映す、回転するガラスの立体"
        >
          <Backdrop title={title} bgColor={bgColor} textColor={textColor} accentColor={accentColor} />
          <GlassObject
            shape={shape}
            thickness={thickness}
            ior={ior}
            chromaticAberration={chromaticAberration}
            roughness={roughness}
            follow={follow}
            quality={quality}
            progressRef={progressRef}
            spinRef={spinRef}
            reduce={reduce}
          />
          <Environment resolution={256}>
            <group rotation={[-Math.PI / 3, 0, 1]}>
              <Lightformer form="circle" intensity={4} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={2} />
              <Lightformer form="circle" intensity={2} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={2} />
              <Lightformer form="ring" color={accentColor} intensity={3} rotation-y={Math.PI / 2} position={[-5, -1, -1]} scale={2} />
              <Lightformer form="rect" intensity={2} rotation-y={-Math.PI / 2} position={[10, 1, 0]} scale={[50, 2, 1]} />
            </group>
          </Environment>
        </Canvas>

        {/* 見出しは Canvas に描いているので、読み上げ用に同じ文字を置く */}
        <h1 className="sr-only">{title.replace(/\n/g, ' ')}</h1>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 px-6 pb-8 sm:px-12 sm:pb-12" style={{ color: textColor }}>
          <p className="max-w-xs text-xs leading-relaxed opacity-70 sm:text-sm">透明な立体が、後ろの世界をゆがめて映す。カーソルを動かす・タップする・スクロールする。</p>
          <p className="shrink-0 text-[10px] font-semibold tracking-[0.3em] opacity-60">MOVE / TAP / SCROLL</p>
        </div>
      </div>
    </section>
  );
}

export default function App() {
  return (
    <main className="bg-[#0b0b0f]">
      <GlassRefractionHero />
      <section className="flex h-screen items-center justify-center px-6 text-center text-sm text-white/50">ガラスのヒーローはここまで。</section>
    </main>
  );
}
