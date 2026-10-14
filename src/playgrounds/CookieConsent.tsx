import { CookieConsentDemo } from '../components/CookieConsent';
import { definePlayground } from '../playground/types';

type V = { layout: 'bar' | 'card'; accent: 'indigo' | 'emerald' | 'slate' | 'rose'; delay: number };

export default definePlayground<V>({
  note: '選択すると保存され、バナーは出なくなります。「同意状態をリセット」で再表示。',
  remountOnChange: true,
  controls: [
    {
      key: 'layout',
      label: 'レイアウト',
      type: 'select',
      default: 'bar',
      options: [
        { value: 'bar', label: '画面下の帯' },
        { value: 'card', label: '左下のカード' },
      ],
    },
    {
      key: 'accent',
      label: 'アクセント色',
      type: 'select',
      default: 'indigo',
      options: [
        { value: 'indigo', label: 'Indigo' },
        { value: 'emerald', label: 'Emerald' },
        { value: 'slate', label: 'Slate' },
        { value: 'rose', label: 'Rose' },
      ],
    },
    { key: 'delay', label: '表示までの待ち時間', type: 'range', min: 0, max: 3, step: 0.1, default: 0.6, unit: '秒' },
  ],
  render: (v) => <CookieConsentDemo {...v} />,
});
