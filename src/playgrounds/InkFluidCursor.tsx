import { InkFluidCursor } from '../components/InkFluidCursor';
import { definePlayground } from '../playground/types';

type V = {
  mode: 'glow' | 'ink';
  bgColor: string;
  palette: 'rainbow' | 'custom';
  colorA: string;
  colorB: string;
  persistence: number;
  curl: number;
  radius: number;
  force: number;
  autoSplat: boolean;
};

export default definePlayground<V>({
  note: 'カーソルを動かすと流れが生まれ、クリック・タップでインクが弾けます。「染みる」は明るい背景色と組み合わせてください。',
  controls: [
    {
      key: 'mode',
      label: '見え方',
      type: 'select',
      options: [
        { value: 'glow', label: '光る（暗い背景）' },
        { value: 'ink', label: '染みる（明るい背景）' },
      ],
      default: 'glow',
    },
    { key: 'bgColor', label: '背景色', type: 'color', default: '#05060a' },
    {
      key: 'palette',
      label: '色',
      type: 'select',
      options: [
        { value: 'rainbow', label: '虹色に移り変わる' },
        { value: 'custom', label: '2色を交互に' },
      ],
      default: 'rainbow',
    },
    { key: 'colorA', label: '色1（2色のとき）', type: 'color', default: '#22d3ee' },
    { key: 'colorB', label: '色2（2色のとき）', type: 'color', default: '#f472b6' },
    { key: 'persistence', label: 'インクの残りやすさ', type: 'range', min: 0, max: 1, step: 0.05, default: 0.6 },
    { key: 'curl', label: '渦の強さ', type: 'range', min: 0, max: 60, step: 1, default: 30 },
    { key: 'radius', label: '筆の太さ', type: 'range', min: 0.05, max: 1, step: 0.05, default: 0.25 },
    { key: 'force', label: '流れの勢い', type: 'range', min: 1000, max: 12000, step: 500, default: 6000 },
    { key: 'autoSplat', label: '自動でインクを落とす', hint: '触っていない間もときどき', type: 'toggle', default: true },
  ],
  render: (v) => (
    <main className="relative flex min-h-screen items-center overflow-hidden" style={{ background: v.bgColor }}>
      <InkFluidCursor {...v} />
      <h1 className={`pointer-events-none relative px-8 text-5xl font-black tracking-tight sm:px-16 sm:text-7xl ${v.mode === 'ink' ? 'text-neutral-900' : 'text-white'}`}>
        なぞった跡が、流れになる。
      </h1>
    </main>
  ),
});
