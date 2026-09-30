import React from "react";
import {
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";

type HighConversionCTAProps = {
  onClick?: () => void;
  className?: string;
  /** キャッチコピー（\n で改行） */
  catchCopy?: string;
  /** ベネフィット文 */
  benefit?: string;
  /** ボタンのラベル */
  buttonLabel?: string;
  /** 上部のバッジ文言 */
  badge?: string;
};

// ==========================================
// 1. CTAボタンコンポーネント本体
// ==========================================

const CATCH_COPY = "あなたの開発体験を\n次のレベルへ引き上げる";
const BENEFIT_TEXT = "数クリックでAIがコードを即座に生成。今すぐ無料体験を。";
const BUTTON_LABEL = "今すぐ無料で登録する";
const SUB_TEXTS = ["1分で登録完了", "クレジットカード不要"];

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
      when: "beforeChildren",
      staggerChildren: 0.12,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const shimmerVariants: Variants = {
  rest: {
    x: "-160%",
    transition: { duration: 0 },
  },
  hover: {
    x: "320%",
    transition: { duration: 0.9, ease: "easeInOut" },
  },
};

const arrowVariants: Variants = {
  rest: { x: 0 },
  hover: {
    x: 5,
    transition: { type: "spring", stiffness: 320, damping: 14 },
  },
};

// ==========================================
// 2. メインアプリケーション実行
// ==========================================

export default function HighConversionCTA({
  onClick,
  className = "",
  catchCopy = CATCH_COPY,
  benefit = BENEFIT_TEXT,
  buttonLabel = BUTTON_LABEL,
  badge = "AI Code Generation",
}: HighConversionCTAProps): React.ReactElement {
  const reduceMotion = useReducedMotion();

  return (
    <section
      className={`w-full bg-slate-950 px-4 py-16 sm:px-6 sm:py-20 lg:px-8 ${className}`}
    >
      <motion.div
        variants={containerVariants}
        initial={reduceMotion ? "visible" : "hidden"}
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900 px-6 py-14 shadow-2xl shadow-indigo-950/60 ring-1 ring-white/10 sm:px-12 sm:py-20 lg:px-20"
      >
        {/* 装飾: 流れる光のブロブ */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-indigo-500/30 blur-3xl"
          animate={
            reduceMotion
              ? undefined
              : { x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.15, 1] }
          }
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -right-24 h-80 w-80 rounded-full bg-purple-500/30 blur-3xl"
          animate={
            reduceMotion
              ? undefined
              : { x: [0, -50, 0], y: [0, -30, 0], scale: [1, 1.2, 1] }
          }
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* 装飾: 上部のハイライトライン */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
        />

        {/* 装飾: グリッドパターン */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
        />

        <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center">
          {/* バッジ */}
          <motion.div
            variants={itemVariants}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm font-medium text-indigo-100 backdrop-blur-md"
          >
            <motion.span
              className="inline-flex"
              animate={
                reduceMotion
                  ? undefined
                  : { rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }
              }
              transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="h-4 w-4 text-yellow-300" aria-hidden="true" />
            </motion.span>
            <span>{badge}</span>
          </motion.div>

          {/* キャッチコピー */}
          <motion.h2
            variants={itemVariants}
            className="whitespace-pre-line bg-gradient-to-b from-white to-indigo-200 bg-clip-text text-3xl font-extrabold leading-tight tracking-tight text-transparent sm:text-4xl md:text-5xl"
          >
            {catchCopy}
          </motion.h2>

          {/* ベネフィット文 */}
          <motion.p
            variants={itemVariants}
            className="mt-5 max-w-2xl text-base leading-relaxed text-indigo-100/80 sm:text-lg"
          >
            {benefit}
          </motion.p>

          {/* CTAボタン */}
          <motion.div variants={itemVariants} className="mt-10 w-full sm:w-auto">
            <motion.button
              type="button"
              onClick={onClick}
              initial="rest"
              animate="rest"
              whileHover="hover"
              whileFocus="hover"
              whileTap={{ scale: 0.97 }}
              className="group relative inline-flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 px-8 py-4 text-base font-bold text-white shadow-xl shadow-indigo-500/40 ring-1 ring-white/20 transition-shadow duration-300 hover:shadow-2xl hover:shadow-purple-500/50 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/50 sm:w-auto sm:px-10 sm:text-lg"
            >
              {/* Shimmer: 光彩が走る */}
              <motion.span
                aria-hidden="true"
                variants={reduceMotion ? undefined : shimmerVariants}
                className="pointer-events-none absolute inset-y-0 left-0 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/60 to-transparent"
              />

              <Sparkles
                className="relative z-10 h-5 w-5 text-yellow-200"
                aria-hidden="true"
              />
              <span className="relative z-10">{buttonLabel}</span>
              <motion.span
                variants={reduceMotion ? undefined : arrowVariants}
                className="relative z-10 inline-flex"
              >
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </motion.span>
            </motion.button>
          </motion.div>

          {/* 補助テキスト */}
          <motion.ul
            variants={itemVariants}
            className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-indigo-100/90"
          >
            {SUB_TEXTS.map((text) => (
              <li key={text} className="inline-flex items-center gap-1.5">
                <CheckCircle2
                  className="h-4 w-4 text-emerald-400"
                  aria-hidden="true"
                />
                <span>{text}</span>
              </li>
            ))}
          </motion.ul>
        </div>
      </motion.div>
    </section>
  );
}