import { ToastNotificationDemo } from '../components/ToastNotification';
import type { ToastPosition } from '../components/ToastNotification';
import { definePlayground } from '../playground/types';

type V = { position: ToastPosition; duration: number; max: number; pauseOnHover: boolean; showProgress: boolean };

export default definePlayground<V>({
  note: 'ボタンで通知を出し、カーソルを乗せるとタイマーが止まります。',
  controls: [
    {
      key: 'position',
      label: '表示位置',
      type: 'select',
      default: 'top-right',
      options: [
        { value: 'top-right', label: '右上' },
        { value: 'bottom-right', label: '右下' },
        { value: 'top-center', label: '上中央' },
        { value: 'bottom-center', label: '下中央' },
        { value: 'top-left', label: '左上' },
        { value: 'bottom-left', label: '左下' },
      ],
    },
    { key: 'duration', label: '自動で消えるまで', hint: '0 で自動では消えない', type: 'range', min: 0, max: 15, step: 0.5, default: 5, unit: '秒' },
    { key: 'max', label: '最大表示数', type: 'range', min: 2, max: 8, step: 1, default: 4 },
    { key: 'pauseOnHover', label: 'ホバーで一時停止', type: 'toggle', default: true },
    { key: 'showProgress', label: '進捗バーを表示', type: 'toggle', default: true },
  ],
  render: (v) => <ToastNotificationDemo {...v} />,
});
