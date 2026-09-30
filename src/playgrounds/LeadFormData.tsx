import { CleanMultiStepLeadForm } from '../components/LeadFormData';
import { definePlayground } from '../playground/types';

type V = {
  accent: 'indigo' | 'rose' | 'emerald' | 'slate';
  stepDuration: number; slide: number; progressDuration: number; submitMs: number; radius: number;
};

export default definePlayground<V>({
  note: 'STEP1でお名前とメールを入力して「次へ」で進みます。',
  controls: [
    { key: 'accent', label: 'アクセント色', type: 'select', default: 'indigo', options: [
      { value: 'indigo', label: 'Indigo' }, { value: 'rose', label: 'Rose' },
      { value: 'emerald', label: 'Emerald' }, { value: 'slate', label: 'Slate' },
    ] },
    { key: 'stepDuration', label: 'ステップ切替の時間', type: 'range', min: 0.05, max: 1, step: 0.05, default: 0.2, unit: 's' },
    { key: 'slide', label: 'スライド量', type: 'range', min: 0, max: 80, step: 2, default: 20, unit: 'px' },
    { key: 'progressDuration', label: 'ゲージの時間', type: 'range', min: 0.05, max: 1.5, step: 0.05, default: 0.3, unit: 's' },
    { key: 'submitMs', label: '送信中の時間', type: 'range', min: 200, max: 4000, step: 100, default: 1500, unit: 'ms' },
    { key: 'radius', label: 'カードの角丸', type: 'range', min: 0, max: 48, step: 2, default: 24, unit: 'px' },
  ],
  render: (v) => (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 sm:p-6">
      <CleanMultiStepLeadForm {...v} />
    </div>
  ),
});
