import { useEffect, useRef } from 'react';

/* =========================================================
 * インク流体（Ink Fluid Cursor）
 * - カーソルや指の軌跡から、インクや煙のような流体がにじんで渦を巻き、ゆっくり消える
 * - WebGL2 で流体シミュレーション（Stable Fluids）を毎フレーム解く
 *   1) 速度場を自分自身で移流（advection）→ 2) 渦を強調（vorticity confinement）
 *   3) 発散を求めて圧力を反復計算（Jacobi 法）→ 4) 圧力の勾配を引いて「縮まない流れ」にする
 *   5) 色（インク）を速度場で移流 → 6) 背景色と合成して表示
 *   ※ 構成は Pavel Dobryakov の WebGL-Fluid-Simulation（MIT）を参考に、必要な部分だけ書き直したもの
 * - 半精度浮動小数テクスチャ（RGBA16F）に描くため、WebGL2 ＋ EXT_color_buffer_float が必要。無い時は静止グラデーション
 * - 操作：マウス移動・指のドラッグで流れを足す / クリック・タップでインクを弾けさせる
 *   スマホでは縦スクロールを妨げないよう touch-action: pan-y（縦スワイプはスクロール、横ドラッグとタップで描ける）
 * - mode='glow'（暗い背景に光る色を足す）/ 'ink'（明るい背景に色が染みる）
 * - 触っていない間も autoSplat でときどきインクを落とす。画面外では計算を止める
 * - prefers-reduced-motion 時は最初の数滴を描いた静止画にする
 * ========================================================= */

type Props = {
  /** 'glow'：暗い背景に光る / 'ink'：明るい背景に染みる */
  mode?: 'glow' | 'ink';
  /** 背景色 */
  bgColor?: string;
  /** 'rainbow'：色相が移り変わる / 'custom'：colorA と colorB を交互に */
  palette?: 'rainbow' | 'custom';
  colorA?: string;
  colorB?: string;
  /** インクの消えにくさ（大きいほど長く残る） */
  persistence?: number;
  /** 渦の強さ */
  curl?: number;
  /** 筆の太さ */
  radius?: number;
  /** 流れを足す力 */
  force?: number;
  /** 触っていない間もときどきインクを落とす */
  autoSplat?: boolean;
  /** 描画品質（インクの解像度） */
  quality?: 'low' | 'high';
};

