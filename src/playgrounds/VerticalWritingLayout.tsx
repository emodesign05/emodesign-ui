import { VerticalWritingLayout } from '../components/VerticalWritingLayout';
import { definePlayground } from '../playground/types';

type V = {
  accent: string;
  horizontalOnMobile: boolean;
  duration: number;
  distance: number;
  tone: 'washi' | 'sumi';
};

export default definePlayground<V>({
  note: '下へスクロールすると各セクションがふわっと現れます。スマホ幅で「横書きに切り替え」を試してください。',
  remountOnChange: true,
  controls: [
    { key: 'accent', label: '差し色', type: 'color', default: '#b4372f' },
    { key: 'tone', label: '背景のトーン', type: 'select', default: 'washi', options: [
      { value: 'washi', label: '和紙（明るい）' }, { value: 'sumi', label: '墨（暗い）' },
    ] },
    { key: 'horizontalOnMobile', label: 'スマホでは横書きに切り替え', hint: 'md（768px）未満で見出しを横書きに', type: 'toggle', default: true },
    { key: 'duration', label: 'ふわっと表示の時間', type: 'range', min: 0.2, max: 2.5, step: 0.1, default: 1.2, unit: '秒' },
    { key: 'distance', label: '浮き上がる距離', type: 'range', min: 0, max: 80, step: 2, default: 24, unit: 'px' },
  ],
  render: (v) => <VerticalWritingLayout {...v} />,
});
