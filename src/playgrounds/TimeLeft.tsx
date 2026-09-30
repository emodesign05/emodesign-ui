import { CountdownDemo } from '../components/TimeLeft';
import { definePlayground } from '../playground/types';

type V = {
  startDays: number; startHours: number; startMinutes: number; startSeconds: number;
  digitDuration: number; digitOffset: number; tagText: string; showReset: boolean;
};

export default definePlayground<V>({
  remountOnChange: true,
  note: '開始までの残り時間を変えると、その時点から再スタートします。',
  controls: [
    { key: 'startDays', label: '残り 日', type: 'range', min: 0, max: 30, step: 1, default: 3 },
    { key: 'startHours', label: '残り 時間', type: 'range', min: 0, max: 23, step: 1, default: 0 },
    { key: 'startMinutes', label: '残り 分', type: 'range', min: 0, max: 59, step: 1, default: 5 },
    { key: 'startSeconds', label: '残り 秒', type: 'range', min: 0, max: 59, step: 1, default: 30 },
    { key: 'digitDuration', label: '数字切替の時間', type: 'range', min: 0.05, max: 1, step: 0.05, default: 0.25, unit: 's' },
    { key: 'digitOffset', label: '数字の移動量', type: 'range', min: 0, max: 50, step: 1, default: 20, unit: 'px' },
    { key: 'tagText', label: 'タグの文言', type: 'text', default: '期間限定 タイムセール' },
    { key: 'showReset', label: 'リセットボタンを表示', type: 'toggle', default: true },
  ],
  render: (v) => <CountdownDemo {...v} />,
});
