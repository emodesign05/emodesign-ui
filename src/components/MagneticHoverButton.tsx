import { useRef } from 'react';
import type { PointerEvent, ReactNode } from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Play, Mail } from 'lucide-react';

/* =========================================================
 * マグネティックボタン（Magnetic Hover Button）
 * - カーソルに吸い寄せられるように本体が追従し、ラベルはさらに大きく動く（2層パララックス）
 * - ホバー時に下から塗りが立ち上がる
 * - prefers-reduced-motion 時は吸着を止め、色変化のみ
 * ========================================================= */

type MagneticButtonProps = {
  children: ReactNode;
  /** 本体の吸着量（0〜1）。ボタン中心からのズレに対する移動率 */
  strength?: number;
  /** ラベルの吸着量（本体より大きくすると奥行きが出る） */
  labelStrength?: number;
  variant?: 'solid' | 'outline' | 'circle';
  onClick?: () => void;
  ariaLabel?: string;
};

const SPRING = { stiffness: 220, damping: 18, mass: 0.6 };

export function MagneticButton({
  children,
  strength = 0.35,
  labelStrength = 0.55,
  variant = 'solid',
  onClick,
  ariaLabel,
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const lx = useMotionValue(0);
  const ly = useMotionValue(0);
  const sx = useSpring(x, SPRING);
  const sy = useSpring(y, SPRING);
  const slx = useSpring(lx, SPRING);
  const sly = useSpring(ly, SPRING);

  const handleMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduceMotion || e.pointerType !== 'mouse' || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    x.set(dx * strength);
    y.set(dy * strength);
    lx.set(dx * labelStrength * 0.5);
    ly.set(dy * labelStrength * 0.5);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
    lx.set(0);
    ly.set(0);
  };

  const base =
    'group relative isolate inline-flex items-center justify-center overflow-hidden font-semibold outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950';
  const variants: Record<NonNullable<MagneticButtonProps['variant']>, string> = {
    solid:
      'h-14 rounded-full bg-slate-900 px-8 text-sm text-white hover:text-white dark:bg-white dark:text-slate-900 dark:hover:text-white',
    outline:
      'h-14 rounded-full border border-slate-300 px-8 text-sm text-slate-900 hover:text-white dark:border-slate-700 dark:text-slate-100',
    circle:
      'h-24 w-24 rounded-full border border-slate-300 text-slate-900 hover:text-white dark:border-slate-700 dark:text-slate-100',
  };

  return (
    // 吸着判定エリア（見た目より一回り広く取り、吸い寄せを自然にする）
    <div className="p-4" onPointerMove={handleMove} onPointerLeave={reset}>
      <motion.button
        ref={ref}
        type="button"
        onClick={onClick}
        onBlur={reset}
        aria-label={ariaLabel}
        style={{ x: sx, y: sy }}
        className={`${base} ${variants[variant]}`}
      >
        {/* ホバーで下から立ち上がる塗り */}
        <span
          aria-hidden
          className="absolute inset-0 -z-10 translate-y-full rounded-[inherit] bg-indigo-600 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-focus-visible:translate-y-0 motion-reduce:transition-none"
        />
        <motion.span style={{ x: slx, y: sly }} className="relative flex items-center gap-2">
          {children}
        </motion.span>
      </motion.button>
    </div>
  );
}

export default function App() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-12 bg-white px-6 py-20 dark:bg-slate-950">
      <header className="text-center">
        <p className="text-xs font-semibold tracking-[0.3em] text-indigo-600 dark:text-indigo-400">MAGNETIC BUTTON</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl dark:text-white">カーソルに吸い寄せられるボタン</h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">ボタンの周囲にマウスを近づけてみてください。</p>
      </header>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <MagneticButton variant="solid">
          お問い合わせ <ArrowUpRight className="h-4 w-4" />
        </MagneticButton>
        <MagneticButton variant="outline" strength={0.25} labelStrength={0.4}>
          <Mail className="h-4 w-4" /> 資料請求
        </MagneticButton>
        <MagneticButton variant="circle" strength={0.45} labelStrength={0.7} ariaLabel="動画を再生">
          <Play className="h-6 w-6" />
        </MagneticButton>
      </div>
    </main>
  );
}
