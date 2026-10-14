import { useEffect, useState } from 'react';
import { CalendarCheck, Clock, MapPin, MessageCircle, Phone, Sparkles, Star } from 'lucide-react';

/* =========================================================
 * スマホ下部の固定CTAバー（Mobile Sticky CTA Bar）
 * - スマホ画面の下に「予約・電話・LINE」のボタン帯を固定。店舗・サロン・クリニックの LP で定番
 * - 電話は tel: リンク、LINE は友だち追加URL、予約はフォームへのリンク（すべて props で差し替え）
 * - 下へスクロールすると隠れて本文を広く見せ、上へスクロールすると再び現れる
 *   （小さな揺れで出入りしないよう tolerance px 以上動いたときだけ判定。ページ最上部 / 最下部では常に表示）
 * - PC 幅（md 以上）では desktopMode で切替：'hidden'＝出さない / 'floating'＝右下に縦並びのフローティングボタン
 * - iPhone のホームバーに重ならないよう safe-area-inset-bottom 分の余白を確保
 * - アクセシビリティ：<nav aria-label> でまとめ、各ボタンは 44px 以上のタップ領域とフォーカスリング
 *   隠れている間は inert にしてフォーカスが入らないようにする
 * - reduced-motion 時：スライドをやめて表示 / 非表示のフェードのみ
 * ========================================================= */

const ACCENTS = {
  indigo: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30',
  rose: 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/30',
  slate: 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/30 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200',
  teal: 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/30',
} as const;

type Props = {
  /** 下スクロールで隠し、上スクロールで表示する */
  hideOnScroll?: boolean;
  /** 隠す / 出す判定に必要なスクロール量（px） */
  tolerance?: number;
  /** PC 幅（768px 以上）での表示：hidden＝非表示 / floating＝右下フローティング */
  desktopMode?: 'hidden' | 'floating';
  /** 予約ボタンの色 */
  accent?: keyof typeof ACCENTS;
  /** 電話番号（tel: リンクに使用） */
  tel?: string;
  /** 予約ページのURL */
  reserveHref?: string;
  /** LINE の友だち追加URL */
  lineHref?: string;
};

