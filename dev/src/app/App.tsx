import { Navigate, Route, Routes } from 'react-router';
import Layout from './components/Layout';
import Home from './pages/Home';
import ArticleListPage from './pages/ArticleListPage';
import ArticleDetail from './pages/ArticleDetail';
import About from './pages/About';
import NotFound from './pages/NotFound';

// ルーティング（URL とページの対応）
// すべてのページを Layout（ヘッダー・フッター）の中に表示する
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        {/* 技術記事（Qiita）。詳細は階数で指定: /tech/1F */}
        <Route path="tech" element={<ArticleListPage source="qiita" />} />
        <Route path="tech/:floor" element={<ArticleDetail source="qiita" />} />
        {/* 日記（はてなブログ）。詳細は階数で指定: /diary/1F */}
        <Route path="diary" element={<ArticleListPage source="hatena" />} />
        <Route path="diary/:floor" element={<ArticleDetail source="hatena" />} />
        <Route path="about" element={<About />} />
        {/* 旧 URL（「旅」を「日記」に改名する前）は日記の一覧へ */}
        <Route path="travel/*" element={<Navigate to="/diary" replace />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
