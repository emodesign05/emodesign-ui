import { BeforeAfterSlider } from '../components/BeforeAfterSlider';
import { definePlayground } from '../playground/types';

type V = {
  initial: number;
  direction: 'horizontal' | 'vertical';
  handleStyle: 'circle' | 'line' | 'pill';
  hint: boolean;
  showLabels: boolean;
};

export default definePlayground<V>({
  note: 'つまみをドラッグ（または画像をクリック）して比較します。つまみにフォーカスして矢印キーでも操作できます。',
  remountOnChange: true,
  controls: [
    { key: 'initial', label: '初期位置', type: 'range', min: 0, max: 100, step: 1, default: 50, unit: '%' },
    {
      key: 'direction',
      label: '比較の方向',
      type: 'select',
      default: 'horizontal',
      options: [
        { value: 'horizontal', label: '横（左右）' },
        { value: 'vertical', label: '縦（上下）' },
      ],
    },
    {
      key: 'handleStyle',
      label: 'つまみの見た目',
      type: 'select',
      default: 'circle',
      options: [
        { value: 'circle', label: '丸ボタン' },
        { value: 'pill', label: 'カプセル' },
        { value: 'line', label: '細線＋小さな点' },
      ],
    },
    { key: 'hint', label: '初回ヒント', type: 'toggle', default: true, hint: '表示時につまみが少し揺れて操作できることを伝える' },
    { key: 'showLabels', label: 'BEFORE / AFTER ラベル', type: 'toggle', default: true },
  ],
  render: (v) => (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_#e0e7ff,_#f8fafc_60%)] p-4 sm:p-10 dark:bg-[radial-gradient(ellipse_at_top,_#1e1b4b,_#020617_60%)]">
      <div className={v.direction === 'vertical' ? 'w-full max-w-md' : 'w-full max-w-4xl'}>
        <BeforeAfterSlider {...v} aspect={v.direction === 'vertical' ? '4 / 5' : '16 / 10'} />
      </div>
    </main>
  ),
});
