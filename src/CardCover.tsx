import { useEffect, useRef, useState } from 'react';
import { COVER_NAMES } from './coverManifest';

/* =========================================================
 * 一覧カードのカバー（静止画 → 動画）
 * - 普段は軽い静止画（public/covers/thumbs/<名前>.webp）だけを表示
 * - PC：カードにマウスを乗せる／キーボードでフォーカスすると短い動画（public/covers/clips/<名前>.mp4）を再生
 * - スマホ・タブレット：カードが画面の中央付近に入ったら自動で再生、外れたら停止
 * - 動画は再生する時に初めて読み込む（一覧を開いた時点では 1 本も読み込まない）
 * - prefers-reduced-motion 時は静止画のまま
 * - カバーが無いコンポーネントは、カテゴリ色のプレースホルダーを表示
 * ========================================================= */

type Props = {
  name: string;
  /** 親カードがホバー／フォーカス中か */
  active: boolean;
  /** カバーが無い時に出す名前 */
  label: string;
  /** カテゴリの色（Tailwind の bg-* クラス） */
  dot: string;
};

const canHover = () => typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const reduceMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function CardCover({ name, active, label, dot }: Props) {
  const has = COVER_NAMES.has(name);
  const boxRef = useRef<HTMLSpanElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);
  const [loaded, setLoaded] = useState(false); // 一度でも再生を始めたら video を置いたままにする
  const [playing, setPlaying] = useState(false);

  // タッチ端末：画面の中央付近に入ったカードだけ再生
  useEffect(() => {
    if (!has || canHover() || reduceMotion()) return;
    const el = boxRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: '-30% 0px -30% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [has]);

  const shouldPlay = has && !reduceMotion() && (active || inView);
  if (shouldPlay && !loaded) setLoaded(true);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (shouldPlay) {
      v.play().catch(() => {});
    } else {
      v.pause();
      v.currentTime = 0;
    }
  }, [shouldPlay, loaded]);

  if (!has) {
    return (
      <span className="relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
        <span className={`absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-20 blur-2xl ${dot}`} aria-hidden />
        <span className={`absolute -bottom-8 -left-4 h-20 w-20 rounded-full opacity-15 blur-2xl ${dot}`} aria-hidden />
        <span className="relative px-6 text-center text-sm font-bold text-slate-400 dark:text-slate-500">{label}</span>
      </span>
    );
  }

  return (
    <span ref={boxRef} className="relative block aspect-[16/10] w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
      <img
        src={`/covers/thumbs/${name}.webp`}
        alt=""
        loading="lazy"
        decoding="async"
        width={640}
        height={400}
        className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
      />
      {loaded && (
        <video
          ref={videoRef}
          src={`/covers/clips/${name}.mp4`}
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden
          onPlaying={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${playing ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
    </span>
  );
}
