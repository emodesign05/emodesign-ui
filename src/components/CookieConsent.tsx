import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { BarChart3, Cookie, Lock, Megaphone, RotateCcw, Settings2, X } from 'lucide-react';

/* =========================================================
 * Cookie同意バナー（Cookie Consent Banner）
 * - 初回訪問時に画面下からバナーを表示。「すべて同意」「必要なもののみ」「詳細設定」の3択
 * - 「詳細設定」でモーダルを開き、分類（必須・分析・広告）ごとにオン / オフを選べる
 *   必須 Cookie はサイトの動作に必要なので常にオン（切替不可）
 * - 選んだ内容は localStorage に JSON で保存（使えない環境でも try/catch で落ちない）
 *   保存済みなら次回からバナーを出さない。onSave で選択内容を受け取り、計測タグの読み込み判定などに使う
 * - layout = 'bar'（全幅の帯）/ 'card'（左下の小さなカード）
 * - アクセシビリティ：バナーは role="region"、モーダルは role="dialog" aria-modal
 *   開いたら最初の操作要素へフォーカス、Tab は中で循環、Esc で閉じて元のボタンへフォーカスを戻す
 *   トグルは role="switch" + aria-checked
 * - reduced-motion 時：スライドインをやめてフェードのみ
 * ========================================================= */

export type ConsentState = { necessary: true; analytics: boolean; marketing: boolean; savedAt: string };

const ACCENTS = {
  indigo: { btn: 'bg-indigo-600 hover:bg-indigo-700 focus-visible:ring-indigo-500', on: 'bg-indigo-600', text: 'text-indigo-600 dark:text-indigo-400' },
  emerald: { btn: 'bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-500', on: 'bg-emerald-600', text: 'text-emerald-600 dark:text-emerald-400' },
  slate: { btn: 'bg-slate-900 hover:bg-slate-800 focus-visible:ring-slate-500 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200', on: 'bg-slate-900 dark:bg-slate-100', text: 'text-slate-900 dark:text-slate-100' },
  rose: { btn: 'bg-rose-600 hover:bg-rose-700 focus-visible:ring-rose-500', on: 'bg-rose-600', text: 'text-rose-600 dark:text-rose-400' },
} as const;

type Props = {
  /** 見た目：bar＝画面下の全幅帯 / card＝左下のカード */
  layout?: 'bar' | 'card';
  /** アクセント色 */
  accent?: keyof typeof ACCENTS;
  /** ページ表示からバナーが出るまでの待ち時間（秒） */
  delay?: number;
  /** 選択内容を保存する localStorage のキー */
  storageKey?: string;
  /** プライバシーポリシーのURL */
  policyHref?: string;
  /** 保存したときに呼ばれる */
  onSave?: (consent: ConsentState) => void;
};

const CATEGORIES = [
  { key: 'necessary', label: '必須', icon: Lock, desc: 'ログイン状態の維持やフォーム送信など、サイトの基本機能に必要です。無効にはできません。' },
  { key: 'analytics', label: '分析', icon: BarChart3, desc: 'ページの閲覧数や滞在時間を匿名で集計し、サイトの改善に役立てます。' },
  { key: 'marketing', label: '広告', icon: Megaphone, desc: '興味に合わせた広告の表示や、広告効果の測定に使用します。' },
] as const;

function readConsent(key: string): ConsentState | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as ConsentState) : null;
  } catch {
    return null;
  }
}

