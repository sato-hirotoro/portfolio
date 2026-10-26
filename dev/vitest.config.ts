// 単体テストの設定（Vitest）
// 実行: npm test
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// 日付の表示（formatDate）は実行環境の時刻帯に左右されるため、テストは日本時間で行う
process.env.TZ = 'Asia/Tokyo';

const fixtures = fileURLToPath(new URL('./test/fixtures/', import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      // 記事データ（ビルド時に生成される JSON）のかわりに、内容が決まったテスト用のデータを使う
      { find: /^\.\/generated\/(qiita|hatena)\.json$/, replacement: `${fixtures}$1.json` },
    ],
  },
  test: {
    environment: 'jsdom', // 画面の部品をテストするため、ブラウザの代わりの環境を使う（スクリプトのテストはファイルの先頭で node を指定）
    globals: true,
    setupFiles: ['./test/setup.ts'],
    include: ['test/**/*.test.{ts,tsx,mjs}'],
  },
});
