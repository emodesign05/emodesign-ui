import { HeaderDemo } from '../components/NavLink';
import { definePlayground } from '../playground/types';

type V = { accent: 'indigo' | 'rose' | 'emerald' | 'slate'; brandName: string; blur: number; bgOpacity: number; menuDuration: number; menuOffset: number };

export default definePlayground<V>({
  note: 'スクロールすると背景が透けます。スマホ幅ではハンバーガーメニューがかぶさって開きます。',
  controls: [
    { key: 'accent', label: 'アクセント色', type: 'select', default: 'indigo', options: [
      { value: 'indigo', label: 'Indigo' }, { value: 'rose', label: 'Rose' },
      { value: 'emerald', label: 'Emerald' }, { value: 'slate', label: 'Slate' },
    ] },
    { key: 'brandName', label: 'ブランド名', type: 'text', default: 'AI Library' },
    { key: 'blur', label: 'ぼかし', type: 'range', min: 0, max: 32, step: 1, default: 12, unit: 'px' },
    { key: 'bgOpacity', label: '背景の不透明度', type: 'range', min: 0, max: 1, step: 0.05, default: 0.7 },
    { key: 'menuDuration', label: 'メニュー開閉の時間', type: 'range', min: 0.05, max: 1, step: 0.05, default: 0.2, unit: 's' },
    { key: 'menuOffset', label: 'メニューの移動量', type: 'range', min: 0, max: 60, step: 1, default: 10, unit: 'px' },
  ],
  render: (v) => <HeaderDemo {...v} />,
});
