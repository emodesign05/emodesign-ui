import { StatusBadge } from '../components/BadgeVariant';
import { definePlayground } from '../playground/types';

type V = { variant: 'success' | 'warning' | 'error' | 'info' | 'live'; label: string; icon: boolean };

export default definePlayground<V>({
  note: '配色は暗い背景向けです。',
  controls: [
    {
      key: 'variant',
      label: '種類',
      type: 'select',
      default: 'success',
      options: [
        { value: 'success', label: '成功（success）' },
        { value: 'warning', label: '注意（warning）' },
        { value: 'error', label: 'エラー（error）' },
        { value: 'info', label: '情報（info）' },
        { value: 'live', label: 'ライブ（live）' },
      ],
    },
    { key: 'label', label: 'ラベル', type: 'text', default: 'アクティブ' },
    { key: 'icon', label: 'アイコン', type: 'toggle', default: true },
  ],
  render: (v) => (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6">
      <StatusBadge variant={v.variant} icon={v.icon}>
        {v.label}
      </StatusBadge>
    </div>
  ),
});