export function MobileStickyCTA({
  hideOnScroll = true,
  tolerance = 8,
  desktopMode = 'floating',
  accent = 'rose',
  tel = '03-0000-0000',
  reserveHref = '#reserve',
  lineHref = '#line',
}: Props) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!hideOnScroll) return;
    let lastY = window.scrollY;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      // 最上部付近・最下部付近では必ず表示
      if (y < 80 || y >= max - 4) {
        setHidden(false);
        lastY = y;
        return;
      }
      const diff = y - lastY;
      if (Math.abs(diff) < tolerance) return;
      setHidden(diff > 0);
      lastY = y;
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [hideOnScroll, tolerance]);

  const isHidden = hideOnScroll && hidden;
  const telHref = `tel:${tel.replace(/[^\d+]/g, '')}`;
  const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900';

  return (
    <>
      {/* スマホ：画面下の固定バー */}
      <nav
        aria-label="予約・お問い合わせ"
        inert={isHidden}
        className={`fixed inset-x-0 bottom-0 z-50 border-t border-slate-200/80 bg-white/90 px-3 pt-2.5 backdrop-blur-xl transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-opacity md:hidden dark:border-slate-800 dark:bg-slate-900/90 ${
          isHidden ? 'translate-y-full opacity-0 motion-reduce:translate-y-0' : 'translate-y-0 opacity-100'
        }`}
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 10px)' }}
      >
        <div className="mx-auto flex max-w-lg items-stretch gap-2">
          <a
            href={telHref}
            id="cta-tel"
            className={`flex min-h-12 w-[4.5rem] shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl border border-slate-200 text-slate-700 transition-colors active:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:active:bg-slate-800 ${focusRing}`}
          >
            <Phone className="h-[18px] w-[18px]" aria-hidden="true" />
            <span className="text-[10px] font-semibold">電話</span>
            <span className="sr-only">（{tel}）</span>
          </a>
          <a
            href={lineHref}
            id="cta-line"
            className={`flex min-h-12 w-[4.5rem] shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl bg-[#06C755] text-white transition-colors active:bg-[#05b34c] ${focusRing}`}
          >
            <MessageCircle className="h-[18px] w-[18px]" aria-hidden="true" />
            <span className="text-[10px] font-semibold">LINE</span>
          </a>
          <a
            href={reserveHref}
            id="cta-reserve"
            className={`flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold text-white shadow-lg transition-colors ${ACCENTS[accent]} ${focusRing}`}
          >
            <CalendarCheck className="h-5 w-5" aria-hidden="true" />
            <span className="flex flex-col leading-tight">
              <span>Web予約する</span>
              <span className="text-[10px] font-medium opacity-80">24時間受付・最短当日</span>
            </span>
          </a>
        </div>
      </nav>

      {/* PC：右下のフローティングボタン */}
      {desktopMode === 'floating' && (
        <nav
          aria-label="予約・お問い合わせ"
          inert={isHidden}
          className={`fixed bottom-8 right-8 z-50 hidden flex-col items-end gap-3 transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-opacity md:flex ${
            isHidden ? 'pointer-events-none translate-y-6 opacity-0 motion-reduce:translate-y-0' : 'translate-y-0 opacity-100'
          }`}
        >
          <a
            href={telHref}
            className={`group flex items-center gap-3 rounded-full border border-slate-200 bg-white/95 py-2 pl-4 pr-2 text-sm font-semibold text-slate-700 shadow-lg backdrop-blur transition-all hover:-translate-y-0.5 hover:shadow-xl dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-200 ${focusRing}`}
          >
            <span className="tabular-nums">{tel}</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <Phone className="h-4 w-4" aria-hidden="true" />
            </span>
          </a>
          <a
            href={lineHref}
            className={`flex items-center gap-3 rounded-full bg-[#06C755] py-2 pl-4 pr-2 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl ${focusRing}`}
          >
            LINEで相談
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
            </span>
          </a>
          <a
            href={reserveHref}
            className={`flex items-center gap-3 rounded-full py-3 pl-6 pr-3 text-base font-bold text-white shadow-xl transition-all hover:-translate-y-0.5 ${ACCENTS[accent]} ${focusRing}`}
          >
            Web予約する
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <CalendarCheck className="h-5 w-5" aria-hidden="true" />
            </span>
          </a>
        </nav>
      )}
    </>
  );
}

/* ---------- デモ ---------- */

const MENUS = [
  { name: 'カット', price: '¥5,500', desc: '骨格とクセを見極め、扱いやすいシルエットに。' },
  { name: 'カット＋カラー', price: '¥11,000', desc: 'ダメージを抑えた薬剤で、透明感のある発色。' },
  { name: '縮毛矯正', price: '¥16,500', desc: '自然な丸みを残す、柔らかなストレート。' },
  { name: 'ヘッドスパ', price: '¥4,400', desc: '頭皮をほぐし、深いリラックスへ。' },
];

const VOICES = [
  '初めてでも丁寧にカウンセリングしてくれて安心しました。',
  '朝のスタイリングが本当に楽になりました。',
  '駅から近く、仕事帰りにも通いやすいです。',
];

