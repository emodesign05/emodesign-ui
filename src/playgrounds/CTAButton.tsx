import HighConversionCTA from '../components/CTAButton';
import { definePlayground } from '../playground/types';

type V = { catchCopy: string; benefit: string; buttonLabel: string; badge: string };

export default definePlayground<V>({
  remountOnChange: true,
  note: 'キャッチコピーは改行するとそのまま2行になります。',
  controls: [
    { key: 'badge', label: 'バッジ', type: 'text', default: 'AI Code Generation' },
    { key: 'catchCopy', label: 'キャッチコピー', type: 'text', multiline: true, default: 'あなたの開発体験を\n次のレベルへ引き上げる' },
    { key: 'benefit', label: 'ベネフィット文', type: 'text', multiline: true, default: '数クリックでAIがコードを即座に生成。今すぐ無料体験を。' },
    { key: 'buttonLabel', label: 'ボタンのラベル', type: 'text', default: '今すぐ無料で登録する' },
  ],
  render: (v) => (
    <main className="flex min-h-screen items-center bg-slate-950">
      <HighConversionCTA catchCopy={v.catchCopy} benefit={v.benefit} buttonLabel={v.buttonLabel} badge={v.badge} />
    </main>
  ),
});
