import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { KeyboardEvent, MouseEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Pause, Play, X } from 'lucide-react';

/* =========================================================
 * 動画ヒーロー＋動画モーダル（Video Hero + Modal）
 * - 背景に無音ループ動画（muted autoPlay loop playsInline、poster 付き）。上に見出し＋再生ボタン
 * - 見出しは行ごとにマスクの下からせり上がる（framer-motion の stagger）
 * - 再生ボタンを押すと、ボタンの位置から円が広がる clip-path で暗幕が開き、本編動画のモーダルが出る
 *   （本編は音声ありで controls 付き。開いている間は背景動画を一時停止して負荷を下げる）
 * - 閉じ方：Esc / 背景クリック / × ボタン。閉じた瞬間に本編を pause() し、アンマウントで完全に停止
 * - 背景動画には一時停止ボタンを用意（5 秒以上動くコンテンツは止められるように：WCAG 2.2.2）
 * - prefers-reduced-motion: reduce または navigator.connection.saveData（データセーバー）のときは
 *   動画を読み込まず poster の静止画を表示。モーダルも円の広がりなしでフェードのみ
 * - アクセシビリティ：モーダルは role="dialog" aria-modal、開いたら × へフォーカス、Tab はモーダル内でループ、
 *   閉じたら再生ボタンへフォーカスを戻す
 * ========================================================= */

type Props = {
  /** 見出し（改行 \n で行を分ける） */
  headline?: string;
  /** 見出し下のリード文 */
  lead?: string;
  /** 動画の上に重ねる暗さ（0〜0.9） */
  overlay?: number;
  /** テキストの配置 */
  align?: 'center' | 'left';
  /** アクセント色（再生ボタンの色） */
  accent?: string;
  /** true にすると背景を常に静止画にする（データ節約モードの確認用） */
  forceStill?: boolean;
  /** 背景動画 / 本編動画の URL */
  videoSrc?: string;
  /** poster（静止画）の URL */
  poster?: string;
};

const VIDEO = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
const POSTER = 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1920&q=80';
const EASE = [0.22, 1, 0.36, 1] as const;

type NetworkInfo = { saveData?: boolean; addEventListener?: (t: string, cb: () => void) => void; removeEventListener?: (t: string, cb: () => void) => void };
const getConnection = () => (navigator as Navigator & { connection?: NetworkInfo }).connection;

/** reduced-motion またはデータセーバーなら true */
function useStillPreferred() {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      mq.addEventListener('change', cb);
      const conn = getConnection();
      conn?.addEventListener?.('change', cb);
      return () => {
        mq.removeEventListener('change', cb);
        conn?.removeEventListener?.('change', cb);
      };
    },
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches || getConnection()?.saveData === true,
    () => true,
  );
}

function useReducedMotionOnly() {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      mq.addEventListener('change', cb);
      return () => mq.removeEventListener('change', cb);
    },
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    () => true,
  );
}

