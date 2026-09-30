import { FooterDemo } from '../components/MultiColumnCorporateFooter';
import { definePlayground } from '../playground/types';

type V = { accent: 'indigo' | 'rose' | 'emerald' | 'amber'; brandName: string; showNewsletter: boolean; showSns: boolean; subscribedMs: number };

export default definePlayground<V>({
  note: 'PC幅で5列、タブレットで2列、スマホで1列になります。',
  controls: [
    { key: 'accent', label: 'アクセント色', type: 'select', default: 'indigo', options: [
      { value: 'indigo', label: 'Indigo' }, { value: 'rose', label: 'Rose' },
      { value: 'emerald', label: 'Emerald' }, { value: 'amber', label: 'Amber' },
    ] },
    { key: 'brandName', label: 'ブランド名', type: 'text', default: 'AI Component Library' },
    { key: 'showSns', label: 'SNSアイコンを表示', type: 'toggle', default: true },
    { key: 'showNewsletter', label: 'メルマガ欄を表示', type: 'toggle', default: true },
    { key: 'subscribedMs', label: '登録メッセージの表示時間', type: 'range', min: 500, max: 6000, step: 250, default: 3000, unit: 'ms' },
  ],
  render: (v) => <FooterDemo {...v} />,
});
