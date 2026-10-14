import { AnnouncementBarDemo } from '../components/AnnouncementBar';
import { definePlayground } from '../playground/types';

type V = {
  mode: 'static' | 'rotate' | 'marquee';
  interval: number;
  speed: number;
  theme: 'dark' | 'indigo' | 'emerald' | 'amber';
  dismissible: boolean;
};

export default definePlayground<V>({
  note: '×で閉じると次回も非表示。ページ中央のボタンで再表示できます。',
  controls: [
    {
      key: 'mode',
      label: '表示方法',
      type: 'select',
      default: 'rotate',
      options: [
        { value: 'rotate', label: '自動切替' },
        { value: 'marquee', label: '流れる文字' },
        { value: 'static', label: '固定（1件目のみ）' },
      ],
    },
    { key: 'interval', label: '切替の間隔', hint: '「自動切替」のとき', type: 'range', min: 2, max: 10, step: 0.5, default: 4, unit: '秒' },
    { key: 'speed', label: '流れる速さ', hint: '「流れる文字」のとき', type: 'range', min: 20, max: 160, step: 5, default: 60, unit: 'px/秒' },
    {
      key: 'theme',
      label: '配色',
      type: 'select',
      default: 'indigo',
      options: [
        { value: 'indigo', label: 'グラデーション' },
        { value: 'dark', label: 'ダーク' },
        { value: 'emerald', label: 'エメラルド' },
        { value: 'amber', label: 'イエロー' },
      ],
    },
    { key: 'dismissible', label: '閉じるボタン', type: 'toggle', default: true },
  ],
  render: (v) => <AnnouncementBarDemo {...v} />,
});