const baseVertex = /* glsl */ `
  precision highp float;
  attribute vec2 aPosition;
  varying vec2 vUv, vL, vR, vT, vB;
  uniform vec2 texelSize;
  void main() {
    vUv = aPosition * 0.5 + 0.5;
    vL = vUv - vec2(texelSize.x, 0.0);
    vR = vUv + vec2(texelSize.x, 0.0);
    vT = vUv + vec2(0.0, texelSize.y);
    vB = vUv - vec2(0.0, texelSize.y);
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

const FS = {
  splat: `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D uTarget;
    uniform float aspectRatio;
    uniform vec3 color;
    uniform vec2 point;
    uniform float radius;
    void main() {
      vec2 p = vUv - point;
      p.x *= aspectRatio;
      vec3 splat = exp(-dot(p, p) / radius) * color;
      gl_FragColor = vec4(texture2D(uTarget, vUv).xyz + splat, 1.0);
    }`,
  advection: `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D uVelocity;
    uniform sampler2D uSource;
    uniform vec2 texelSize;
    uniform float dt;
    uniform float dissipation;
    void main() {
      vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
      gl_FragColor = texture2D(uSource, coord) / (1.0 + dissipation * dt);
    }`,
  divergence: `
    precision highp float;
    varying vec2 vUv, vL, vR, vT, vB;
    uniform sampler2D uVelocity;
    void main() {
      float L = texture2D(uVelocity, vL).x;
      float R = texture2D(uVelocity, vR).x;
      float T = texture2D(uVelocity, vT).y;
      float B = texture2D(uVelocity, vB).y;
      vec2 C = texture2D(uVelocity, vUv).xy;
      // 壁で跳ね返す
      if (vL.x < 0.0) L = -C.x;
      if (vR.x > 1.0) R = -C.x;
      if (vT.y > 1.0) T = -C.y;
      if (vB.y < 0.0) B = -C.y;
      gl_FragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
    }`,
  curl: `
    precision highp float;
    varying vec2 vUv, vL, vR, vT, vB;
    uniform sampler2D uVelocity;
    void main() {
      float L = texture2D(uVelocity, vL).y;
      float R = texture2D(uVelocity, vR).y;
      float T = texture2D(uVelocity, vT).x;
      float B = texture2D(uVelocity, vB).x;
      gl_FragColor = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
    }`,
  vorticity: `
    precision highp float;
    varying vec2 vUv, vL, vR, vT, vB;
    uniform sampler2D uVelocity;
    uniform sampler2D uCurl;
    uniform float curl;
    uniform float dt;
    void main() {
      float L = texture2D(uCurl, vL).x;
      float R = texture2D(uCurl, vR).x;
      float T = texture2D(uCurl, vT).x;
      float B = texture2D(uCurl, vB).x;
      float C = texture2D(uCurl, vUv).x;
      vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
      force /= length(force) + 0.0001;
      force *= curl * C;
      force.y *= -1.0;
      vec2 vel = texture2D(uVelocity, vUv).xy + force * dt;
      gl_FragColor = vec4(clamp(vel, -1000.0, 1000.0), 0.0, 1.0);
    }`,
  pressure: `
    precision highp float;
    varying vec2 vUv, vL, vR, vT, vB;
    uniform sampler2D uPressure;
    uniform sampler2D uDivergence;
    void main() {
      float L = texture2D(uPressure, vL).x;
      float R = texture2D(uPressure, vR).x;
      float T = texture2D(uPressure, vT).x;
      float B = texture2D(uPressure, vB).x;
      float div = texture2D(uDivergence, vUv).x;
      gl_FragColor = vec4((L + R + B + T - div) * 0.25, 0.0, 0.0, 1.0);
    }`,
  gradient: `
    precision highp float;
    varying vec2 vUv, vL, vR, vT, vB;
    uniform sampler2D uPressure;
    uniform sampler2D uVelocity;
    void main() {
      float L = texture2D(uPressure, vL).x;
      float R = texture2D(uPressure, vR).x;
      float T = texture2D(uPressure, vT).x;
      float B = texture2D(uPressure, vB).x;
      vec2 vel = texture2D(uVelocity, vUv).xy - vec2(R - L, T - B);
      gl_FragColor = vec4(vel, 0.0, 1.0);
    }`,
  scale: `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D uTexture;
    uniform float value;
    void main() { gl_FragColor = value * texture2D(uTexture, vUv); }`,
  display: `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D uTexture;
    uniform vec3 uBg;
    uniform float uInk;
    void main() {
      vec3 c = texture2D(uTexture, vUv).rgb;
      // glow：足し算で光らせる / ink：背景から吸収（色の補色をためている）
      vec3 col = uInk > 0.5 ? uBg * exp(-c * 2.0) : uBg + c;
      // 軽いディザでバンディング防止
      float n = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
      gl_FragColor = vec4(col + (n - 0.5) / 255.0, 1.0);
    }`,
};

type Program = { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> };
type FBO = { texture: WebGLTexture; fbo: WebGLFramebuffer; width: number; height: number; texelX: number; texelY: number };
type DoubleFBO = { read: FBO; write: FBO; swap: () => void };

function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace('#', '');
  const n = parseInt(m.length === 3 ? m.replace(/./g, '$&$&') : m, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  return ([[v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q]] as const)[i % 6].slice() as [number, number, number];
}

export function InkFluidCursor({
  mode = 'glow',
  bgColor = '#05060a',
  palette = 'rainbow',
  colorA = '#22d3ee',
  colorB = '#f472b6',
  persistence = 0.6,
  curl = 30,
  radius = 0.25,
  force = 6000,
  autoSplat = true,
  quality = 'high',
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  // 毎フレーム読む設定は ref に入れて、変えてもシミュレーションを作り直さない
  const settings = useRef({ mode, bgColor, palette, colorA, colorB, persistence, curl, radius, force, autoSplat });
  useEffect(() => {
    settings.current = { mode, bgColor, palette, colorA, colorB, persistence, curl, radius, force, autoSplat };
  }, [mode, bgColor, palette, colorA, colorB, persistence, curl, radius, force, autoSplat]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    // canvas はここで作って片付けで外す（StrictMode の再実行で、失ったコンテキストを使い回さないため）
    const canvas = document.createElement('canvas');
    canvas.className = 'block h-full w-full';
    wrap.appendChild(canvas);
    const gl = canvas.getContext('webgl2', { alpha: false, antialias: false, depth: false, stencil: false, preserveDrawingBuffer: false });
    if (!gl || !gl.getExtension('EXT_color_buffer_float')) {
      canvas.remove();
      wrap.dataset.fallback = 'true';
      return;
    }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const SIM_RES = 128;
    const DYE_RES = quality === 'high' ? 1024 : 512;
    const PRESSURE_ITERATIONS = 20;

    /* ---------- シェーダー・プログラム ---------- */
    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s));
      return s;
    };
    const vs = compile(gl.VERTEX_SHADER, baseVertex);
    const makeProgram = (fs: string): Program => {
      const program = gl.createProgram()!;
      gl.attachShader(program, vs);
      gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fs));
      gl.bindAttribLocation(program, 0, 'aPosition');
      gl.linkProgram(program);
      const uniforms: Program['uniforms'] = {};
      const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS) as number;
      for (let i = 0; i < count; i++) {
        const name = gl.getActiveUniform(program, i)!.name;
        uniforms[name] = gl.getUniformLocation(program, name);
      }
      return { program, uniforms };
    };
    const P = Object.fromEntries(Object.entries(FS).map(([k, src]) => [k, makeProgram(src)])) as Record<keyof typeof FS, Program>;

    /* ---------- 画面いっぱいの四角形 ---------- */
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);

    const blit = (target: FBO | null) => {
      if (target) {
        gl.viewport(0, 0, target.width, target.height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
      } else {
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      }
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    };

    /* ---------- 計算用テクスチャ（フレームバッファ） ---------- */
    const createFBO = (w: number, h: number, internal: number, format: number, filter: number): FBO => {
      gl.activeTexture(gl.TEXTURE0);
      const texture = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, format, gl.HALF_FLOAT, null);
      const fbo = gl.createFramebuffer()!;
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      gl.viewport(0, 0, w, h);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      return { texture, fbo, width: w, height: h, texelX: 1 / w, texelY: 1 / h };
    };
    const createDouble = (w: number, h: number, internal: number, format: number, filter: number): DoubleFBO => {
      const d = {
        read: createFBO(w, h, internal, format, filter),
        write: createFBO(w, h, internal, format, filter),
        swap() {
          const t = d.read;
          d.read = d.write;
          d.write = t;
        },
      };
      return d;
    };
    const deleteFBO = (f: FBO) => {
      gl.deleteTexture(f.texture);
      gl.deleteFramebuffer(f.fbo);
    };
    const bind = (unit: number, f: FBO) => {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, f.texture);
      return unit;
    };

    /** 解像度：短辺を res に、長辺は縦横比に合わせる */
    const resolution = (res: number) => {
      const w = gl.drawingBufferWidth;
      const h = gl.drawingBufferHeight;
      const aspect = w > h ? w / h : h / w;
      const min = Math.round(res);
      const max = Math.round(res * aspect);
      return w > h ? { w: max, h: min } : { w: min, h: max };
    };

    let dye: DoubleFBO, velocity: DoubleFBO, pressure: DoubleFBO, divergence: FBO, curlFBO: FBO;
    let initialized = false;
    const initFBOs = () => {
      if (initialized) [dye.read, dye.write, velocity.read, velocity.write, pressure.read, pressure.write, divergence, curlFBO].forEach(deleteFBO);
      const s = resolution(SIM_RES);
      const d = resolution(DYE_RES);
      dye = createDouble(d.w, d.h, gl.RGBA16F, gl.RGBA, gl.LINEAR);
      velocity = createDouble(s.w, s.h, gl.RG16F, gl.RG, gl.LINEAR);
      pressure = createDouble(s.w, s.h, gl.R16F, gl.RED, gl.NEAREST);
      divergence = createFBO(s.w, s.h, gl.R16F, gl.RED, gl.NEAREST);
      curlFBO = createFBO(s.w, s.h, gl.R16F, gl.RED, gl.NEAREST);
      initialized = true;
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width === w && canvas.height === h && initialized) return false;
      canvas.width = w;
      canvas.height = h;
      initFBOs();
      return true;
    };
    resize();

    /* ---------- インクを落とす ---------- */
    let hue = Math.random();
    const nextColor = (): [number, number, number] => {
      const st = settings.current;
      let c: [number, number, number];
      if (st.palette === 'custom') {
        hue += 1;
        c = hexToRgb(hue % 2 < 1 ? st.colorA : st.colorB);
      } else {
        hue = (hue + 0.07) % 1;
        c = hsvToRgb(hue, 1, 1);
      }
      // ink モードは「吸収する色」＝補色をためる
      if (st.mode === 'ink') c = [1 - c[0], 1 - c[1], 1 - c[2]];
      const k = st.mode === 'ink' ? 0.35 : 0.15;
      return [c[0] * k, c[1] * k, c[2] * k];
    };

    const splat = (x: number, y: number, dx: number, dy: number, color: [number, number, number], radiusScale = 1) => {
      const aspect = canvas.width / canvas.height;
      let r = (settings.current.radius / 100) * radiusScale;
      if (aspect > 1) r *= aspect;
      const p = P.splat;
      gl.useProgram(p.program);
      gl.uniform1i(p.uniforms.uTarget, bind(0, velocity.read));
      gl.uniform1f(p.uniforms.aspectRatio, aspect);
      gl.uniform2f(p.uniforms.point, x, y);
      gl.uniform3f(p.uniforms.color, dx, dy, 0);
      gl.uniform1f(p.uniforms.radius, r);
      blit(velocity.write);
      velocity.swap();
      gl.uniform1i(p.uniforms.uTarget, bind(0, dye.read));
      gl.uniform3f(p.uniforms.color, color[0], color[1], color[2]);
      blit(dye.write);
      dye.swap();
    };

    const randomSplats = (n: number) => {
      for (let i = 0; i < n; i++) {
        const c = nextColor();
        splat(Math.random(), Math.random(), (Math.random() - 0.5) * 1000, (Math.random() - 0.5) * 1000, [c[0] * 10, c[1] * 10, c[2] * 10], 1.5);
      }
    };

    /* ---------- 1ステップ分の計算 ---------- */
    const step = (dt: number) => {
      const st = settings.current;
      gl.disable(gl.BLEND);
      const simTexel = [velocity.read.texelX, velocity.read.texelY] as const;

      let p = P.curl;
      gl.useProgram(p.program);
      gl.uniform2f(p.uniforms.texelSize, ...simTexel);
      gl.uniform1i(p.uniforms.uVelocity, bind(0, velocity.read));
      blit(curlFBO);

      p = P.vorticity;
      gl.useProgram(p.program);
      gl.uniform2f(p.uniforms.texelSize, ...simTexel);
      gl.uniform1i(p.uniforms.uVelocity, bind(0, velocity.read));
      gl.uniform1i(p.uniforms.uCurl, bind(1, curlFBO));
      gl.uniform1f(p.uniforms.curl, st.curl);
      gl.uniform1f(p.uniforms.dt, dt);
      blit(velocity.write);
      velocity.swap();

      p = P.divergence;
      gl.useProgram(p.program);
      gl.uniform2f(p.uniforms.texelSize, ...simTexel);
      gl.uniform1i(p.uniforms.uVelocity, bind(0, velocity.read));
      blit(divergence);

      // 前フレームの圧力を少し残して収束を早める
      p = P.scale;
      gl.useProgram(p.program);
      gl.uniform1i(p.uniforms.uTexture, bind(0, pressure.read));
      gl.uniform1f(p.uniforms.value, 0.8);
      blit(pressure.write);
      pressure.swap();

      p = P.pressure;
      gl.useProgram(p.program);
      gl.uniform2f(p.uniforms.texelSize, ...simTexel);
      gl.uniform1i(p.uniforms.uDivergence, bind(0, divergence));
      for (let i = 0; i < PRESSURE_ITERATIONS; i++) {
        gl.uniform1i(p.uniforms.uPressure, bind(1, pressure.read));
        blit(pressure.write);
        pressure.swap();
      }

      p = P.gradient;
      gl.useProgram(p.program);
      gl.uniform2f(p.uniforms.texelSize, ...simTexel);
      gl.uniform1i(p.uniforms.uPressure, bind(0, pressure.read));
      gl.uniform1i(p.uniforms.uVelocity, bind(1, velocity.read));
      blit(velocity.write);
      velocity.swap();

      p = P.advection;
      gl.useProgram(p.program);
      gl.uniform2f(p.uniforms.texelSize, ...simTexel);
      gl.uniform1i(p.uniforms.uVelocity, bind(0, velocity.read));
      gl.uniform1i(p.uniforms.uSource, bind(0, velocity.read));
      gl.uniform1f(p.uniforms.dt, dt);
      gl.uniform1f(p.uniforms.dissipation, 0.2);
      blit(velocity.write);
      velocity.swap();

      // persistence 0〜1 → 消え方 3.0（すぐ消える）〜 0.1（長く残る）
      gl.uniform1i(p.uniforms.uVelocity, bind(0, velocity.read));
      gl.uniform1i(p.uniforms.uSource, bind(1, dye.read));
      gl.uniform1f(p.uniforms.dissipation, 3.0 - Math.min(Math.max(st.persistence, 0), 1) * 2.9);
      blit(dye.write);
      dye.swap();
    };

    const render = () => {
      const st = settings.current;
      const p = P.display;
      gl.useProgram(p.program);
      gl.uniform1i(p.uniforms.uTexture, bind(0, dye.read));
      gl.uniform3f(p.uniforms.uBg, ...hexToRgb(st.bgColor));
      gl.uniform1f(p.uniforms.uInk, st.mode === 'ink' ? 1 : 0);
      blit(null);
    };

    /* ---------- 操作 ---------- */
    const pointer = { x: 0, y: 0, dx: 0, dy: 0, moved: false, has: false };
    const toUv = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: (e.clientX - r.left) / r.width, y: 1 - (e.clientY - r.top) / r.height };
    };
    let lastInput = 0;
    const onMove = (e: PointerEvent) => {
      const { x, y } = toUv(e);
      if (pointer.has) {
        const aspect = canvas.width / canvas.height;
        // 縦長の画面では横の動き、横長では縦の動きを縦横比で補正
        pointer.dx += (x - pointer.x) * (aspect < 1 ? aspect : 1);
        pointer.dy += (y - pointer.y) / (aspect > 1 ? aspect : 1);
        pointer.moved = true;
      }
      pointer.x = x;
      pointer.y = y;
      pointer.has = true;
      lastInput = performance.now();
    };
    const onLeave = () => {
      pointer.has = false;
    };
    const onDown = (e: PointerEvent) => {
      const { x, y } = toUv(e);
      pointer.x = x;
      pointer.y = y;
      pointer.has = true;
      lastInput = performance.now();
      // タップ：周りに弾けるように数方向へ
      const c = nextColor();
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + Math.random();
        splat(x, y, Math.cos(a) * 900, Math.sin(a) * 900, [c[0] * 4, c[1] * 4, c[2] * 4], 0.8);
      }
    };
    wrap.addEventListener('pointermove', onMove);
    wrap.addEventListener('pointerdown', onDown);
    wrap.addEventListener('pointerleave', onLeave);
    wrap.addEventListener('pointercancel', onLeave);

    /* ---------- ループ ---------- */
    randomSplats(reduce ? 6 : 4);
    if (reduce) {
      // 少し流してから静止画に
      for (let i = 0; i < 40; i++) step(0.016);
      render();
    }

    let raf = 0;
    let visible = true;
    let last = performance.now();
    let nextAuto = last + 1200;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible) {
        last = now;
        return;
      }
      const dt = Math.min((now - last) / 1000, 0.016666);
      last = now;
      if (resize()) randomSplats(3);
      if (pointer.moved) {
        splat(pointer.x, pointer.y, pointer.dx * settings.current.force, pointer.dy * settings.current.force, nextColor());
        pointer.dx = 0;
        pointer.dy = 0;
        pointer.moved = false;
      }
      if (settings.current.autoSplat && now > nextAuto && now - lastInput > 2500) {
        randomSplats(1);
        nextAuto = now + 1600 + Math.random() * 1600;
      }
      step(dt);
      render();
    };
    if (!reduce) raf = requestAnimationFrame(loop);

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(wrap);
    const ro = new ResizeObserver(() => {
      if (reduce && resize()) {
        randomSplats(6);
        for (let i = 0; i < 40; i++) step(0.016);
        render();
      }
    });
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      wrap.removeEventListener('pointermove', onMove);
      wrap.removeEventListener('pointerdown', onDown);
      wrap.removeEventListener('pointerleave', onLeave);
      wrap.removeEventListener('pointercancel', onLeave);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      canvas.remove();
    };
  }, [quality]);

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className="absolute inset-0 overflow-hidden data-[fallback=true]:bg-[radial-gradient(circle_at_30%_40%,#22d3ee55,transparent_45%),radial-gradient(circle_at_70%_60%,#f472b655,transparent_45%)]"
      style={{ backgroundColor: bgColor, touchAction: 'pan-y' }}
    />
  );
}

export default function App() {
  return (
    <main className="relative flex min-h-screen items-center overflow-hidden bg-[#05060a]">
      <InkFluidCursor />
      <div className="pointer-events-none relative px-8 text-white sm:px-16">
        <p className="text-xs font-semibold tracking-[0.4em] text-white/60">INK FLUID</p>
        <h1 className="mt-4 max-w-3xl text-5xl font-black leading-tight tracking-tight sm:text-7xl">なぞった跡が、流れになる。</h1>
        <p className="mt-5 max-w-md text-sm leading-relaxed text-white/70">カーソルを動かす、またはタップしてください。WebGL の流体シミュレーションでインクがにじみ、渦を巻きます。</p>
      </div>
    </main>
  );
}
