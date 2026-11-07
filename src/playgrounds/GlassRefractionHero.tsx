import { GlassRefractionHero } from '../components/GlassRefractionHero';
import { definePlayground } from '../playground/types';

type V = {
  title: string;
  shape: 'knot' | 'torus' | 'crystal' | 'capsule';
  thickness: number;
  ior: number;
  chromaticAberration: number;
  roughness: number;
  follow: number;
  bgColor: string;
  textColor: string;
  accentColor: string;
  quality: 'low' | 'high';
};

export default definePlayground<V>({
  note: 'カーソルで傾き、タップでスピン、スクロールで回転します。重いと感じたら品質を「軽い」に。',
  controls: [
    { key: 'title', label: '背景の見出し', hint: '改行で2行に', type: 'text', default: 'LIQUID\nGLASS', multiline: true },
    {
      key: 'shape',
      label: '形',
      type: 'select',
      options: [
        { value: 'knot', label: 'トーラスノット' },
        { value: 'torus', label: 'ドーナツ' },
        { value: 'crystal', label: 'クリスタル' },
        { value: 'capsule', label: 'カプセル' },
      ],
      default: 'knot',
    },
    { key: 'thickness', label: 'ガラスの厚み', hint: '大きいほど強く屈折', type: 'range', min: 0, max: 4, step: 0.1, default: 1.2 },
    { key: 'ior', label: '屈折率（ior）', type: 'range', min: 1, max: 2.4, step: 0.05, default: 1.4 },
    { key: 'chromaticAberration', label: '色収差（虹色のにじみ）', type: 'range', min: 0, max: 1, step: 0.05, default: 0.25 },
    { key: 'roughness', label: 'すりガラス度', type: 'range', min: 0, max: 0.6, step: 0.01, default: 0.05 },
    { key: 'follow', label: 'カーソル追従', type: 'range', min: 0, max: 2, step: 0.1, default: 1 },
    { key: 'bgColor', label: '背景色', type: 'color', default: '#0b0b0f' },
    { key: 'textColor', label: '見出しの色', type: 'color', default: '#f5f5f4' },
    { key: 'accentColor', label: '差し色', type: 'color', default: '#f97316' },
    {
      key: 'quality',
      label: '品質',
      type: 'select',
      options: [
        { value: 'high', label: 'きれい' },
        { value: 'low', label: '軽い' },
      ],
      default: 'high',
    },
  ],
  render: (v) => (
    <main style={{ background: v.bgColor }}>
      <GlassRefractionHero {...v} />
      <section className="h-[60vh]" />
    </main>
  ),
});
