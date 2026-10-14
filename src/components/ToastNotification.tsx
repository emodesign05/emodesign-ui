import { useState } from 'react';
import type { CSSProperties } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';

/* =========================================================
 * トースト通知（Toast Notification）
 * - 画面端（右上 / 右下 / 上中央 / 下中央 / 左上 / 左下）に、通知カードを積み重ねて表示
 * - 種類は「成功 / 警告 / エラー / 情報」の4つ。配色とアイコンで一目で区別できる
 * - 自動で消える：下端の進捗バー（CSS アニメーション）が縮みきったら閉じる
 *   → animationend を合図にするので、JS のタイマーと見た目がずれない
 * - スタックにホバー（またはキーボードでフォーカス）している間は、全トーストのタイマーを一時停止
 * - 閉じるボタン付き。最大表示数を超えたら古いものから自動で消える
 * - アクセシビリティ：コンテナは aria-live="polite"（通常は落ち着いて読み上げ）
 *   エラーだけ role="alert" で即時に読み上げる。閉じるボタンには aria-label
 * - reduced-motion 時：スライド・拡大の動きを止め、フェードだけで出し入れ（タイマーは同じく動く）
 * ========================================================= */

export type ToastType = 'success' | 'warning' | 'error' | 'info';
export type ToastPosition = 'top-right' | 'bottom-right' | 'top-center' | 'bottom-center' | 'top-left' | 'bottom-left';

export type ToastItem = {
  id: string | number;
  type: ToastType;
  title: string;
  description?: string;
};

type Props = {
  /** 表示中のトースト（新しいものを末尾に追加） */
  toasts?: ToastItem[];
  /** トーストを閉じるときに呼ばれる（自動・手動とも） */
  onDismiss?: (id: ToastItem['id']) => void;
  /** 表示位置 */
  position?: ToastPosition;
  /** 自動で消えるまでの時間（秒）。0 で自動では消えない */
  duration?: number;
  /** 同時に表示する最大数（2〜8） */
  max?: number;
  /** ホバー / フォーカス中はタイマーを止める */
  pauseOnHover?: boolean;
  /** 残り時間の進捗バーを表示 */
  showProgress?: boolean;
};

const STYLES: Record<ToastType, { icon: typeof Info; label: string; iconWrap: string; bar: string; ring: string }> = {
  success: {
    icon: CheckCircle2,
    label: '成功',
    iconWrap: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
    bar: 'bg-emerald-500',
    ring: 'before:bg-emerald-500',
  },
  warning: {
    icon: AlertTriangle,
    label: '警告',
    iconWrap: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
    bar: 'bg-amber-500',
    ring: 'before:bg-amber-500',
  },
  error: {
    icon: XCircle,
    label: 'エラー',
    iconWrap: 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400',
    bar: 'bg-rose-500',
    ring: 'before:bg-rose-500',
  },
  info: {
    icon: Info,
    label: 'お知らせ',
    iconWrap: 'bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400',
    bar: 'bg-sky-500',
    ring: 'before:bg-sky-500',
  },
};

const POSITION_CLASS: Record<ToastPosition, string> = {
  'top-right': 'top-0 right-0 items-end',
  'bottom-right': 'bottom-0 right-0 items-end',
  'top-center': 'top-0 left-1/2 -translate-x-1/2 items-center',
  'bottom-center': 'bottom-0 left-1/2 -translate-x-1/2 items-center',
  'top-left': 'top-0 left-0 items-start',
  'bottom-left': 'bottom-0 left-0 items-start',
};

