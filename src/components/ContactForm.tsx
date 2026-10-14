import { useEffect, useId, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent, ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { AlertCircle, ArrowLeft, ArrowRight, Check, CheckCircle2, Loader2, Send } from 'lucide-react';

/* =========================================================
 * お問い合わせフォーム（Contact Form：入力 → 確認 → 完了）
 * - 日本のコーポレートサイトで定番の3ステップ構成。上部のステップインジケーターで現在地を表示
 * - 入力画面：必須チェック＋リアルタイム入力チェック（メール形式・電話番号・ふりがな・文字数）
 *   validateMode = input なら入力した瞬間から、blur ならフォーカスが外れてからエラーを表示（以降は入力ごとに再判定）
 *   「確認画面へ」を押したときにエラーがあれば全項目のエラーを出し、最初のエラー項目へフォーカス
 * - 確認画面：入力内容を <dl> で一覧表示。「修正する」で入力内容を保ったまま戻れる
 * - 送信：setTimeout による疑似送信（submitMs ミリ秒）。送信中はボタンにスピナー＋二重送信防止
 * - 完了画面：受付番号つきのサンクス表示。「最初に戻る」でリセット
 * - アクセシビリティ：label と input の関連付け、aria-invalid / aria-describedby / aria-required、
 *   エラーは role="alert"、ステップは aria-current="step"、画面切替時は見出しへフォーカス移動
 * - prefers-reduced-motion: reduce のときは画面切替のスライド・フェードを無効化（スピナーは回転を止める）
 * ========================================================= */

const ACCENTS = {
  indigo: { bg: 'bg-indigo-600', btn: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200', text: 'text-indigo-600 dark:text-indigo-400', ring: 'focus-visible:ring-indigo-500', focus: 'focus:border-indigo-500 focus:ring-indigo-500/15', soft: 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300', check: 'accent-indigo-600', has: 'has-[:focus-visible]:ring-indigo-500' },
  rose: { bg: 'bg-rose-600', btn: 'bg-rose-600 hover:bg-rose-700 shadow-rose-200', text: 'text-rose-600 dark:text-rose-400', ring: 'focus-visible:ring-rose-500', focus: 'focus:border-rose-500 focus:ring-rose-500/15', soft: 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300', check: 'accent-rose-600', has: 'has-[:focus-visible]:ring-rose-500' },
  emerald: { bg: 'bg-emerald-600', btn: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200', text: 'text-emerald-600 dark:text-emerald-400', ring: 'focus-visible:ring-emerald-500', focus: 'focus:border-emerald-500 focus:ring-emerald-500/15', soft: 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300', check: 'accent-emerald-600', has: 'has-[:focus-visible]:ring-emerald-500' },
  slate: { bg: 'bg-slate-900 dark:bg-slate-600', btn: 'bg-slate-900 hover:bg-slate-800 shadow-slate-300', text: 'text-slate-900 dark:text-white', ring: 'focus-visible:ring-slate-500', focus: 'focus:border-slate-700 focus:ring-slate-500/15', soft: 'border-slate-800 bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white', check: 'accent-slate-900', has: 'has-[:focus-visible]:ring-slate-500' },
} as const;

type Fields = {
  type: string;
  name: string;
  kana: string;
  company: string;
  email: string;
  tel: string;
  message: string;
  agree: boolean;
};
type Key = keyof Fields;

const INITIAL: Fields = { type: 'Web サイト制作', name: '', kana: '', company: '', email: '', tel: '', message: '', agree: false };
const TYPES = ['Web サイト制作', '採用・お見積り', '取材・メディア', 'その他'];
const ORDER: Key[] = ['name', 'kana', 'company', 'email', 'tel', 'message', 'agree'];
const LABELS: Record<Key, string> = {
  type: 'お問い合わせ種別',
  name: 'お名前',
  kana: 'ふりがな',
  company: '会社名',
  email: 'メールアドレス',
  tel: '電話番号',
  message: 'お問い合わせ内容',
  agree: '個人情報の取り扱い',
};
const MSG_MIN = 10;
const MSG_MAX = 1000;

/** 値からエラー文を作る（純粋関数） */
function validate(f: Fields): Partial<Record<Key, string>> {
  const e: Partial<Record<Key, string>> = {};
  if (!f.name.trim()) e.name = 'お名前を入力してください';
  if (f.kana && !/^[ぁ-ゖー\s\u3000]+$/.test(f.kana)) e.kana = 'ひらがなで入力してください';
  if (!f.email.trim()) e.email = 'メールアドレスを入力してください';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email)) e.email = 'メールアドレスの形式が正しくありません（例：info@example.com）';
  if (f.tel && !/^0\d{1,4}-?\d{1,4}-?\d{3,4}$/.test(f.tel.replace(/[‐－ー]/g, '-'))) e.tel = '電話番号の形式が正しくありません（例：03-1234-5678）';
  if (!f.message.trim()) e.message = 'お問い合わせ内容を入力してください';
  else if (f.message.trim().length < MSG_MIN) e.message = `${MSG_MIN}文字以上で入力してください（あと${MSG_MIN - f.message.trim().length}文字）`;
  else if (f.message.length > MSG_MAX) e.message = `${MSG_MAX}文字以内で入力してください`;
  if (!f.agree) e.agree = '個人情報の取り扱いへの同意が必要です';
  return e;
}

