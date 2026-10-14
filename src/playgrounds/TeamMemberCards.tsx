import { TeamMemberCardsDemo } from '../components/TeamMemberCards';
import { definePlayground } from '../playground/types';

type V = {
  columns: '2' | '3' | '4';
  duration: number;
  grayscale: boolean;
  showSocial: boolean;
  radius: 'none' | 'md' | 'lg';
};

export default definePlayground<V>({
  note: '写真にホバーするとカラー化し、SNS リンクが下から出てきます（Tab キーでも表示）。',
  controls: [
    { key: 'columns', label: '列数（PC）', type: 'select', default: '4', options: [
      { value: '2', label: '2 列' }, { value: '3', label: '3 列' }, { value: '4', label: '4 列' },
    ] },
    { key: 'duration', label: '色が変わる時間', type: 'range', min: 0.1, max: 1.5, step: 0.05, default: 0.6, unit: '秒' },
    { key: 'grayscale', label: '初期状態をモノクロに', type: 'toggle', default: true },
    { key: 'showSocial', label: 'SNS リンクを表示', type: 'toggle', default: true },
    { key: 'radius', label: '写真の角丸', type: 'select', default: 'lg', options: [
      { value: 'none', label: 'なし' }, { value: 'md', label: '小さめ' }, { value: 'lg', label: '大きめ' },
    ] },
  ],
  render: ({ columns, ...v }) => <TeamMemberCardsDemo {...v} columns={Number(columns) as 2 | 3 | 4} />,
});
