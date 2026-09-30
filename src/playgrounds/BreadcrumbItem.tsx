import { AccessibleBreadcrumbs } from '../components/BreadcrumbItem';
import { definePlayground } from '../playground/types';

type V = { tail: number; accent: 'indigo' | 'rose' | 'emerald' | 'amber'; duration: number; offset: number };

export default definePlayground<V>({
  note: '「…」ボタンを押すと折りたたまれた階層が開きます。表示する末尾の数を増やすと折りたたみが減ります。',
  controls: [
    { key: 'tail', label: '末尾に表示する階層数', type: 'range', min: 1, max: 4, step: 1, default: 2 },
    { key: 'accent', label: '現在地の色', type: 'select', default: 'indigo', options: [
      { value: 'indigo', label: 'Indigo' }, { value: 'rose', label: 'Rose' },
      { value: 'emerald', label: 'Emerald' }, { value: 'amber', label: 'Amber' },
    ] },
    { key: 'duration', label: '開く時間', type: 'range', min: 0.05, max: 1, step: 0.05, default: 0.15, unit: 's' },
    { key: 'offset', label: '開く移動量', type: 'range', min: 0, max: 30, step: 1, default: 8, unit: 'px' },
  ],
  render: (v) => (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <AccessibleBreadcrumbs {...v} />
    </div>
  ),
});