export type ContactFormProps = {
  /** アクセント色 */
  accent?: keyof typeof ACCENTS;
  /** エラーを出すタイミング：input = 入力中から / blur = フォーカスが外れてから */
  validateMode?: 'input' | 'blur';
  /** 疑似送信にかかる時間（ミリ秒） 300〜5000 */
  submitMs?: number;
  /** ステップインジケーターを表示するか */
  showSteps?: boolean;
  /** カードの角丸（px） 0〜40 */
  radius?: number;
};

export function ContactForm({ accent = 'indigo', validateMode = 'input', submitMs = 1800, showSteps = true, radius = 28 }: ContactFormProps) {
  const ac = ACCENTS[accent];
  const reduce = useReducedMotion();
  const uid = useId();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [values, setValues] = useState<Fields>(INITIAL);
  const [touched, setTouched] = useState<Partial<Record<Key, boolean>>>({});
  const [sending, setSending] = useState(false);
  const [receipt, setReceipt] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const timer = useRef<number | undefined>(undefined);

  const errors = validate(values);
  const show = (k: Key) => (touched[k] ? errors[k] : undefined);
  const id = (k: Key) => `${uid}-${k}`;

  // 画面が切り替わったら、新しい画面の見出しにフォーカス（AnimatePresence で入れ替わった後にマウントされるので callback ref で）
  const focusNext = useRef(false);
  const go = (s: 0 | 1 | 2) => {
    focusNext.current = true;
    setStep(s);
  };
  const headingRef = (el: HTMLHeadingElement | null) => {
    if (!el || !focusNext.current) return;
    focusNext.current = false;
    el.focus({ preventScroll: true });
    el.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
  };

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const k = name as Key;
    const v = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setValues((prev) => ({ ...prev, [k]: v }));
    if (validateMode === 'input' || type === 'checkbox') setTouched((t) => (t[k] ? t : { ...t, [k]: true }));
  };
  const onBlur = (k: Key) => setTouched((t) => (t[k] ? t : { ...t, [k]: true }));

  const toConfirm = (e: FormEvent) => {
    e.preventDefault();
    const keys = ORDER.filter((k) => errors[k]);
    if (keys.length) {
      setTouched(Object.fromEntries(ORDER.map((k) => [k, true])));
      formRef.current?.querySelector<HTMLElement>(`[name="${keys[0]}"]`)?.focus();
      return;
    }
    go(1);
  };

  const submit = () => {
    if (sending) return;
    setSending(true);
    timer.current = window.setTimeout(() => {
      setSending(false);
      setReceipt(`INQ-${Math.floor(100000 + Math.random() * 900000)}`);
      go(2);
    }, submitMs);
  };

  const reset = () => {
    setValues(INITIAL);
    setTouched({});
    go(0);
  };

  const fieldCls = (k: Key) =>
    `w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-4 dark:bg-slate-950 dark:text-white ${
      reduce ? '' : 'transition-[border-color,box-shadow]'
    } ${
      show(k)
        ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/15 dark:border-rose-500'
        : `border-slate-200 dark:border-slate-700 ${ac.focus}`
    }`;

  const ok = (k: Key) => touched[k] && !errors[k] && values[k] !== '' && values[k] !== false;

  const field = (k: Key, opts: { required?: boolean; hint?: string; children: ReactNode }) => (
    <div>
      <label htmlFor={id(k)} className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
        {LABELS[k]}
        {opts.required ? (
          <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">必須</span>
        ) : (
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">任意</span>
        )}
        {ok(k) && <Check aria-hidden className="ml-auto h-4 w-4 text-emerald-500" />}
      </label>
      {opts.children}
      {opts.hint && !show(k) && (
        <p id={`${id(k)}-hint`} className="mt-1.5 text-xs text-slate-400">
          {opts.hint}
        </p>
      )}
      {show(k) && (
        <p id={`${id(k)}-err`} role="alert" className="mt-1.5 flex items-center gap-1 text-xs font-medium text-rose-600 dark:text-rose-400">
          <AlertCircle aria-hidden className="h-3.5 w-3.5 shrink-0" />
          {show(k)}
        </p>
      )}
    </div>
  );

  const aria = (k: Key, required = false, hint = false) => ({
    id: id(k),
    name: k,
    'aria-invalid': !!show(k),
    'aria-required': required || undefined,
    'aria-describedby': show(k) ? `${id(k)}-err` : hint ? `${id(k)}-hint` : undefined,
    onChange,
    onBlur: () => onBlur(k),
  });

  const anim = reduce
    ? { initial: false as const, animate: { opacity: 1 }, exit: { opacity: 0, transition: { duration: 0 } } }
    : { initial: { opacity: 0, x: 24 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -24 }, transition: { duration: 0.28, ease: 'easeOut' as const } };

  const STEP_LABELS = ['入力', '確認', '完了'];
  const primaryBtn = `inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold text-white shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 dark:shadow-none dark:focus-visible:ring-offset-slate-900 ${ac.btn} ${ac.ring}`;
  const ghostBtn = `inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-600 hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:focus-visible:ring-offset-slate-900 ${ac.ring}`;

  return (
    <div className="w-full min-w-0 max-w-2xl">
      {showSteps && (
        <ol className="mb-8 flex items-center justify-center" aria-label="お問い合わせの手順">
          {STEP_LABELS.map((label, i) => {
            const done = i < step || step === 2;
            const current = i === step;
            return (
              <li key={label} className="flex items-center" aria-current={current ? 'step' : undefined}>
                <div className="flex flex-col items-center gap-2">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${reduce ? '' : 'transition-colors duration-300'} ${
                      done || current ? `${ac.bg} text-white` : 'border border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-900'
                    }`}
                  >
                    {done ? <Check aria-hidden className="h-4 w-4" strokeWidth={3} /> : i + 1}
                  </span>
                  <span className={`text-xs font-bold ${current ? ac.text : done ? 'text-slate-600 dark:text-slate-300' : 'text-slate-400'}`}>
                    {label}
                    {done && <span className="sr-only">（完了）</span>}
                  </span>
                </div>
                {i < STEP_LABELS.length - 1 && (
                  <span aria-hidden className="relative mx-3 mb-6 h-0.5 w-12 overflow-hidden rounded-full bg-slate-200 sm:mx-5 sm:w-24 dark:bg-slate-800">
                    <span
                      className={`absolute inset-0 origin-left ${ac.bg} ${reduce ? '' : 'transition-transform duration-500'}`}
                      style={{ transform: `scaleX(${i < step ? 1 : 0})` }}
                    />
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      )}

      <div style={{ borderRadius: radius }} className="overflow-hidden border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-10 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
        <AnimatePresence mode="wait" initial={false}>
          {step === 0 && (
            <motion.div key="input" {...anim}>
              <h2 ref={headingRef} tabIndex={-1} className="text-xl font-bold text-slate-900 outline-none dark:text-white">
                お問い合わせ内容の入力
              </h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">2営業日以内に担当者よりご連絡いたします。</p>

              <form ref={formRef} noValidate onSubmit={toConfirm} className="mt-8 space-y-6">
                <fieldset>
                  <legend className="mb-2 text-sm font-bold text-slate-700 dark:text-slate-200">{LABELS.type}</legend>
                  <div className="flex flex-wrap gap-2">
                    {TYPES.map((t) => (
                      <label
                        key={t}
                        className={`cursor-pointer rounded-full border px-4 py-2 text-xs font-bold has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-offset-2 ${ac.has} ${
                          values.type === t ? ac.soft : 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <input type="radio" name="type" value={t} checked={values.type === t} onChange={onChange} className="sr-only" />
                        {t}
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div className="grid gap-6 sm:grid-cols-2">
                  {field('name', {
                    required: true,
                    children: <input type="text" autoComplete="name" placeholder="山田 花子" value={values.name} className={fieldCls('name')} {...aria('name', true)} />,
                  })}
                  {field('kana', {
                    hint: 'ひらがなで入力',
                    children: <input type="text" placeholder="やまだ はなこ" value={values.kana} className={fieldCls('kana')} {...aria('kana', false, true)} />,
                  })}
                </div>
                {field('company', {
                  children: <input type="text" autoComplete="organization" placeholder="株式会社サンプル" value={values.company} className={fieldCls('company')} {...aria('company')} />,
                })}
                <div className="grid gap-6 sm:grid-cols-2">
                  {field('email', {
                    required: true,
                    children: <input type="email" inputMode="email" autoComplete="email" placeholder="info@example.com" value={values.email} className={fieldCls('email')} {...aria('email', true)} />,
                  })}
                  {field('tel', {
                    hint: 'ハイフンあり・なし どちらでも可',
                    children: <input type="tel" inputMode="tel" autoComplete="tel" placeholder="03-1234-5678" value={values.tel} className={fieldCls('tel')} {...aria('tel', false, true)} />,
                  })}
                </div>
                {field('message', {
                  required: true,
                  children: (
                    <div className="relative">
                      <textarea
                        rows={6}
                        placeholder="ご相談内容・ご予算・希望納期などをご記入ください"
                        value={values.message}
                        className={`${fieldCls('message')} resize-y pb-8`}
                        {...aria('message', true)}
                      />
                      <span
                        aria-hidden
                        className={`pointer-events-none absolute bottom-3 right-4 text-[11px] tabular-nums ${values.message.length > MSG_MAX ? 'text-rose-500' : 'text-slate-400'}`}
                      >
                        {values.message.length} / {MSG_MAX}
                      </span>
                    </div>
                  ),
                })}

                <div>
                  <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={values.agree}
                      className={`mt-0.5 h-4 w-4 shrink-0 rounded ${ac.check}`}
                      {...aria('agree', true)}
                    />
                    <span>
                      <a href="#" onClick={(e) => e.preventDefault()} className={`font-bold underline underline-offset-2 ${ac.text}`}>
                        個人情報の取り扱い
                      </a>
                      に同意する
                      <span className="ml-2 rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">必須</span>
                    </span>
                  </label>
                  {show('agree') && (
                    <p id={`${id('agree')}-err`} role="alert" className="mt-1.5 flex items-center gap-1 text-xs font-medium text-rose-600 dark:text-rose-400">
                      <AlertCircle aria-hidden className="h-3.5 w-3.5" />
                      {show('agree')}
                    </p>
                  )}
                </div>

                <div className="flex justify-center pt-2">
                  <button type="submit" id="to-confirm" className={`${primaryBtn} w-full sm:w-auto sm:min-w-[240px]`}>
                    入力内容を確認する
                    <ArrowRight aria-hidden className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="confirm" {...anim}>
              <h2 ref={headingRef} tabIndex={-1} className="text-xl font-bold text-slate-900 outline-none dark:text-white">
                入力内容の確認
              </h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">以下の内容でよろしければ「送信する」を押してください。</p>
              <dl className="mt-8 divide-y divide-slate-100 rounded-2xl border border-slate-200 px-5 dark:divide-slate-800 dark:border-slate-800">
                {(['type', 'name', 'kana', 'company', 'email', 'tel', 'message'] as Key[]).map((k) => (
                  <div key={k} className="grid gap-1 py-4 sm:grid-cols-[9rem_1fr] sm:gap-4">
                    <dt className="text-xs font-bold text-slate-500 dark:text-slate-400">{LABELS[k]}</dt>
                    <dd className="whitespace-pre-wrap break-words text-sm text-slate-800 dark:text-slate-100">
                      {String(values[k]) || <span className="text-slate-400">（未入力）</span>}
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="mt-8 flex flex-col-reverse justify-center gap-3 sm:flex-row">
                <button type="button" onClick={() => go(0)} disabled={sending} className={ghostBtn}>
                  <ArrowLeft aria-hidden className="h-4 w-4" />
                  修正する
                </button>
                <button type="button" id="submit-form" onClick={submit} disabled={sending} aria-busy={sending} className={`${primaryBtn} sm:min-w-[200px]`}>
                  {sending ? (
                    <>
                      <Loader2 aria-hidden className={`h-4 w-4 ${reduce ? '' : 'animate-spin'}`} />
                      送信中…
                    </>
                  ) : (
                    <>
                      送信する
                      <Send aria-hidden className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
              <p className="sr-only" aria-live="polite">
                {sending ? '送信しています' : ''}
              </p>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="done" {...anim} className="py-6 text-center">
              <motion.div
                initial={reduce ? false : { scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/50"
              >
                <CheckCircle2 aria-hidden className="h-9 w-9 text-emerald-500" />
              </motion.div>
              <h2 ref={headingRef} tabIndex={-1} className="mt-6 text-xl font-bold text-slate-900 outline-none dark:text-white">
                送信が完了しました
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                お問い合わせいただきありがとうございます。
                <br />
                ご入力のメールアドレス宛てに確認メールをお送りしました。担当者より2営業日以内にご連絡いたします。
              </p>
              <p className="mt-6 inline-block rounded-full bg-slate-50 px-4 py-2 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                受付番号：<span className="font-mono font-bold text-slate-800 dark:text-slate-100">{receipt}</span>
              </p>
              <div className="mt-8">
                <button type="button" id="form-reset" onClick={reset} className={ghostBtn}>
                  最初に戻る
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-16 sm:px-8 sm:py-24 dark:bg-slate-950">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <p className="text-xs font-bold tracking-[0.2em] text-indigo-600">CONTACT</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">お問い合わせ</h1>
      </div>
      <div className="mx-auto flex max-w-2xl justify-center">
        <ContactForm />
      </div>
    </main>
  );
}
