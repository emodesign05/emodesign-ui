import { ScrollColorVeil } from '../components/ScrollColorVeil';
import { definePlayground } from '../playground/types';

type V = { starCount: number; twinkle: boolean; starFrom: number };

export default definePlayground<V>({
  note: 'プレビュー内を下へスクロールすると、朝から夜へ移り変わります。',
  controls: [
    { key: 'starCount', label: '星の数', type: 'range', min: 0, max: 300, step: 10, default: 90 },
    { key: 'starFrom', label: '星が出始める位置', hint: 'スクロール全体を0〜1とした位置', type: 'range', min: 0.3, max: 0.9, step: 0.05, default: 0.6 },
    { key: 'twinkle', label: '星のまたたき', type: 'toggle', default: true },
  ],
  render: (v) => <ScrollColorVeil starCount={v.starCount} starFrom={v.starFrom} twinkle={v.twinkle} />,
});
