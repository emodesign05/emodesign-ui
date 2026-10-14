import { VideoHeroModal } from '../components/VideoHeroModal';
import { definePlayground } from '../playground/types';

type V = {
  headline: string;
  overlay: number;
  align: 'center' | 'left';
  accent: string;
  forceStill: boolean;
};

export default definePlayground<V>({
  note: '再生ボタンで本編動画がモーダルで開きます（Esc / 背景クリックで閉じて停止）。動きを減らす設定・データセーバー時は静止画になります。',
  remountOnChange: true,
  controls: [
    { key: 'headline', label: '見出し', type: 'text', multiline: true, default: '花がひらく、\nその一瞬を。', hint: '改行で行を分けます' },
    { key: 'overlay', label: '動画の暗さ', type: 'range', min: 0, max: 0.9, step: 0.05, default: 0.45 },
    {
      key: 'align',
      label: 'テキスト配置',
      type: 'select',
      default: 'center',
      options: [
        { value: 'center', label: '中央' },
        { value: 'left', label: '左寄せ' },
      ],
    },
    { key: 'accent', label: '再生ボタンの色', type: 'color', default: '#f472b6' },
    { key: 'forceStill', label: '静止画モード', type: 'toggle', default: false, hint: 'データセーバー時の見た目を確認' },
  ],
  render: (v) => <VideoHeroModal {...v} />,
});
