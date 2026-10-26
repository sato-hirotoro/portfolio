// アプリの入り口。index.html の <div id="root"> に React のアプリを描画する
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import App from './App';
import './styles/global.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* basename: GitHub Pages を /<repo>/ で公開する場合に備えて、ビルド時の公開パス（VITE_BASE）に合わせる */}
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
