/* =========================================================
 * サイト共通の設定
 * - GITHUB_REPO：ソースコードを公開している GitHub リポジトリの URL（末尾スラッシュなし）
 *   空文字のときは「GitHubで見る」リンクを表示しない
 * ========================================================= */
export const GITHUB_REPO = 'https://github.com/emodesign05/emodesign-ui';
export const GITHUB_BRANCH = 'main';

/** src/components/<名前>.tsx の GitHub 上の URL */
export function githubFileUrl(name: string) {
  return GITHUB_REPO ? `${GITHUB_REPO}/blob/${GITHUB_BRANCH}/src/components/${name}.tsx` : '';
}
