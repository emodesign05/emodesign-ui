import { AnimatedAccordionList } from '../components/AnimatedAccordionList';
import { definePlayground } from '../playground/types';

type V = { duration: number; singleOpen: boolean; radius: number; heading: string };

export default definePlayground<V>({
  note: '項目をクリックして開閉を確認します。',
  controls: [
    { key: 'duration', label: '開閉の時間', type: 'range', min: 0, max: 1.5, step: 0.05, default: 0.3, unit: 's' },
    { key: 'singleOpen', label: '同時に開くのは1つだけ', type: 'toggle', default: true },
    { key: 'radius', label: '角丸', type: 'range', min: 0, max: 40, step: 1, default: 16, unit: 'px' },
    { key: 'heading', label: '見出し', type: 'text', default: 'よくある質問（FAQ）' },
  ],
  render: (v) => <AnimatedAccordionList duration={v.duration} singleOpen={v.singleOpen} radius={v.radius} heading={v.heading} />,
});
