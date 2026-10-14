import { MobileStickyCTADemo } from '../components/MobileStickyCTA';
import { definePlayground } from '../playground/types';

type V = {
  hideOnScroll: boolean;
  tolerance: number;
  desktopMode: 'hidden' | 'floating';
  accent: 'indigo' | 'rose' | 'slate' | 'teal';
  tel: string;
};

export default definePlayground<V>({
  note: 'スマホ幅で確認すると下部のバーが表示されます。下へスクロールで隠れ、上へ戻すと現れます。',
  controls: [
    { key: 'hideOnScroll', label: 'スクロールで隠す', type: 'toggle', default: true },
    { key: 'tolerance', label: '反応するスクロール量', type: 'range', min: 0, max: 40, step: 1, default: 8, unit: 'px' },
    {
      key: 'desktopMode',
      label: 'PC幅での表示',
      type: 'select',
      default: 'floating',
      options: [
        { value: 'floating', label: '右下フローティング' },
        { value: 'hidden', label: '表示しない' },
      ],
    },
    {
      key: 'accent',
      label: '予約ボタンの色',
      type: 'select',
      default: 'rose',
      options: [
        { value: 'rose', label: 'Rose' },
        { value: 'indigo', label: 'Indigo' },
        { value: 'teal', label: 'Teal' },
        { value: 'slate', label: 'Slate' },
      ],
    },
    { key: 'tel', label: '電話番号', type: 'text', default: '03-0000-0000' },
  ],
  render: (v) => <MobileStickyCTADemo {...v} />,
});
