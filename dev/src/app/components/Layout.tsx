import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import Header from './Header';
import Footer from './Footer';

// ブラウザのタブに出すタイトルの後ろに付ける名前
const SITE_NAME = 'SatoHiroto';

/**
 * URL から、タブのタイトルに出すページ名を決める
 * 記事の詳細（/tech/1F、/diary/1F）は親のページ（Tech / Diary）と同じにする
 */
function pageName(pathname: string) {
  const first = pathname.split('/')[1] ?? '';
  const names: Record<string, string> = { '': 'Home', tech: 'Tech', diary: 'Diary', about: 'About' };
  return names[first] ?? '404';
}

// 全ページ共通のレイアウト: ヘッダー → ページ本体（Outlet）→ フッター
export default function Layout() {
  const { pathname } = useLocation();

  // タブのタイトル: 「Home　|　SatoHiroto」のように、ページ名と名前を並べる
  useEffect(() => {
    document.title = `${pageName(pathname)}　|　${SITE_NAME}`;
  }, [pathname]);

  // ページを移動したら先頭までスクロールする（SPA ではブラウザが自動で戻さないため）
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="app">
      <Header />
      <main className="container main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
