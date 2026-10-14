import { useMemo, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

/* =========================================================
 * 予約カレンダー（Booking Calendar：空き状況表示）
 * - 月表示カレンダーに ◯（空きあり）△（残りわずか）×（満席）／休（定休日）を表示。前月・翌月へ切り替え
 * - 日付を選ぶと、その日の時間枠一覧（残り枠数つき）が出る → 時間を選ぶと「予約フォームへ進む」ボタンが有効に
 * - 空き状況はダミーデータ：seed 付きの擬似乱数（mulberry32）に「seed＋日付」を入れて作るので、
 *   何度リロードしても同じ結果になる（seed を変えると別のパターン）
 * - 過去の日付・定休日・満席日は選べない（disabled）。前月ボタンは今月より前へは戻れない
 * - キーボード：日付ボタンは ←→ で 1 日、↑↓ で 1 週間移動（月の端では前後の月へ）。選択中の日付は aria-pressed、
 *   各ボタンの aria-label に「10月14日（水）空きあり」のように状態を読み上げる文言を入れる
 * - prefers-reduced-motion 時は月切り替え・時間枠の表示アニメーションを無効化
 * ========================================================= */

const WEEK = ['日', '月', '火', '水', '木', '金', '土'];
const SLOTS = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
const CAPACITY = 3;

// seed 付き擬似乱数（mulberry32）
function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Day = { remain: number[]; status: 'ok' | 'few' | 'full' | 'closed' | 'past' };

const key = (d: Date) => d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();

function dayInfo(date: Date, today: Date, seed: number, closedWeekday: number): Day {
  if (key(date) < key(today)) return { remain: [], status: 'past' };
  if (date.getDay() === closedWeekday) return { remain: [], status: 'closed' };
  const rand = mulberry32(seed * 100003 + key(date));
  const busy = rand(); // 日ごとの混み具合（土日は混みやすく）
  const weekend = date.getDay() === 0 || date.getDay() === 6 ? 0.25 : 0;
  const remain = SLOTS.map(() => {
    const r = rand();
    if (r < busy * 0.9 + weekend) return 0;
    return Math.max(1, Math.round(rand() * CAPACITY));
  });
  const open = remain.filter((n) => n > 0).length;
  return { remain, status: open === 0 ? 'full' : open <= 3 ? 'few' : 'ok' };
}

const MARK = {
  ok: { sym: '◯', label: '空きあり', cls: 'text-emerald-600 dark:text-emerald-400' },
  few: { sym: '△', label: '残りわずか', cls: 'text-amber-500 dark:text-amber-400' },
  full: { sym: '×', label: '満席', cls: 'text-slate-400 dark:text-slate-500' },
  closed: { sym: '休', label: '定休日', cls: 'text-slate-300 dark:text-slate-600' },
  past: { sym: '', label: '受付終了', cls: '' },
} as const;

const ACCENTS = {
  indigo: { sel: 'bg-indigo-600 text-white shadow-indigo-200', soft: 'bg-indigo-50 text-indigo-700 ring-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:ring-indigo-800', cta: 'bg-indigo-600 hover:bg-indigo-700', ring: 'focus-visible:ring-indigo-500', text: 'text-indigo-600 dark:text-indigo-400', today: 'ring-indigo-300' },
  rose: { sel: 'bg-rose-600 text-white shadow-rose-200', soft: 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:ring-rose-800', cta: 'bg-rose-600 hover:bg-rose-700', ring: 'focus-visible:ring-rose-500', text: 'text-rose-600 dark:text-rose-400', today: 'ring-rose-300' },
  emerald: { sel: 'bg-emerald-600 text-white shadow-emerald-200', soft: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-800', cta: 'bg-emerald-600 hover:bg-emerald-700', ring: 'focus-visible:ring-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', today: 'ring-emerald-300' },
  slate: { sel: 'bg-slate-900 text-white shadow-slate-300 dark:bg-white dark:text-slate-900', soft: 'bg-slate-100 text-slate-800 ring-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-600', cta: 'bg-slate-900 hover:bg-black', ring: 'focus-visible:ring-slate-500', text: 'text-slate-900 dark:text-white', today: 'ring-slate-400' },
} as const;

const fmtDate = (d: Date) => `${d.getMonth() + 1}月${d.getDate()}日（${WEEK[d.getDay()]}）`;

export interface BookingCalendarProps {
  /** 空き状況ダミーデータの乱数シード（同じ値なら毎回同じ結果） */
  seed?: number;
  /** アクセント色 */
  accent?: keyof typeof ACCENTS;
  /** 週の始まり */
  weekStart?: 'sun' | 'mon';
  /** 定休日の曜日（0=日〜6=土、-1 でなし） */
  closedWeekday?: number;
  /** 何か月先まで予約を受け付けるか */
  monthsAhead?: number;
  /** 送信先（「予約フォームへ進む」で呼ばれる） */
  onProceed?: (date: Date, time: string) => void;
}

export function BookingCalendar({
  seed = 7,
  accent = 'indigo',
  weekStart = 'sun',
  closedWeekday = 2,
  monthsAhead = 3,
  onProceed,
}: BookingCalendarProps) {
  const ac = ACCENTS[accent];
  const reduce = useReducedMotion();
  const [today] = useState(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), t.getDate());
  });
  const [view, setView] = useState(() => ({ y: today.getFullYear(), m: today.getMonth(), dir: 0 }));
  const [selected, setSelected] = useState<Date | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const monthIndex = view.y * 12 + view.m;
  const minIndex = today.getFullYear() * 12 + today.getMonth();
  const maxIndex = minIndex + monthsAhead;

  const offset = weekStart === 'mon' ? 1 : 0;
  const week = [...WEEK.slice(offset), ...WEEK.slice(0, offset)];

  const cells = useMemo(() => {
    const first = new Date(view.y, view.m, 1);
    const lead = (first.getDay() - offset + 7) % 7;
    const days = new Date(view.y, view.m + 1, 0).getDate();
    const out: ({ date: Date; info: Day } | null)[] = Array.from({ length: lead }, () => null);
    for (let d = 1; d <= days; d++) {
      const date = new Date(view.y, view.m, d);
      out.push({ date, info: dayInfo(date, today, seed, closedWeekday) });
    }
    return out;
  }, [view.y, view.m, offset, today, seed, closedWeekday]);

  // props（seed・定休日）が変わって選択中の日付／時間が選べなくなった場合は未選択として扱う
  const rawInfo = selected ? dayInfo(selected, today, seed, closedWeekday) : null;
  const selInfo = rawInfo && (rawInfo.status === 'ok' || rawInfo.status === 'few') ? rawInfo : null;
  const timeOk = !!selInfo && time !== null && selInfo.remain[SLOTS.indexOf(time)] > 0;

  const moveMonth = (delta: number) => {
    const next = Math.min(maxIndex, Math.max(minIndex, monthIndex + delta));
    setView({ y: Math.floor(next / 12), m: next % 12, dir: delta });
  };

  const pick = (d: Date) => {
    setSelected(d);
    setTime(null);
    setDone(false);
  };

  // 矢印キーで日付移動（月をまたぐ場合は表示月も切り替え）
  const onGridKey = (e: ReactKeyboardEvent, date: Date) => {
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
    if (!step) return;
    e.preventDefault();
    // 選べない日（過去・定休日・満席）は飛ばして、次に選べる日へ
    let target = date;
    let ti = monthIndex;
    for (let n = 0; n < 62; n++) {
      target = new Date(target.getFullYear(), target.getMonth(), target.getDate() + step);
      ti = target.getFullYear() * 12 + target.getMonth();
      if (ti < minIndex || ti > maxIndex) return;
      const st = dayInfo(target, today, seed, closedWeekday).status;
      if (st === 'ok' || st === 'few') break;
    }
    if (ti !== monthIndex) setView({ y: target.getFullYear(), m: target.getMonth(), dir: step > 0 ? 1 : -1 });
    requestAnimationFrame(() => {
      requestAnimationFrame(() => document.querySelector<HTMLButtonElement>(`[data-day="${key(target)}"]`)?.focus());
    });
  };

  const d = reduce ? 0 : 0.25;

  return (
    <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
      <div className="grid lg:grid-cols-[1fr_300px]">
        {/* カレンダー */}
        <section className="p-5 sm:p-7" aria-labelledby="bc-month">
          <div className="flex items-center justify-between">
            <h3 id="bc-month" className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-100" aria-live="polite">
              <CalendarDays className={`h-5 w-5 ${ac.text}`} aria-hidden />
              {view.y}年 {view.m + 1}月
            </h3>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => moveMonth(-1)}
                disabled={monthIndex <= minIndex}
                aria-label="前の月"
                className={`flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-30 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 ${ac.ring}`}
              >
                <ChevronLeft className="h-4 w-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => moveMonth(1)}
                disabled={monthIndex >= maxIndex}
                aria-label="次の月"
                className={`flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-30 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 ${ac.ring}`}
              >
                <ChevronRight className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-7 text-center text-[11px] font-bold text-slate-400">
            {week.map((w) => (
              <span key={w} className={w === '日' ? 'text-rose-400' : w === '土' ? 'text-sky-500' : ''}>
                {w}
              </span>
            ))}
          </div>

          <div className="relative mt-2 overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`${view.y}-${view.m}`}
                initial={{ opacity: 0, x: reduce ? 0 : view.dir * 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: reduce ? 0 : view.dir * -24 }}
                transition={{ duration: d }}
                className="grid grid-cols-7 gap-1 sm:gap-1.5"
              >
                {cells.map((c, i) => {
                  if (!c) return <span key={`e${i}`} aria-hidden />;
                  const { date, info } = c;
                  const m = MARK[info.status];
                  const disabled = info.status === 'past' || info.status === 'closed' || info.status === 'full';
                  const isSel = selected ? key(selected) === key(date) : false;
                  const isToday = key(date) === key(today);
                  const dow = date.getDay();
                  return (
                    <button
                      key={key(date)}
                      type="button"
                      data-day={key(date)}
                      disabled={disabled}
                      onClick={() => pick(date)}
                      onKeyDown={(e) => onGridKey(e, date)}
                      aria-pressed={isSel}
                      aria-label={`${fmtDate(date)} ${m.label}${isToday ? '（今日）' : ''}`}
                      className={`flex aspect-square flex-col items-center justify-center rounded-xl text-sm transition-all focus-visible:outline-none focus-visible:ring-2 sm:aspect-[1/0.9] ${ac.ring} ${
                        isSel
                          ? `${ac.sel} font-bold shadow-md dark:shadow-none`
                          : disabled
                            ? 'cursor-not-allowed text-slate-300 dark:text-slate-600'
                            : `font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 ${dow === 0 ? 'text-rose-500' : dow === 6 ? 'text-sky-600 dark:text-sky-400' : 'text-slate-700 dark:text-slate-200'}`
                      } ${isToday && !isSel ? `ring-1 ${ac.today}` : ''}`}
                    >
                      <span className={info.status === 'past' ? 'line-through decoration-slate-300/70' : ''}>{date.getDate()}</span>
                      <span aria-hidden className={`mt-0.5 text-[11px] leading-none ${isSel ? 'text-white/90 dark:text-slate-900/80' : m.cls}`}>
                        {m.sym}
                      </span>
                    </button>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>

          <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400" aria-label="凡例">
            {(['ok', 'few', 'full', 'closed'] as const).map((s) => (
              <li key={s} className="flex items-center gap-1">
                <span className={`font-bold ${MARK[s].cls}`}>{MARK[s].sym}</span>
                {MARK[s].label}
              </li>
            ))}
          </ul>
        </section>

        {/* 時間枠 */}
        <aside className="flex flex-col border-t border-slate-100 bg-slate-50/70 p-5 sm:p-7 lg:border-l lg:border-t-0 dark:border-slate-800 dark:bg-slate-950/40" aria-label="時間を選択">
          <p className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-100">
            <Clock className={`h-4 w-4 ${ac.text}`} aria-hidden />
            {selected && selInfo ? fmtDate(selected) : '日付を選んでください'}
          </p>

          <div className="mt-4 min-h-40 flex-1">
            <AnimatePresence mode="wait" initial={false}>
              {selected && selInfo ? (
                <motion.ul
                  key={key(selected)}
                  initial={{ opacity: 0, y: reduce ? 0 : 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: d }}
                  className="grid grid-cols-3 gap-2 lg:grid-cols-2"
                >
                  {SLOTS.map((s, i) => {
                    const remain = selInfo.remain[i];
                    const isSel = time === s && remain > 0;
                    return (
                      <li key={s}>
                        <button
                          type="button"
                          disabled={remain === 0}
                          onClick={() => {
                            setTime(s);
                            setDone(false);
                          }}
                          aria-pressed={isSel}
                          aria-label={`${s} ${remain === 0 ? '満席' : `残り${remain}枠`}`}
                          className={`w-full rounded-xl px-2 py-2.5 text-center ring-1 transition-all focus-visible:outline-none focus-visible:ring-2 ${ac.ring} ${
                            isSel
                              ? `${ac.soft} font-bold`
                              : remain === 0
                                ? 'cursor-not-allowed bg-transparent text-slate-300 ring-slate-200 line-through dark:text-slate-600 dark:ring-slate-800'
                                : 'bg-white text-slate-700 ring-slate-200 hover:ring-slate-400 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-700'
                          }`}
                        >
                          <span className="block text-sm font-semibold">{s}</span>
                          <span className="block text-[10px] opacity-70">{remain === 0 ? '満席' : remain === 1 ? '残り1枠' : `残り${remain}枠`}</span>
                        </button>
                      </li>
                    );
                  })}
                </motion.ul>
              ) : (
                <motion.p key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs leading-relaxed text-slate-400 dark:border-slate-700">
                  ◯・△ の日付を選ぶと、
                  <br />
                  予約できる時間が表示されます。
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-5">
            <p className="mb-2 min-h-5 text-xs text-slate-500 dark:text-slate-400" aria-live="polite">
              {done ? '予約フォームへ移動します（デモ）' : selected && timeOk ? `${fmtDate(selected)} ${time}〜 を選択中` : ''}
            </p>
            <button
              type="button"
              disabled={!selected || !time || !timeOk}
              onClick={() => {
                if (!selected || !time || !timeOk) return;
                setDone(true);
                onProceed?.(selected, time);
              }}
              className={`flex w-full items-center justify-center gap-1.5 rounded-xl py-3 text-sm font-bold text-white shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none dark:disabled:bg-slate-700 ${ac.cta} ${ac.ring}`}
            >
              予約フォームへ進む
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export function BookingCalendarDemo(props: BookingCalendarProps) {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6 sm:py-20 dark:bg-slate-950">
      <div className="mb-10 text-center">
        <span className="inline-block rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">RESERVATION</span>
        <h2 className="mt-3 text-2xl font-bold text-slate-800 sm:text-3xl dark:text-slate-100">ご来店予約</h2>
        <p className="mt-2 text-xs text-slate-500 sm:text-sm dark:text-slate-400">ヘアサロン「こもれび」（架空）｜ 定休日あり・各枠最大 {CAPACITY} 名</p>
      </div>
      <BookingCalendar {...props} />
    </main>
  );
}

export default function App() {
  return <BookingCalendarDemo />;
}
