import { SectionDividerLight } from '../components/SVGWaveSlanted';
import { definePlayground } from '../playground/types';

type V = { type: 'wave' | 'slanted' | 'curve'; fillColor: string };

export default definePlayground<V>({
  controls: [
    {
      key: 'type',
      label: '形状',
      type: 'select',
      default: 'wave',
      options: [
        { value: 'wave', label: '波' },
        { value: 'slanted', label: '斜め' },
        { value: 'curve', label: 'カーブ' },
      ],
    },
    {
      key: 'fillColor',
      label: '下側の色',
      hint: '下のセクションの背景色に合わせます',
      type: 'select',
      default: 'text-white',
      options: [
        { value: 'text-white', label: '白' },
        { value: 'text-slate-900', label: '濃紺' },
        { value: 'text-amber-50', label: 'クリーム' },
        { value: 'text-indigo-50', label: '薄い藍' },
      ],
    },
  ],
  render: (v) => (
    <div className="flex min-h-screen flex-col">
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600">
        <section className="px-6 pb-4 pt-20 text-center text-white">
          <h1 className="text-3xl font-extrabold tracking-tight">Section Divider</h1>
        </section>
        <SectionDividerLight type={v.type} fillColor={v.fillColor} />
      </div>
      <section className={`flex-1 px-6 py-12 text-center ${{ 'text-white': 'bg-white', 'text-slate-900': 'bg-slate-900', 'text-amber-50': 'bg-amber-50', 'text-indigo-50': 'bg-indigo-50' }[v.fillColor] ?? 'bg-white'}`}>
        <p className="text-sm text-slate-500">ここが下のセクションです。</p>
      </section>
    </div>
  ),
});
