import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Building2,
  Calendar,
  MessageSquare,
  Send,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

// --- フォームの入力データ型定義 ---
interface LeadFormData {
  fullName: string;
  email: string;
  companyName: string;
  timeline: string;
  message: string;
}

// --- リード獲得マルチステップフォーム メインコンポーネント ---
const ACCENTS = {
  indigo: { text: 'text-indigo-600 dark:text-indigo-400', bar: 'bg-indigo-600 dark:bg-indigo-500', btn: 'bg-indigo-600 shadow-indigo-200 hover:bg-indigo-700' },
  rose: { text: 'text-rose-600 dark:text-rose-400', bar: 'bg-rose-600 dark:bg-rose-500', btn: 'bg-rose-600 shadow-rose-200 hover:bg-rose-700' },
  emerald: { text: 'text-emerald-600 dark:text-emerald-400', bar: 'bg-emerald-600 dark:bg-emerald-500', btn: 'bg-emerald-600 shadow-emerald-200 hover:bg-emerald-700' },
  slate: { text: 'text-slate-700 dark:text-slate-300', bar: 'bg-slate-800 dark:bg-slate-400', btn: 'bg-slate-800 shadow-slate-300 hover:bg-slate-900' },
} as const;

export interface LeadFormProps {
  accent?: keyof typeof ACCENTS;
  stepDuration?: number;
  slide?: number;
  progressDuration?: number;
  submitMs?: number;
  radius?: number;
}