function Switch({ checked, disabled, onChange, label, onClass }: { checked: boolean; disabled?: boolean; onChange?: (v: boolean) => void; label: string; onClass: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:ring-offset-slate-900 ${checked ? onClass : 'bg-slate-300 dark:bg-slate-700'}`}
    >
      <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform motion-reduce:transition-none ${checked ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
    </button>
  );
}

export function CookieConsent({
  layout = 'bar',
  accent = 'indigo',
  delay = 0.6,
  storageKey = 'cookie-consent:v1',
  policyHref = '#privacy',
  onSave,
}: Props) {
  const reduce = useReducedMotion();
  const a = ACCENTS[accent];
  const titleId = useId();
  const [saved, setSaved] = useState(() => readConsent(storageKey) !== null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState(() => {
    const c = readConsent(storageKey);
    return { analytics: c?.analytics ?? false, marketing: c?.marketing ?? false };
  });
  const dialogRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);

  // 少し待ってから出す（setState はタイマー内）
  useEffect(() => {
    const id = window.setTimeout(() => setReady(true), Math.max(0, delay) * 1000);
    return () => window.clearTimeout(id);
  }, [delay]);

  // モーダルを開いたら最初の操作要素へフォーカス
  useEffect(() => {
    if (!open) return;
    const id = window.requestAnimationFrame(() => {
      dialogRef.current?.querySelector<HTMLElement>('button:not([disabled])')?.focus();
    });
    return () => window.cancelAnimationFrame(id);
  }, [open]);

  const save = (analytics: boolean, marketing: boolean) => {
    const consent: ConsentState = { necessary: true, analytics, marketing, savedAt: new Date().toISOString() };
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(consent));
    } catch {
      /* 保存できない環境では、このページ表示中だけ反映 */
    }
    setPrefs({ analytics, marketing });
    setOpen(false);
    setSaved(true);
    onSave?.(consent);
  };

  const closeDialog = () => {
    setOpen(false);
    openerRef.current?.focus();
  };

  // Esc で閉じる / Tab をモーダル内で循環
  const onDialogKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      closeDialog();
      return;
    }
    if (e.key !== 'Tab') return;
    const items = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]') ?? []);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const showBanner = ready && !saved;
  const isCard = layout === 'card';

  return (
    <>
      <AnimatePresence>
        {showBanner && (
          <motion.section
            role="region"
            aria-label="Cookie の利用について"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 40 }}
            transition={{ type: 'spring', stiffness: 300, damping: 32 }}
            className={
              isCard
                ? 'fixed inset-x-3 bottom-3 z-[90] sm:inset-x-auto sm:bottom-6 sm:left-6 sm:w-[400px]'
                : 'fixed inset-x-0 bottom-0 z-[90] p-3 sm:p-4'
            }
          >
            <div
              className={`rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-[0_20px_60px_-15px_rgba(15,23,42,0.35)] backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-900/95 ${
                isCard ? '' : 'mx-auto max-w-5xl sm:flex sm:items-center sm:gap-6 sm:p-6'
              }`}
            >
              <div className={`flex gap-3.5 ${isCard ? '' : 'sm:flex-1'}`}>
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 ${a.text}`} aria-hidden="true">
                  <Cookie className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Cookie の利用について</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    当サイトでは、利便性の向上やアクセス解析のために Cookie を使用しています。詳しくは
                    <a href={policyHref} className={`mx-0.5 font-semibold underline underline-offset-2 focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${a.text}`}>
                      プライバシーポリシー
                    </a>
                    をご覧ください。
                  </p>
                </div>
              </div>
              <div className={`mt-4 gap-2 ${isCard ? 'grid grid-cols-2' : 'flex flex-col-reverse sm:mt-0 sm:shrink-0 sm:flex-row'}`}>
                <button
                  ref={openerRef}
                  type="button"
                  id="cookie-settings"
                  onClick={() => setOpen(true)}
                  aria-haspopup="dialog"
                  className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-4 ${isCard ? 'order-last col-span-2 py-2' : 'py-2.5'} text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white`}
                >
                  <Settings2 className="h-4 w-4" aria-hidden="true" />
                  詳細設定
                </button>
                <button
                  type="button"
                  id="cookie-necessary"
                  onClick={() => save(false, false)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  必要なもののみ
                </button>
                <button
                  type="button"
                  id="cookie-accept"
                  onClick={() => save(true, true)}
                  className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${a.btn}`}
                >
                  すべて同意
                </button>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[110] flex items-end justify-center p-0 sm:items-center sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={closeDialog} aria-hidden="true" />
            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              onKeyDown={onDialogKeyDown}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 32, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 360, damping: 32 }}
              className="relative max-h-[90vh] w-full overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:max-w-lg sm:rounded-3xl sm:p-8 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 id={titleId} className="text-lg font-bold text-slate-900 dark:text-slate-100">Cookie の詳細設定</h2>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">利用目的ごとに、許可するかどうかを選べます。設定はあとから変更できます。</p>
                </div>
                <button
                  type="button"
                  onClick={closeDialog}
                  aria-label="詳細設定を閉じる"
                  className="-mr-2 -mt-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <ul className="mt-6 divide-y divide-slate-100 rounded-2xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
                {CATEGORIES.map((c) => {
                  const Icon = c.icon;
                  const locked = c.key === 'necessary';
                  const checked = locked ? true : prefs[c.key];
                  return (
                    <li key={c.key} className="flex gap-3 p-4">
                      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${a.text}`} aria-hidden="true" />
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                          {c.label}
                          {locked && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">常に有効</span>}
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{c.desc}</p>
                      </div>
                      <Switch
                        checked={checked}
                        disabled={locked}
                        label={`${c.label} Cookie`}
                        onClass={a.on}
                        onChange={locked ? undefined : (v) => setPrefs((p) => ({ ...p, [c.key]: v }))}
                      />
                    </li>
                  );
                })}
              </ul>

              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  id="cookie-save"
                  onClick={() => save(prefs.analytics, prefs.marketing)}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  選択した内容で保存
                </button>
                <button
                  type="button"
                  onClick={() => save(true, true)}
                  className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${a.btn}`}
                >
                  すべて同意
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ---------- デモ ---------- */

const yesNo = (v: boolean) => (v ? '許可' : '拒否');

/** デモ用のページ（現在の同意状態の表示＋リセット） */
export function CookieConsentDemo(props: Omit<Props, 'onSave'>) {
  const storageKey = props.storageKey ?? 'cookie-consent:v1';
  const [consent, setConsent] = useState(() => readConsent(storageKey));
  const [version, setVersion] = useState(0);

  const reset = () => {
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      /* 何もしない */
    }
    setConsent(null);
    setVersion((v) => v + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 pb-64 pt-16 sm:px-6 sm:pt-24 dark:from-slate-950 dark:to-slate-900">
      <div className="mx-auto max-w-2xl">
        <p className="text-xs font-semibold tracking-[0.3em] text-indigo-600 dark:text-indigo-400">COOKIE CONSENT</p>
        <h1 className="mt-3 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl dark:text-slate-100">Cookie 同意バナー</h1>
        <p className="mt-4 text-sm leading-relaxed text-slate-500 sm:text-base dark:text-slate-400">
          画面下のバナーで選んだ内容はブラウザに保存され、次回からは表示されません。「詳細設定」では分類ごとに許可 / 拒否を選べます。
        </p>

        <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">現在の同意状態</p>
          {consent ? (
            <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
              {[
                ['必須', true],
                ['分析', consent.analytics],
                ['広告', consent.marketing],
              ].map(([label, v]) => (
                <div key={String(label)} className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-800">
                  <dt className="text-xs text-slate-500 dark:text-slate-400">{label}</dt>
                  <dd className={`mt-1 text-sm font-bold ${v ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>{yesNo(Boolean(v))}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">まだ選択されていません。</p>
          )}
          <button
            type="button"
            id="cookie-reset"
            onClick={reset}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 dark:focus-visible:ring-offset-slate-900"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            同意状態をリセット
          </button>
        </div>
      </div>
      <CookieConsent key={version} {...props} storageKey={storageKey} onSave={setConsent} />
    </div>
  );
}

export default function App() {
  return <CookieConsentDemo />;
}
