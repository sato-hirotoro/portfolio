import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// src/ を Vite のルートにする（index.html と public/ も src/ 配下）
// 独自ドメイン or <user>.github.io リポジトリなら '/'
// https://<user>.github.io/<repo>/ で公開する間は VITE_BASE=/<repo>/ を指定
export default defineConfig({
  root: 'src',
  base: process.env.VITE_BASE ?? '/',
  plugins: [react()],
  // 依存ライブラリを起動時にまとめて事前ビルドする
  // （初回アクセス時に見つけて作り直すと、読み込み途中で止まることがあるため）
  optimizeDeps: {
    include: ['react', 'react/jsx-dev-runtime', 'react-dom/client', 'react-router'],
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
});
