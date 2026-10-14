import { BookingCalendarDemo } from '../components/BookingCalendar';
import { definePlayground } from '../playground/types';

type V = {
  seed: number;
  accent: 'indigo' | 'rose' | 'emerald' | 'slate';
  weekStart: 'sun' | 'mon';
  closedWeekday: string;
  monthsAhead: number;
};

export default definePlayground<V>({
  note: '◯・△ の日付を選ぶ → 時間を選ぶと「予約フォームへ進む」が押せるようになります。日付は矢印キーでも移動できます。',
  controls: [
    { key: 'seed', label: '空き状況のシード', hint: '同じ値なら毎回同じ空き状況', type: 'range', min: 1, max: 99, step: 1, default: 7 },
    { key: 'accent', label: 'アクセント色', type: 'select', default: 'indigo', options: [
      { value: 'indigo', label: 'Indigo' }, { value: 'rose', label: 'Rose' },
      { value: 'emerald', label: 'Emerald' }, { value: 'slate', label: 'Slate' },
    ] },
    { key: 'weekStart', label: '週の始まり', type: 'select', default: 'sun', options: [
      { value: 'sun', label: '日曜始まり' }, { value: 'mon', label: '月曜始まり' },
    ] },
    { key: 'closedWeekday', label: '定休日', type: 'select', default: '2', options: [
      { value: '-1', label: 'なし' }, { value: '1', label: '月曜' }, { value: '2', label: '火曜' },
      { value: '3', label: '水曜' }, { value: '0', label: '日曜' },
    ] },
    { key: 'monthsAhead', label: '受付期間', hint: '何か月先まで予約できるか', type: 'range', min: 1, max: 6, step: 1, default: 3, unit: 'か月' },
  ],
  render: ({ closedWeekday, ...v }) => <BookingCalendarDemo {...v} closedWeekday={Number(closedWeekday)} />,
});
