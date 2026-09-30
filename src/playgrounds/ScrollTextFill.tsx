import { ScrollTextFill } from '../components/ScrollTextFill';
import { definePlayground } from '../playground/types';

type V = { text: string; dimOpacity: number; splitBy: 'char' | 'word'; highlight: string };

export default definePlayground<V>({
  note: 'プレビュー内をスクロールすると、文章が読み進めるように濃くなっていきます。',
  controls: [
    { key: 'text', label: '文章', type: 'text', multiline: true, default: 'わたしたちは、使う人の毎日に静かに寄り添うデザインをつくります。目立つためではなく、迷わないために。' },
    { key: 'dimOpacity', label: '塗られる前の薄さ', type: 'range', min: 0, max: 0.6, step: 0.05, default: 0.15 },
    {
      key: 'splitBy',
      label: '塗る単位',
      hint: '日本語は1文字、英語は単語がおすすめ',
      type: 'select',
      default: 'char',
      options: [
        { value: 'char', label: '1文字ずつ' },
        { value: 'word', label: '単語ずつ' },
      ],
    },
    { key: 'highlight', label: '塗りの色', hint: '白（#ffffff）以外を選ぶとその色で塗られる', type: 'color', default: '#ffffff' },
  ],
  render: (v) => <ScrollTextFill text={v.text} dimOpacity={v.dimOpacity} splitBy={v.splitBy} highlight={v.highlight === '#ffffff' ? '' : v.highlight} />,
});
