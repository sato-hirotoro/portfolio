// すべてのテストの前に読み込む準備
import '@testing-library/jest-dom/vitest'; // toBeInTheDocument() などの確認方法を使えるようにする

// jsdom には画面のスクロールがないため、何もしない関数にしておく（Layout がページ移動時に呼ぶ）
// スクリプトのテスト（node 環境）には window がないので、あるときだけ設定する
if (typeof window !== 'undefined') {
  window.scrollTo = () => {};
}
