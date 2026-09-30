import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles, ArrowRight } from 'lucide-react';

// --- 料金プランのデータ構造定義 ---
interface PricingPlan {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number; // 年払い時の1ヶ月あたりの換算価格
  isPopular?: boolean;
  features: string[];
  buttonText: string;
  buttonVariant: 'primary' | 'secondary';
}

// サンプルデータ（SaaS・Webサービスの料金プラン）
const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'starter',
    name: 'スターター',
    description: '個人開発者や少人数のスモールプロジェクトに最適',
    priceMonthly: 1980,
    priceYearly: 1580,
    features: [
      '主要UIコンポーネント 15種',
      'TypeScript完全対応',
      'Tailwind CSSサポート',
      'コミュニティサポート',
    ],
    buttonText: '無料で始める',
    buttonVariant: 'secondary',
  },
  {
    id: 'pro',
    name: 'プロ（おすすめ）',
    description: '成長中のプロダクトやチーム開発に最適な標準プラン',
    priceMonthly: 4980,
    priceYearly: 3980,
    isPopular: true,
    features: [
      '全UIコンポーネント 100種以上',
      'TypeScript完全対応',
      'Tailwind CSS & Framer Motion',
      'Notion用プロンプト・解説付属',
      '優先メールサポート',
      '商用利用ライセンス',
    ],
    buttonText: '14日間無料でお試し',
    buttonVariant: 'primary',
  },
  {
    id: 'enterprise',
    name: 'エンタープライズ',
    description: '大規模な開発チームやカスタム要望が必要な企業向け',
    priceMonthly: 12800,
    priceYearly: 9800,
    features: [
      'プロプランの全機能',
      '専用コンポーネントのカスタマイズ制作',
      'ソースコードの一括ダウンロード',
      'SLA（稼働保証）＆ 専任サポート',
      '無制限のチームメンバー',
    ],
    buttonText: 'お問い合わせ',
    buttonVariant: 'secondary',
  },
];