/** デモ用の LP 風ページ＋固定CTA */
export function MobileStickyCTADemo(props: Props) {
  return (
    <div className="min-h-screen bg-stone-50 pb-28 text-stone-800 md:pb-0 dark:bg-stone-950 dark:text-stone-100">
      {/* ヒーロー */}
      <section className="relative overflow-hidden pb-20 pt-16 sm:pt-24">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-rose-200/60 blur-3xl dark:bg-rose-900/30" aria-hidden="true" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-amber-200/60 blur-3xl dark:bg-amber-900/30" aria-hidden="true" />
        <div className="relative mx-auto max-w-3xl px-5 sm:px-8">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-rose-500 shadow-sm dark:bg-stone-900">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            初回限定 20%オフ
          </p>
          <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
            毎朝の髪が、
            <br />
            少し好きになる。
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-relaxed text-stone-500 sm:text-base dark:text-stone-400">
            hair salon Lumiere は、駅から徒歩3分の小さなサロン。ひとりひとりの髪質と暮らしに合わせて、手入れしやすいスタイルを提案します。
          </p>
          <p className="mt-6 text-xs text-stone-400">↓ 下へスクロールすると、画面下の予約バーが隠れます。上へ戻すと再び現れます。</p>
        </div>
      </section>

      {/* メニュー */}
      <section className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
        <h2 className="text-xs font-semibold tracking-[0.3em] text-rose-500">MENU</h2>
        <p className="mt-2 text-2xl font-bold sm:text-3xl">メニューと料金</p>
        <ul className="mt-8 divide-y divide-stone-200 rounded-3xl bg-white px-5 shadow-sm dark:divide-stone-800 dark:bg-stone-900">
          {MENUS.map((m) => (
            <li key={m.name} className="flex items-start justify-between gap-4 py-5">
              <div>
                <p className="font-semibold">{m.name}</p>
                <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">{m.desc}</p>
              </div>
              <p className="shrink-0 font-bold tabular-nums">{m.price}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* お客様の声 */}
      <section className="bg-white py-16 dark:bg-stone-900">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <h2 className="text-xs font-semibold tracking-[0.3em] text-rose-500">VOICE</h2>
          <p className="mt-2 text-2xl font-bold sm:text-3xl">お客様の声</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {VOICES.map((v, i) => (
              <figure key={i} className="rounded-2xl bg-stone-50 p-5 dark:bg-stone-800">
                <div className="flex gap-0.5 text-amber-400" aria-label="5つ星">
                  {Array.from({ length: 5 }, (_, j) => (
                    <Star key={j} className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                  ))}
                </div>
                <blockquote className="mt-3 text-sm leading-relaxed">{v}</blockquote>
                <figcaption className="mt-3 text-xs text-stone-400">{['30代・会社員', '20代・学生', '40代・自営業'][i]}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* よくある質問（長さ稼ぎを兼ねる） */}
      <section className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
        <h2 className="text-xs font-semibold tracking-[0.3em] text-rose-500">FAQ</h2>
        <p className="mt-2 text-2xl font-bold sm:text-3xl">よくある質問</p>
        <dl className="mt-8 space-y-4">
          {[
            ['当日予約はできますか？', '空きがあれば当日でもご予約いただけます。Web予約なら24時間受け付けています。'],
            ['駐車場はありますか？', '専用駐車場はございません。近隣のコインパーキングをご利用ください。'],
            ['子ども連れでも大丈夫ですか？', 'キッズスペースをご用意しています。ご予約時にお知らせください。'],
            ['支払い方法は？', '現金・各種クレジットカード・電子マネーに対応しています。'],
            ['キャンセル料はかかりますか？', '前日までのご連絡であれば無料です。当日キャンセルは施術料金の50%を頂戴します。'],
          ].map(([q, a]) => (
            <div key={q} className="rounded-2xl bg-white p-5 shadow-sm dark:bg-stone-900">
              <dt className="font-semibold">Q. {q}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-stone-500 dark:text-stone-400">{a}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* アクセス */}
      <section className="mx-auto max-w-3xl px-5 pb-24 pt-8 sm:px-8">
        <h2 className="text-xs font-semibold tracking-[0.3em] text-rose-500">ACCESS</h2>
        <p className="mt-2 text-2xl font-bold sm:text-3xl">店舗情報</p>
        <div className="mt-8 aspect-[16/9] rounded-3xl bg-gradient-to-br from-stone-200 to-stone-300 dark:from-stone-800 dark:to-stone-700" aria-hidden="true" />
        <ul className="mt-6 space-y-3 text-sm">
          <li className="flex items-center gap-3"><MapPin className="h-4 w-4 text-rose-500" aria-hidden="true" />〇〇市中央1-2-3 2F（架空の住所）</li>
          <li className="flex items-center gap-3"><Clock className="h-4 w-4 text-rose-500" aria-hidden="true" />10:00〜20:00（火曜定休）</li>
          <li className="flex items-center gap-3"><Phone className="h-4 w-4 text-rose-500" aria-hidden="true" />03-0000-0000</li>
        </ul>
      </section>

      <MobileStickyCTA {...props} />
    </div>
  );
}

export default function App() {
  return <MobileStickyCTADemo />;
}
