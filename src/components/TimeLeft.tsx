import { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Clock, RotateCcw } from 'lucide-react';

// --- カウントダウンタイマーの残り時間型定義 ---
interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

// 数字アニメーション用カードパーツコンポーネント
const TimeUnitCard = memo(({ value, label, duration, offset }: { value: number; label: string; duration: number; offset: number }) => {
  // 常に2桁（01, 02...）で表示するためのフォーマット関数
  const formattedValue = String(value).padStart(2, '0');

  return (
    <div className="flex flex-col items-center">
      {/* 数字表示カード */}
      <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-rose-200/60 bg-white/80 shadow-md backdrop-blur-md sm:h-20 sm:w-20 dark:border-rose-900/40 dark:bg-slate-900/90">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={formattedValue}
            initial={{ y: -offset, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: offset, opacity: 0 }}
            transition={{ duration, ease: 'easeOut' }}
            className="text-2xl font-black text-rose-600 sm:text-3xl dark:text-rose-400"
          >
            {formattedValue}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* 単位ラベル（日・時・分・秒） */}
      <span className="mt-2 text-[11px] font-bold text-slate-500 sm:text-xs dark:text-slate-400">
        {label}
      </span>
    </div>
  );
});

TimeUnitCard.displayName = 'TimeUnitCard';

// --- カウントダウンタイマー メインコンポーネント ---
export interface CountdownProps {
  startDays?: number;
  startHours?: number;
  startMinutes?: number;
  startSeconds?: number;
  digitDuration?: number;
  digitOffset?: number;
  tagText?: string;
  showReset?: boolean;
}

export const CampaignCountdownTimer = memo(({
  startDays = 3,
  startHours = 0,
  startMinutes = 5,
  startSeconds = 30,
  digitDuration = 0.25,
  digitOffset = 20,
  tagText = '期間限定 タイムセール',
  showReset = true,
}: CountdownProps) => {
  // 現在時刻から指定時間後の目標日時を初期設定
  const [targetDate, setTargetDate] = useState<Date>(() => {
    const now = new Date();
    const ms = (((startDays * 24 + startHours) * 60 + startMinutes) * 60 + startSeconds) * 1000;
    return new Date(now.getTime() + ms);
  });

  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isEnded, setIsEnded] = useState(false);

  // 時間差分の計算関数
  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime();

      if (difference <= 0) {
        setIsEnded(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setIsEnded(false);
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    calculateTimeLeft(); // 初回実行
    const timer = setInterval(calculateTimeLeft, 1000); // 1秒ごとに実行

    return () => clearInterval(timer);
  }, [targetDate]);

  // テスト用：残り10分にリセットする関数
  const handleResetTenMinutes = () => {
    const now = new Date();
    setTargetDate(new Date(now.getTime() + 10 * 60 * 1000));
  };

  return (
    <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-rose-100 bg-gradient-to-b from-rose-50/50 via-white to-slate-50 p-6 shadow-xl sm:p-8 dark:border-rose-950 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
      {/* 装飾用 背景光沢 */}
      <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-rose-400/10 blur-2xl" />

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* キャンペーンタグ */}
        <div className="inline-flex items-center space-x-1.5 rounded-full bg-rose-100 px-3.5 py-1 text-xs font-bold text-rose-600 dark:bg-rose-950/80 dark:text-rose-400">
          <Flame className="h-4 w-4 animate-bounce text-rose-500" />
          <span>{tagText}</span>
        </div>

        {/* キャッチコピー */}
        <h3 className="mt-3 text-xl font-extrabold text-slate-800 sm:text-2xl dark:text-slate-100">
          <span className="block sm:inline">全品最大50%OFF </span>
          <span className="block sm:inline">特別キャンペーン</span>
        </h3>

        <p className="mt-1.5 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
          セール終了まで残り時間のカウントダウンです。お早めにご利用ください。
        </p>

        {/* タイマー表示エリア */}
        <div className="mt-6 flex items-center justify-center space-x-2 sm:space-x-4">
          {!isEnded ? (
            <>
              <TimeUnitCard value={timeLeft.days} label="日" duration={digitDuration} offset={digitOffset} />
              <span className="pb-6 text-xl font-black text-rose-400 sm:text-2xl">:</span>
              <TimeUnitCard value={timeLeft.hours} label="時間" duration={digitDuration} offset={digitOffset} />
              <span className="pb-6 text-xl font-black text-rose-400 sm:text-2xl">:</span>
              <TimeUnitCard value={timeLeft.minutes} label="分" duration={digitDuration} offset={digitOffset} />
              <span className="pb-6 text-xl font-black text-rose-400 sm:text-2xl">:</span>
              <TimeUnitCard value={timeLeft.seconds} label="秒" duration={digitDuration} offset={digitOffset} />
            </>
          ) : (
            // タイムアップ時表示
            <div className="rounded-2xl bg-slate-100 px-6 py-4 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <Clock className="mx-auto h-6 w-6 text-slate-400" />
              <p className="mt-2 text-sm font-bold">本キャンペーンは終了いたしました</p>
            </div>
          )}
        </div>

        {/* テスト用リセット操作エリア */}
        {showReset && <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
          <button
            onClick={handleResetTenMinutes}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>動作テスト（残り10分にセット）</span>
          </button>
        </div>}
      </div>
    </div>
  );
});

CampaignCountdownTimer.displayName = 'CampaignCountdownTimer';

// --- メインコンポーネント ---
export function CountdownDemo(props: CountdownProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 sm:p-6 dark:bg-slate-950">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-slate-800 sm:text-2xl dark:text-slate-100">
          <span className="block sm:inline">リアルタイム カウントダウンタイマー</span>
          <span className="block sm:inline">（Real-time Campaign Countdown Timer）</span>
        </h2>
        <p className="mt-1.5 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
          <span className="block sm:inline">セールやイベント終了までの時間を</span>
          <span className="block sm:inline">1秒刻みでリアルタイム表示します。</span>
        </p>
      </div>

      <CampaignCountdownTimer {...props} />
    </div>
  );
}

export default function App() {
  return <CountdownDemo />;
}
