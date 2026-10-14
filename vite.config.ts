import { defineConfig, loadEnv } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/* GTM（Google タグマネージャー）を本番ビルドの index.html に差し込む
 * - ID は環境変数 VITE_GTM_ID（例：GTM-XXXXXXX）。Vercel の Environment Variables か .env.production で設定
 * - 空のときや dev サーバーでは何も入れない（ローカルの閲覧を計測しない）
 * - iframe（プレイグラウンドのプレビュー）の中では読み込まない */
function gtm(id: string | undefined): Plugin {
  return {
    name: 'inject-gtm',
    apply: 'build',
    transformIndexHtml() {
      if (!id || !/^GTM-[A-Z0-9]+$/.test(id)) return [];
      return [
        {
          tag: 'script',
          injectTo: 'head',
          children: `if(window.self===window.top){(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${id}');}`,
        },
        {
          tag: 'noscript',
          injectTo: 'body-prepend',
          children: `<iframe src="https://www.googletagmanager.com/ns.html?id=${id}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
        },
      ]
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  return {
    plugins: [
      react(),
      tailwindcss(),
      gtm(env.VITE_GTM_ID),
    ],
  }
})
