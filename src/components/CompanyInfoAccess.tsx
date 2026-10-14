import { useEffect, useRef, useState } from 'react';
import { Bus, Car, Check, Copy, ExternalLink, MapPin, Train } from 'lucide-react';

/* =========================================================
 * 会社概要・アクセス（Company Info + Access）
 * - 定義リスト（<dl>）で組んだ会社概要テーブル ＋ Google マップ埋め込み ＋ 最寄駅・徒歩分などのアクセス情報
 * - 地図は API キー不要の埋め込み URL（https://maps.google.com/maps?q=<住所>&output=embed）を iframe で表示
 *   loading="lazy" で画面に近づくまで読み込まない。表示前はグリッド模様のプレースホルダーを敷いておく
 * - 「住所をコピー」ボタン（Clipboard API）と「Google マップで開く」リンク付き
 * - 会社名・住所は架空。地図の検索語（mapQuery）だけ実在の地名（初期値：東京駅）を使う
 * - レイアウトは side（PC で地図と表を左右）/ stack（地図を上に全幅）を切り替え可能。スマホは常に縦積み
 * - アクセシビリティ：iframe に title、コピー結果は aria-live で読み上げ、各ボタンに focus-visible リング
 * - prefers-reduced-motion: reduce のときはボタンの色トランジションを止める（motion-safe: で付与）。地図自体は静的
 * ========================================================= */

