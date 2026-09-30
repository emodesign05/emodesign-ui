import { UserAvatarLight } from '../components/UserAvatar';
import { definePlayground } from '../playground/types';

type V = { size: 'sm' | 'md' | 'lg'; status: 'online' | 'away' | 'busy' | 'offline'; showStatus: boolean; useImage: boolean; fallbackText: string };

const AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

export default definePlayground<V>({
  note: '画像なしにすると、頭文字（フォールバック）の表示を確認できます。',
  controls: [
    {
      key: 'size',
      label: 'サイズ',
      type: 'select',
      default: 'md',
      options: [
        { value: 'sm', label: 'S' },
        { value: 'md', label: 'M' },
        { value: 'lg', label: 'L' },
      ],
    },
    {
      key: 'status',
      label: 'ステータス',
      hint: 'オンラインの時だけ枠がグラデーションになります',
      type: 'select',
      default: 'online',
      options: [
        { value: 'online', label: 'オンライン' },
        { value: 'away', label: '離席中' },
        { value: 'busy', label: '取り込み中' },
        { value: 'offline', label: 'オフライン' },
      ],
    },
    { key: 'showStatus', label: 'ステータス表示', type: 'toggle', default: true },
    { key: 'useImage', label: '画像あり', type: 'toggle', default: true },
    { key: 'fallbackText', label: '頭文字（画像なし時）', type: 'text', default: 'JD' },
  ],
  render: (v) => (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="rounded-3xl border border-slate-200/80 bg-white p-12 shadow-xl">
        <UserAvatarLight
          size={v.size}
          status={v.status}
          showStatus={v.showStatus}
          src={v.useImage ? AVATAR : undefined}
          fallbackText={v.fallbackText || undefined}
        />
      </div>
    </main>
  ),
});