// --- 料金プランカード メインコンポーネント ---
const ACCENTS = {
  indigo: { knob: 'bg-indigo-600', border: 'border-indigo-500', badge: 'from-indigo-600 to-violet-600', primary: 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 dark:shadow-none' },
  rose: { knob: 'bg-rose-600', border: 'border-rose-500', badge: 'from-rose-600 to-orange-500', primary: 'bg-rose-600 text-white shadow-lg shadow-rose-200 hover:bg-rose-700 dark:shadow-none' },
  emerald: { knob: 'bg-emerald-600', border: 'border-emerald-500', badge: 'from-emerald-600 to-teal-600', primary: 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700 dark:shadow-none' },
  violet: { knob: 'bg-violet-600', border: 'border-violet-500', badge: 'from-violet-600 to-fuchsia-600', primary: 'bg-violet-600 text-white shadow-lg shadow-violet-200 hover:bg-violet-700 dark:shadow-none' },
} as const;

export interface PricingCardsProps {
  accent?: keyof typeof ACCENTS;
  defaultYearly?: boolean;
  discountLabel?: string;
  stiffness?: number;
  damping?: number;
  priceDuration?: number;
  radius?: number;
  popularLift?: number;
}

export const InteractivePricingCards = memo(({
  accent = 'indigo',
  defaultYearly = false,
  discountLabel = '20% OFF',
  stiffness = 500,
  damping = 30,
  priceDuration = 0.2,
  radius = 24,
  popularLift = 8,
}: PricingCardsProps) => {
  const ac = ACCENTS[accent];
  // 支払いサイクルの状態管理（false = 月払い, true = 年払い）
  const [isYearly, setIsYearly] = useState(defaultYearly);

  return (
    <div className="w-full max-w-6xl">
      {/* 1. 支払いサイクル切替トグルバー */}
      <div className="mb-10 flex items-center justify-center space-x-3">
        <span
          className={`text-xs font-bold sm:text-sm ${
            !isYearly ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          月払い
        </span>

        {/* スイッチ本体 */}
        <button
          onClick={() => setIsYearly((prev) => !prev)}
          className="relative h-7 w-14 rounded-full bg-slate-200 p-1 transition-colors dark:bg-slate-800"
          aria-label="支払いサイクルの切り替え"
        >
          <motion.div
            className={`h-5 w-5 rounded-full shadow-md ${ac.knob}`}
            animate={{ x: isYearly ? 28 : 0 }}
            transition={{ type: 'spring', stiffness, damping }}
          />
        </button>

        <div className="flex items-center space-x-1.5">
          <span
            className={`text-xs font-bold sm:text-sm ${
              isYearly ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            年払い
          </span>
          {/* 年払い割引バッジ */}
          <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-bold text-rose-600 dark:bg-rose-950/80 dark:text-rose-400">
            {discountLabel}
          </span>
        </div>
      </div>

      {/* 2. 料金プランカードグリッド */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-center">
        {PRICING_PLANS.map((plan) => {
          const price = isYearly ? plan.priceYearly : plan.priceMonthly;

          return (
            <div
              key={plan.id}
              style={{
                borderRadius: radius,
                ...(plan.isPopular ? { transform: `translateY(${-popularLift}px)` } : {}),
              }}
              className={`relative flex flex-col justify-between p-6 sm:p-8 transition-all ${
                plan.isPopular
                  ? `border-2 ${ac.border} bg-white shadow-2xl dark:bg-slate-900`
                  : 'border border-slate-200 bg-white/60 shadow-sm hover:shadow-md dark:border-slate-800 dark:bg-slate-900/60'
              }`}
            >
              {/* 人気No.1バッジ */}
              {plan.isPopular && (
                <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r px-4 py-1 text-xs font-bold text-white shadow-md ${ac.badge}`}>
                  <span className="flex items-center space-x-1">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>人気 No.1 プラン</span>
                  </span>
                </div>
              )}

              <div>
                {/* プラン名 ＆ 説明 */}
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  {plan.name}
                </h3>
                <p className="mt-1.5 min-h-[36px] text-xs text-slate-500 sm:text-sm dark:text-slate-400">
                  {plan.description}
                </p>

                {/* 価格表示エリア */}
                <div className="my-6 border-y border-slate-100 py-4 dark:border-slate-800">
                  <div className="flex items-baseline space-x-1">
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400">¥</span>
                    <AnimatePresence mode="popLayout">
                      <motion.span
                        key={price}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: priceDuration }}
                        className="text-3xl font-black text-slate-900 sm:text-4xl dark:text-white"
                      >
                        {price.toLocaleString()}
                      </motion.span>
                    </AnimatePresence>
                    <span className="text-xs text-slate-400">/ 月（税込）</span>
                  </div>
                  {isYearly && (
                    <p className="mt-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                      ※年払いで年間 ¥{((plan.priceMonthly - plan.priceYearly) * 12).toLocaleString()} お得
                    </p>
                  )}
                </div>

                {/* 機能リスト */}
                <ul className="space-y-3 pb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start space-x-2.5 text-xs sm:text-sm">
                      <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                      </div>
                      <span className="text-slate-600 dark:text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* アクションボタン */}
              <button
                className={`flex w-full items-center justify-center space-x-2 rounded-xl py-3 text-xs font-bold transition-all sm:text-sm ${
                  plan.buttonVariant === 'primary'
                    ? ac.primary
                    : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{plan.buttonText}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
});

InteractivePricingCards.displayName = 'InteractivePricingCards';

// --- メインコンポーネント ---
export default function App() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 sm:p-6 dark:bg-slate-950">
      <div className="mb-8 text-center">
        <h2 className="text-xl font-bold text-slate-800 sm:text-2xl dark:text-slate-100">
          <span className="block sm:inline">料金プラン表</span>
          <span className="block sm:inline">（Interactive Pricing Cards）</span>
        </h2>
        <p className="mt-1.5 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
          <span className="block sm:inline">月払い・年払いのリアルタイム切り替えと、</span>
          <span className="block sm:inline">おすすめプランの強調表示に対応しています。</span>
        </p>
      </div>

      <InteractivePricingCards />
    </div>
  );
}