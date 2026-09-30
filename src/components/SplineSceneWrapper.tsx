import { Component, Suspense, lazy, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Box, RotateCcw } from 'lucide-react';
import type { Application } from '@splinetool/runtime';

/* =========================================================
 * Spline 3D埋め込みコンテナ（Spline 3D Scene Wrapper with Loader）
 * - Spline で作った3Dシーン（.splinecode）を埋め込む汎用ラッパー
 * - 画面に近づくまで読み込みを遅延（IntersectionObserver）→ 初期表示を重くしない
 * - ランタイム本体も React.lazy で分割読み込み
 * - 読み込み中はスケルトン＋スピナー、完了したらフェードイン
 * - 読み込み失敗時はエラー表示と「再読み込み」ボタン（ErrorBoundary）
 * - onLoad で Spline の Application を受け取れる（オブジェクト操作に利用可）
 * ========================================================= */

const Spline = lazy(() => import('@splinetool/react-spline'));

/** デモ用の公開シーン。自分のシーンは Spline の Export → Code → React の URL に差し替え */
const DEMO_SCENE = 'https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode';

class SceneErrorBoundary extends Component<{ children: ReactNode; onRetry: () => void }, { error: boolean }> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div role="alert" className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center text-sm text-slate-300">
        <AlertTriangle className="h-6 w-6 text-amber-400" aria-hidden />
        3Dシーンを読み込めませんでした
        <button
          type="button"
          onClick={() => {
            this.setState({ error: false });
            this.props.onRetry();
          }}
          className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        >
          <RotateCcw className="h-3.5 w-3.5" /> 再読み込み
        </button>
      </div>
    );
  }
}

function Loader() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-900"
      role="status"
      aria-live="polite"
    >
      <div className="relative h-14 w-14">
        <span className="absolute inset-0 rounded-full border-2 border-white/10" />
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-indigo-400 motion-reduce:animate-none" />
        <Box className="absolute inset-0 m-auto h-5 w-5 text-indigo-300" aria-hidden />
      </div>
      <span className="text-xs tracking-widest text-slate-400">3Dシーンを読み込み中…</span>
    </motion.div>
  );
}

type SplineSceneProps = {
  scene: string;
  /** 画面の何px手前から読み込みを始めるか */
  preloadMargin?: string;
  onLoad?: (app: Application) => void;
  className?: string;
};

export function SplineScene({ scene, preloadMargin = '300px', onLoad, className = '' }: SplineSceneProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: preloadMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [preloadMargin]);

  return (
    <div ref={ref} className={`relative overflow-hidden bg-slate-900 ${className}`}>
      <SceneErrorBoundary
        onRetry={() => {
          setLoaded(false);
          setAttempt((n) => n + 1);
        }}
      >
        {inView && (
          <Suspense fallback={null}>
            <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: loaded ? 1 : 0 }} transition={{ duration: 0.8 }}>
              <Spline
                key={attempt}
                scene={scene}
                onLoad={(app) => {
                  setLoaded(true);
                  onLoad?.(app);
                }}
                style={{ width: '100%', height: '100%' }}
              />
            </motion.div>
          </Suspense>
        )}
        <AnimatePresence>{!loaded && <Loader key="loader" />}</AnimatePresence>
      </SceneErrorBoundary>
    </div>
  );
}

export default function App() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white sm:px-8">
      <section className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <p className="text-xs font-semibold tracking-[0.3em] text-indigo-400">SPLINE EMBED</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">ノーコードの3Dを、そのまま組み込む。</h1>
          <p className="mt-5 text-sm leading-relaxed text-slate-400">
            Spline で作ったシーンの URL を渡すだけ。画面に近づいてから読み込み、準備ができたらフェードインします。シーン内をドラッグすると視点を動かせます。
          </p>
        </div>
        <SplineScene scene={DEMO_SCENE} className="h-[520px] rounded-3xl border border-white/10 lg:col-span-3" />
      </section>
    </main>
  );
}