export function ToastNotification({
  toasts = [],
  onDismiss,
  position = 'top-right',
  duration = 5,
  max = 4,
  pauseOnHover = true,
  showProgress = true,
}: Props) {
  const reduce = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const paused = pauseOnHover && (hovered || focused);

  const isTop = position.startsWith('top');
  const fromX = position.endsWith('right') ? 48 : position.endsWith('left') ? -48 : 0;
  const fromY = position.endsWith('center') ? (isTop ? -32 : 32) : 0;

  // 最大数を超えた分は表示しない（古いもの＝先頭から落とす）
  const visible = toasts.slice(-Math.max(1, max));
  // 上配置なら新しいものを上に、下配置なら新しいものを下に積む
  const ordered = isTop ? [...visible].reverse() : visible;

  return (
    <section
      aria-label="通知"
      className={`pointer-events-none fixed z-[100] flex w-full max-w-[420px] flex-col p-4 sm:p-6 ${POSITION_CLASS[position]}`}
    >
      <ol
        aria-live="polite"
        aria-relevant="additions"
        className="flex w-full flex-col gap-3"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
        }}
      >
        <AnimatePresence initial={false} mode="popLayout">
          {ordered.map((t) => {
            const s = STYLES[t.type];
            const Icon = s.icon;
            const barStyle: CSSProperties = {
              animation: `toast-progress ${duration}s linear forwards`,
              animationPlayState: paused ? 'paused' : 'running',
            };
            return (
              <motion.li
                key={t.id}
                layout={!reduce}
                initial={reduce ? { opacity: 0 } : { opacity: 0, x: fromX, y: fromY, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, x: fromX * 0.6, scale: 0.94, transition: { duration: 0.18 } }}
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                role={t.type === 'error' ? 'alert' : 'status'}
                className={`pointer-events-auto relative w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_12px_40px_-12px_rgba(15,23,42,0.25)] backdrop-blur-xl before:absolute before:inset-y-0 before:left-0 before:w-1 dark:border-slate-700/70 dark:bg-slate-900/95 ${s.ring}`}
              >
                <div className="flex items-start gap-3 py-3.5 pl-4 pr-3">
                  <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${s.iconWrap}`} aria-hidden="true">
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      <span className="sr-only">{s.label}：</span>
                      {t.title}
                    </p>
                    {t.description && (
                      <p className="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{t.description}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => onDismiss?.(t.id)}
                    aria-label={`「${t.title}」を閉じる`}
                    className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {duration > 0 && (
                  // 進捗バー：縮みきったら（animationend）自動で閉じる。非表示でもタイマーとして動かす
                  <div className={`absolute inset-x-0 bottom-0 h-[3px] ${showProgress ? 'bg-slate-100 dark:bg-slate-800' : 'opacity-0'}`} aria-hidden="true">
                    <div
                      className={`h-full origin-left ${s.bar}`}
                      style={barStyle}
                      onAnimationEnd={() => onDismiss?.(t.id)}
                    />
                  </div>
                )}
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ol>
      <style>{`@keyframes toast-progress { from { transform: scaleX(1); } to { transform: scaleX(0); } }`}</style>
    </section>
  );
}

/* ---------- デモ ---------- */

const SAMPLES: Record<ToastType, Omit<ToastItem, 'id' | 'type'>[]> = {
  success: [
    { title: '保存しました', description: '「春のキャンペーンLP」の変更内容を保存しました。' },
    { title: '送信が完了しました', description: 'お問い合わせを受け付けました。担当より2営業日以内にご連絡します。' },
  ],
  warning: [
    { title: 'ストレージ残りわずか', description: '使用容量が90%を超えました。不要なファイルを整理してください。' },
    { title: '未保存の変更があります', description: 'このまま移動すると編集内容が失われます。' },
  ],
  error: [
    { title: 'アップロードに失敗しました', description: 'ファイルサイズが上限（20MB）を超えています。' },
    { title: '通信エラー', description: 'ネットワークに接続できません。時間をおいて再度お試しください。' },
  ],
  info: [
    { title: '新しいバージョンがあります', description: 'v2.4 では書き出し速度が約2倍になりました。' },
    { title: 'メンテナンスのお知らせ', description: '10月20日 2:00〜4:00 は一部機能が利用できません。' },
  ],
};

const BUTTONS: { type: ToastType; label: string; cls: string; icon: typeof Info }[] = [
  { type: 'success', label: '成功', icon: CheckCircle2, cls: 'text-emerald-600 dark:text-emerald-400' },
  { type: 'warning', label: '警告', icon: AlertTriangle, cls: 'text-amber-600 dark:text-amber-400' },
  { type: 'error', label: 'エラー', icon: XCircle, cls: 'text-rose-600 dark:text-rose-400' },
  { type: 'info', label: '情報', icon: Info, cls: 'text-sky-600 dark:text-sky-400' },
];

/** デモ用の画面（トーストを出すボタン群＋トースト本体） */
export function ToastNotificationDemo(props: Omit<Props, 'toasts' | 'onDismiss'>) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [count, setCount] = useState(0);

  const push = (type: ToastType) => {
    const list = SAMPLES[type];
    const sample = list[count % list.length];
    setCount((c) => c + 1);
    setToasts((prev) => [...prev, { id: `${Date.now()}-${count}`, type, ...sample }]);
  };
  const dismiss = (id: ToastItem['id']) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 sm:p-6 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-8 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
        <p className="text-xs font-semibold tracking-[0.25em] text-indigo-600 dark:text-indigo-400">NOTIFICATIONS</p>
        <h2 className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl dark:text-slate-100">トースト通知</h2>
        <p className="mt-2 text-xs leading-relaxed text-slate-500 sm:text-sm dark:text-slate-400">
          ボタンを押すと通知が積み重なって表示されます。通知にカーソルを乗せている間は、自動で消えるタイマーが止まります。
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          {BUTTONS.map((b) => {
            const Icon = b.icon;
            return (
              <button
                key={b.type}
                type="button"
                id={`toast-${b.type}`}
                onClick={() => push(b.type)}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 active:translate-y-0 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600"
              >
                <Icon className={`h-4 w-4 ${b.cls}`} aria-hidden="true" />
                {b.label}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          id="toast-clear"
          onClick={() => setToasts([])}
          disabled={toasts.length === 0}
          className="mt-3 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 dark:focus-visible:ring-offset-slate-900"
        >
          すべて閉じる（{toasts.length}）
        </button>
      </div>
      <ToastNotification {...props} toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}

export default function App() {
  return <ToastNotificationDemo />;
}