export const CleanMultiStepLeadForm = memo(({
  accent = 'indigo',
  stepDuration = 0.2,
  slide = 20,
  progressDuration = 0.3,
  submitMs = 1500,
  radius = 24,
}: LeadFormProps) => {
  const ac = ACCENTS[accent];
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // フォームステート
  const [formData, setFormData] = useState<LeadFormData>({
    fullName: '',
    email: '',
    companyName: '',
    timeline: '1ヶ月以内',
    message: '',
  });

  // フィールド更新ハンドラー
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 次のステップへ
  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1 && (!formData.fullName || !formData.email)) {
      alert('お名前とメールアドレスを入力してください');
      return;
    }
    if (step < 3) setStep((prev) => (prev + 1) as 1 | 2 | 3);
  };

  // 前のステップへ
  const handleBack = () => {
    if (step > 1) setStep((prev) => (prev - 1) as 1 | 2 | 3);
  };

  // フォーム最終送信
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 送信通信のシミュレーション（1.5秒）
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, submitMs);
  };

  return (
    <div style={{ borderRadius: radius }} className="w-full max-w-lg overflow-hidden border border-slate-200 bg-white p-6 shadow-xl sm:p-8 dark:border-slate-800 dark:bg-slate-900">
      {!isSuccess ? (
        <>
          {/* 1. プログレスバー ＆ ステップ見出し */}
          <div className="mb-8">
            <div className={`flex items-center justify-between text-xs font-bold ${ac.text}`}>
              <span>STEP {step} / 3</span>
              <span>
                {step === 1 && '基本情報の入力'}
                {step === 2 && '会社情報・時期'}
                {step === 3 && 'ご相談内容の確認'}
              </span>
            </div>

            {/* 進捗ゲージ */}
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <motion.div
                className={`h-full ${ac.bar}`}
                initial={{ width: '33.3%' }}
                animate={{ width: `${(step / 3) * 100}%` }}
                transition={{ duration: progressDuration }}
              />
            </div>
          </div>

          {/* 2. ステップ別フォーム入力領域 */}
          <form onSubmit={step === 3 ? handleSubmit : handleNext}>
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: slide }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -slide }}
                  transition={{ duration: stepDuration }}
                  className="space-y-5"
                >
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                    ご連絡先をご入力ください
                  </h3>

                  {/* フローティングレーベル付き入力：お名前 */}
                  <div className="relative">
                    <div className="pointer-events-none absolute left-3.5 top-3.5 text-slate-400">
                      <User className="h-5 w-5" />
                    </div>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder=" "
                      required
                      className="peer w-full rounded-2xl border border-slate-200 bg-transparent py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition-all focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 dark:border-slate-800 dark:text-white dark:focus:border-indigo-500"
                    />
                    <label
                      htmlFor="fullName"
                      className="pointer-events-none absolute left-11 top-3.5 origin-[0] -translate-y-6 scale-75 bg-white px-1 text-xs text-slate-500 transition-all peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-indigo-600 dark:bg-slate-900 dark:text-slate-400 dark:peer-focus:text-indigo-400"
                    >
                      お名前（山田 太郎）
                    </label>
                  </div>

                  {/* フローティングレーベル付き入力：メールアドレス */}
                  <div className="relative">
                    <div className="pointer-events-none absolute left-3.5 top-3.5 text-slate-400">
                      <Mail className="h-5 w-5" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder=" "
                      required
                      className="peer w-full rounded-2xl border border-slate-200 bg-transparent py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition-all focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 dark:border-slate-800 dark:text-white dark:focus:border-indigo-500"
                    />
                    <label
                      htmlFor="email"
                      className="pointer-events-none absolute left-11 top-3.5 origin-[0] -translate-y-6 scale-75 bg-white px-1 text-xs text-slate-500 transition-all peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-indigo-600 dark:bg-slate-900 dark:text-slate-400 dark:peer-focus:text-indigo-400"
                    >
                      メールアドレス（name@example.com）
                    </label>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: slide }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -slide }}
                  transition={{ duration: stepDuration }}
                  className="space-y-5"
                >
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                    組織情報と導入時期
                  </h3>

                  {/* フローティングレーベル付き入力：会社名 */}
                  <div className="relative">
                    <div className="pointer-events-none absolute left-3.5 top-3.5 text-slate-400">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <input
                      type="text"
                      id="companyName"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      placeholder=" "
                      className="peer w-full rounded-2xl border border-slate-200 bg-transparent py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition-all focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 dark:border-slate-800 dark:text-white dark:focus:border-indigo-500"
                    />
                    <label
                      htmlFor="companyName"
                      className="pointer-events-none absolute left-11 top-3.5 origin-[0] -translate-y-6 scale-75 bg-white px-1 text-xs text-slate-500 transition-all peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-indigo-600 dark:bg-slate-900 dark:text-slate-400 dark:peer-focus:text-indigo-400"
                    >
                      会社名・屋号（任意）
                    </label>
                  </div>

                  {/* セレクトボックス：導入検討時期 */}
                  <div className="relative">
                    <div className="pointer-events-none absolute left-3.5 top-3.5 text-slate-400">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <select
                      name="timeline"
                      value={formData.timeline}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-200 bg-transparent py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition-all focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:border-indigo-500"
                    >
                      <option value="1ヶ月以内">導入希望：1ヶ月以内</option>
                      <option value="3ヶ月以内">導入希望：3ヶ月以内</option>
                      <option value="半年以内">導入希望：半年以内</option>
                      <option value="情報収集のみ">まずは情報収集のみ</option>
                    </select>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: slide }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -slide }}
                  transition={{ duration: stepDuration }}
                  className="space-y-5"
                >
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                    ご相談・お問い合わせ内容
                  </h3>

                  {/* テキストエリア：お問い合わせ文 */}
                  <div className="relative">
                    <div className="pointer-events-none absolute left-3.5 top-3.5 text-slate-400">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <textarea
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="ご質問やご要望があればご記入ください"
                      className="w-full rounded-2xl border border-slate-200 bg-transparent py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition-all focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 dark:border-slate-800 dark:text-white dark:focus:border-indigo-500"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 3. 操作ボタンエリア（戻る・次へ・送信） */}
            <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5 dark:border-slate-800">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>前へ戻る</span>
                </button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <button
                  type="submit"
                  className={`inline-flex items-center space-x-2 rounded-xl px-6 py-2.5 text-xs font-semibold text-white shadow-md dark:shadow-none ${ac.btn}`}
                >
                  <span>次へ進む</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`inline-flex items-center space-x-2 rounded-xl px-6 py-2.5 text-xs font-semibold text-white shadow-md disabled:opacity-50 dark:shadow-none ${ac.btn}`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>送信中...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>送信を完了する</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </>
      ) : (
        /* 4. 送信完了画面 */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="py-8 text-center"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h3 className="mt-4 text-xl font-bold text-slate-800 dark:text-slate-100">
            お問い合わせを受け付けました
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-slate-500 sm:text-sm dark:text-slate-400">
            ご入力いただいたメールアドレス（{formData.email}）宛に確認メールをお送りしました。担当者より2営業日以内にご連絡いたします。
          </p>

          <button
            onClick={() => {
              setIsSuccess(false);
              setStep(1);
              setFormData({
                fullName: '',
                email: '',
                companyName: '',
                timeline: '1ヶ月以内',
                message: '',
              });
            }}
            className="mt-6 inline-flex items-center space-x-1.5 text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
          >
            <span>新しいお問い合わせを入力する</span>
          </button>
        </motion.div>
      )}
    </div>
  );
});

CleanMultiStepLeadForm.displayName = 'CleanMultiStepLeadForm';

// --- メインコンポーネント ---
export default function App() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 sm:p-6 dark:bg-slate-950">
      <div className="mb-8 text-center">
        <h2 className="text-xl font-bold text-slate-800 sm:text-2xl dark:text-slate-100">
          <span className="block sm:inline">リード獲得フォーム</span>
          <span className="block sm:inline">（Clean Multi-Step Form）</span>
        </h2>
        <p className="mt-1.5 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
          <span className="block sm:inline">ステップ別切替とフローティングレーベルによる</span>
          <span className="block sm:inline">ユーザー離脱を防ぐ洗練されたフォームUI。</span>
        </p>
      </div>

      <CleanMultiStepLeadForm />
    </div>
  );
}