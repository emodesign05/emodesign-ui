import { ProductCardLight } from '../components/ECProductCard';
import { definePlayground } from '../playground/types';

type V = { brand: string; title: string; price: number; originalPrice: number; discountBadge: string };

export default definePlayground<V>({
  controls: [
    { key: 'brand', label: 'ブランド名', type: 'text', default: 'URBAN STYLE' },
    { key: 'title', label: '商品名', type: 'text', multiline: true, default: 'リラックスフィット コットン タンクトップ' },
    { key: 'price', label: '販売価格', type: 'range', min: 500, max: 50000, step: 100, default: 4800, unit: '円' },
    { key: 'originalPrice', label: '元の価格', hint: '販売価格より高いと取り消し線つきで表示', type: 'range', min: 500, max: 60000, step: 100, default: 6000, unit: '円' },
    { key: 'discountBadge', label: '割引バッジ', type: 'text', default: '20% OFF' },
  ],
  render: (v) => (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <ProductCardLight brand={v.brand} title={v.title} price={v.price} originalPrice={v.originalPrice} discountBadge={v.discountBadge} />
    </main>
  ),
});