const ACCENTS = {
  indigo: { text: 'text-indigo-600 dark:text-indigo-400', soft: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300', btn: 'bg-indigo-600 hover:bg-indigo-700', ring: 'focus-visible:ring-indigo-500' },
  rose: { text: 'text-rose-600 dark:text-rose-400', soft: 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300', btn: 'bg-rose-600 hover:bg-rose-700', ring: 'focus-visible:ring-rose-500' },
  emerald: { text: 'text-emerald-600 dark:text-emerald-400', soft: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300', btn: 'bg-emerald-600 hover:bg-emerald-700', ring: 'focus-visible:ring-emerald-500' },
  slate: { text: 'text-slate-700 dark:text-slate-200', soft: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200', btn: 'bg-slate-900 hover:bg-slate-800 dark:bg-slate-700', ring: 'focus-visible:ring-slate-500' },
} as const;

const ADDRESS = '〒100-0005 東京都千代田区丸の内9-9-9 サンプルスクエア 12F';

const PROFILE: { term: string; desc: string | string[] }[] = [
  { term: '会社名', desc: '株式会社ルミナリエ・ワークス（Luminarie Works Inc.）' },
  { term: '設立', desc: '2014年4月1日' },
  { term: '代表者', desc: '代表取締役　森川 透' },
  { term: '資本金', desc: '3,000万円' },
  { term: '従業員数', desc: '48名（2026年4月時点）' },
  { term: '所在地', desc: ADDRESS },
  { term: '事業内容', desc: ['Web サイト・アプリの企画／デザイン／開発', 'ブランディング・グラフィックデザイン', 'デジタルマーケティング支援'] },
  { term: '取引銀行', desc: 'サンプル銀行 丸の内支店' },
];

const ACCESS = [
  { icon: Train, line: 'JR 各線「東京駅」', detail: '丸の内北口より', minutes: 4 },
  { icon: Train, line: '東京メトロ丸ノ内線「東京駅」', detail: '地下通路 M2 出口より', minutes: 3 },
  { icon: Bus, line: '都営バス「丸の内一丁目」', detail: '停留所より', minutes: 2 },
];

export type CompanyInfoAccessProps = {
  /** アクセント色 */
  accent?: keyof typeof ACCENTS;
  /** 地図の検索語（実在の地名・住所。例：東京駅、大阪駅） */
  mapQuery?: string;
  /** 地図のズーム（10〜20） */
  zoom?: number;
  /** 地図の高さ（px） 240〜560 */
  mapHeight?: number;
  /** レイアウト：side = PC で左右 / stack = 地図を上に全幅 */
  layout?: 'side' | 'stack';
  /** 地図をモノクロにする（ブランドカラーと馴染ませたいとき） */
  grayscale?: boolean;
};

export function CompanyInfoAccess({
  accent = 'indigo',
  mapQuery = '東京駅',
  zoom = 16,
  mapHeight = 400,
  layout = 'side',
  grayscale = false,
}: CompanyInfoAccessProps) {
  const ac = ACCENTS[accent];
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const q = encodeURIComponent(mapQuery);
  const embed = `https://maps.google.com/maps?q=${q}&z=${zoom}&hl=ja&output=embed`;
  const external = `https://www.google.com/maps/search/?api=1&query=${q}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(ADDRESS);
    } catch {
      // クリップボードが使えない環境でも表示上は完了扱いにする
    }
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2000);
  };

  const side = layout === 'side';

  const map = (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800" style={{ height: mapHeight }}>
      {/* 読み込み前のプレースホルダー（iframe が上に重なる） */}
      <div
        aria-hidden
        className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(rgba(148,163,184,.18)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,.18)_1px,transparent_1px)] bg-[size:24px_24px]"
      >
        <MapPin className={`h-8 w-8 ${ac.text}`} />
      </div>
      <iframe
        title={`アクセスマップ（${mapQuery}周辺）`}
        src={embed}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className={`absolute inset-0 h-full w-full border-0 ${grayscale ? 'grayscale' : ''}`}
        allowFullScreen
      />
    </div>
  );

  return (
    <section className="w-full min-w-0 max-w-6xl" aria-labelledby="company-heading">
      <div className={`grid gap-8 ${side ? 'lg:grid-cols-[1.1fr_1fr] lg:gap-10' : ''}`}>
        {/* 会社概要 */}
        <div className={side ? '' : 'order-2'}>
          <p className={`text-xs font-bold tracking-[0.2em] ${ac.text}`}>COMPANY</p>
          <h2 id="company-heading" className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            会社概要
          </h2>
          <dl className="mt-8 divide-y divide-slate-100 rounded-3xl border border-slate-200 bg-white px-5 sm:px-8 dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
            {PROFILE.map((row) => (
              <div key={row.term} className="grid gap-1 py-4 sm:grid-cols-[8rem_1fr] sm:gap-6 sm:py-5">
                <dt className="text-xs font-bold text-slate-500 sm:pt-0.5 sm:text-sm dark:text-slate-400">{row.term}</dt>
                <dd className="text-sm leading-relaxed text-slate-800 dark:text-slate-100">
                  {Array.isArray(row.desc) ? (
                    <ul className="space-y-1">
                      {row.desc.map((d) => (
                        <li key={d} className="flex gap-2">
                          <span aria-hidden className={`mt-2 h-1 w-1 shrink-0 rounded-full bg-current ${ac.text}`} />
                          {d}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    row.desc
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* アクセス */}
        <div className={side ? '' : 'order-1'}>
          <p className={`text-xs font-bold tracking-[0.2em] ${ac.text}`}>ACCESS</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">アクセス</h2>
          <div className="mt-8">{map}</div>

          <div className="mt-5 flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
            <p className="flex gap-2 text-sm leading-relaxed text-slate-800 dark:text-slate-100">
              <MapPin aria-hidden className={`mt-0.5 h-4 w-4 shrink-0 ${ac.text}`} />
              {ADDRESS}
            </p>
            <ul className={`grid gap-2 ${side ? '' : 'sm:grid-cols-3'}`}>
              {ACCESS.map((a) => (
                <li key={a.line} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-800/60">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${ac.soft}`}>
                    <a.icon aria-hidden className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-slate-800 dark:text-slate-100">{a.line}</span>
                    <span className="block text-xs text-slate-500 dark:text-slate-400">{a.detail}</span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="text-[10px] text-slate-400">徒歩</span>
                    <span className="ml-0.5 text-xl font-black tabular-nums text-slate-900 dark:text-white">{a.minutes}</span>
                    <span className="text-xs font-bold text-slate-500">分</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="flex items-start gap-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              <Car aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              専用駐車場はございません。お車でお越しの際は近隣のコインパーキングをご利用ください。
            </p>
            <div className="mt-1 flex flex-col gap-2 sm:flex-row">
              <a
                href={external}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex flex-1 items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-white shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${ac.btn} ${ac.ring}`}
              >
                Google マップで開く
                <ExternalLink aria-hidden className="h-4 w-4" />
                <span className="sr-only">（新しいタブ）</span>
              </a>
              <button
                type="button"
                id="copy-address"
                onClick={copy}
                className={`inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 motion-safe:transition dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus-visible:ring-offset-slate-900 ${ac.ring}`}
              >
                {copied ? <Check aria-hidden className="h-4 w-4 text-emerald-500" /> : <Copy aria-hidden className="h-4 w-4" />}
                {copied ? 'コピーしました' : '住所をコピー'}
              </button>
            </div>
            <span className="sr-only" aria-live="polite">
              {copied ? '住所をコピーしました' : ''}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function App() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-16 sm:px-8 sm:py-24 dark:bg-slate-950">
      <div className="mx-auto flex max-w-6xl justify-center">
        <CompanyInfoAccess />
      </div>
    </main>
  );
}