export function VideoHeroModal({
  headline = '花がひらく、\nその一瞬を。',
  lead = '季節の移ろいを 4K で記録したブランドフィルム。わずか 10 秒に込めた、静かな物語をご覧ください。',
  overlay = 0.45,
  align = 'center',
  accent = '#f472b6',
  forceStill = false,
  videoSrc = VIDEO,
  poster = POSTER,
}: Props) {
  const preferStill = useStillPreferred();
  const reduce = useReducedMotionOnly();
  const still = forceStill || preferStill;

  const [open, setOpen] = useState(false);
  const [origin, setOrigin] = useState({ x: '50%', y: '50%' });
  const [bgPaused, setBgPaused] = useState(false);
  const bgRef = useRef<HTMLVideoElement>(null);
  const mainRef = useRef<HTMLVideoElement>(null);
  const playBtnRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const openModal = (e: MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setOrigin({ x: `${r.left + r.width / 2}px`, y: `${r.top + r.height / 2}px` });
    bgRef.current?.pause();
    setOpen(true);
  };
  const closeModal = () => {
    mainRef.current?.pause();
    setOpen(false);
    if (!bgPaused) bgRef.current?.play().catch(() => {});
  };

  const toggleBg = () => {
    const v = bgRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
      setBgPaused(false);
    } else {
      v.pause();
      setBgPaused(true);
    }
  };

  // 開いている間：背面スクロールをロックし、× へフォーカス
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const t = window.setTimeout(() => closeRef.current?.focus({ preventScroll: true }), 50);
    return () => {
      document.body.style.overflow = prev;
      window.clearTimeout(t);
    };
  }, [open]);

  const onDialogKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeModal();
      return;
    }
    if (e.key !== 'Tab') return;
    const nodes = dialogRef.current?.querySelectorAll<HTMLElement>('button, video[controls]');
    if (!nodes || nodes.length === 0) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const lines = headline.split('\n');
  const center = align === 'center';

  return (
    <section className="relative isolate flex min-h-[100svh] w-full overflow-hidden bg-slate-950 text-white">
      {/* 背景：動画 or 静止画 */}
      {still ? (
        <img src={poster} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover" data-bg="still" />
      ) : (
        <video
          ref={bgRef}
          className="absolute inset-0 -z-20 h-full w-full object-cover"
          src={videoSrc}
          poster={poster}
          muted
          autoPlay
          loop
          playsInline
          preload="metadata"
          aria-hidden
          tabIndex={-1}
          data-bg="video"
        />
      )}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background: `linear-gradient(180deg, rgba(2,6,23,${overlay * 0.6}) 0%, rgba(2,6,23,${overlay}) 55%, rgba(2,6,23,${Math.min(1, overlay + 0.35)}) 100%)`,
        }}
      />

      <div
        className={`mx-auto flex w-full max-w-6xl flex-col justify-center px-5 py-24 sm:px-10 ${
          center ? 'items-center text-center' : 'items-start text-left'
        }`}
      >
        <motion.p
          initial={{ opacity: 0, y: reduce ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 font-mono text-[11px] tracking-[0.3em] text-white/80 backdrop-blur"
        >
          <span className="size-1.5 rounded-full" style={{ background: accent }} />
          BRAND FILM — 2026
        </motion.p>

        <h1 className="text-[clamp(2.4rem,8vw,6.5rem)] font-bold leading-[1.05] tracking-tight">
          {lines.map((line, i) => (
            <span key={`${i}-${line}`} className="block overflow-hidden pb-[0.08em]">
              <motion.span
                className="block"
                initial={{ y: reduce ? 0 : '110%', opacity: reduce ? 0 : 1 }}
                animate={{ y: '0%', opacity: 1 }}
                transition={{ duration: reduce ? 0.4 : 1.1, ease: EASE, delay: 0.15 + i * 0.12 }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: reduce ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.5 }}
          className="mt-6 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base"
        >
          {lead}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: reduce ? 1 : 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.7 }}
          className="mt-10"
        >
          <button
            ref={playBtnRef}
            type="button"
            onClick={openModal}
            aria-haspopup="dialog"
            data-play
            className="group inline-flex items-center gap-4 rounded-full py-2 pl-2 pr-6 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          >
            <span className="relative grid size-16 place-items-center sm:size-20">
              {!reduce && (
                <>
                  <span aria-hidden className="absolute inset-0 animate-ping rounded-full opacity-30 [animation-duration:2.4s]" style={{ background: accent }} />
                  <span aria-hidden className="absolute -inset-2 rounded-full border border-white/20 transition-[scale] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110" />
                </>
              )}
              <span
                className="relative grid size-full place-items-center rounded-full text-slate-950 shadow-2xl transition-[scale] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105 group-active:scale-95"
                style={{ background: accent, boxShadow: `0 20px 60px -10px ${accent}` }}
              >
                <Play className="ml-1 size-6 fill-current sm:size-7" aria-hidden />
              </span>
            </span>
            <span className="flex flex-col items-start leading-tight">
              <span>フィルムを再生</span>
              <span className="font-mono text-[11px] font-normal tracking-widest text-white/60">0:10 / SOUND ON</span>
            </span>
          </button>
        </motion.div>
      </div>

      {!still && (
        <button
          type="button"
          onClick={toggleBg}
          aria-label={bgPaused ? '背景動画を再生' : '背景動画を一時停止'}
          aria-pressed={bgPaused}
          data-bg-toggle
          className="absolute bottom-5 right-5 grid size-10 place-items-center rounded-full border border-white/20 bg-black/30 text-white/80 backdrop-blur transition-colors hover:bg-black/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          {bgPaused ? <Play className="size-4" aria-hidden /> : <Pause className="size-4" aria-hidden />}
        </button>
      )}

      <AnimatePresence onExitComplete={() => playBtnRef.current?.focus({ preventScroll: true })}>
        {open && (
          <motion.div
            key="modal"
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="ブランドフィルム"
            onKeyDown={onDialogKey}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-10"
          >
            <motion.div
              aria-hidden
              data-backdrop
              onClick={closeModal}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm"
              initial={reduce ? { opacity: 0 } : { clipPath: `circle(0px at ${origin.x} ${origin.y})` }}
              animate={reduce ? { opacity: 1 } : { clipPath: `circle(150vmax at ${origin.x} ${origin.y})` }}
              exit={reduce ? { opacity: 0 } : { clipPath: `circle(0px at ${origin.x} ${origin.y})` }}
              transition={{ duration: reduce ? 0.25 : 0.8, ease: [0.76, 0, 0.24, 1] }}
            />
            <motion.div
              className="relative w-full max-w-5xl"
              initial={{ opacity: 0, y: reduce ? 0 : 40, scale: reduce ? 1 : 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: EASE, delay: reduce ? 0 : 0.35 } }}
              exit={{ opacity: 0, y: reduce ? 0 : 20, scale: reduce ? 1 : 0.97, transition: { duration: 0.25 } }}
            >
              <video
                ref={mainRef}
                className="aspect-video w-full rounded-2xl bg-black shadow-2xl shadow-black/60 ring-1 ring-white/10"
                src={videoSrc}
                poster={poster}
                controls
                autoPlay
                playsInline
                data-main-video
              />
              <button
                ref={closeRef}
                type="button"
                onClick={closeModal}
                aria-label="動画を閉じる"
                data-close
                className="absolute -top-14 right-0 grid size-11 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <X className="size-5" aria-hidden />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default function App() {
  return (
    <main className="bg-slate-950">
      <VideoHeroModal />
    </main>
  );
}
