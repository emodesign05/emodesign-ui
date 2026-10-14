/* =========================================================
 * アクセス解析（GTM → GA4）
 * - GTM のスニペットは vite.config.ts が本番ビルド時に index.html へ差し込む（VITE_GTM_ID が空なら何もしない）
 * - このサイトはハッシュルーティング（#/名前）なので、GA4 の自動ページビューではなく
 *   ルートが変わるたびに dataLayer へ「spa_page_view」を送り、GTM 側で GA4 の page_view に変換する
 *   （GTM の「履歴の変更」トリガーは、プレイグラウンドの replaceState でも発火して重複するため使わない）
 * - page_location はハッシュを通常のパスに直した仮想 URL（例：https://ui.emodesign.jp/SpotlightCard）
 *   → GA4 の「ページパス」にコンポーネント名がそのまま出る
 * - プレイグラウンド内の iframe（#/embed/〜）では GTM を読み込まないので送信もしない
 * ========================================================= */

type DataLayerEvent = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: DataLayerEvent[];
  }
}

let lastPath: string | null = null;

/** 仮想パス（'/', '/SpotlightCard', '/embed/SpotlightCard'）でページビューを送る */
export function trackPageView(virtualPath: string) {
  if (window.self !== window.top) return; // iframe の中は計測しない
  if (virtualPath === lastPath) return; // 同じページの連続送信を防ぐ
  lastPath = virtualPath;
  (window.dataLayer ??= []).push({
    event: 'spa_page_view',
    page_path: virtualPath,
    page_location: `${window.location.origin}${virtualPath}`,
    page_title: document.title,
  });
}
