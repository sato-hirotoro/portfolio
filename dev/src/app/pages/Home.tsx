import { useCallback, useEffect, useState } from 'react';
import Splash from '../components/Splash';
import Skyline from '../components/Skyline';

// トップページ: オープニング（初回のみ）→ ヒーロー（街の全景）
// 記事の一覧は Tech・Diary の専用ページにまかせる（移動はヘッダーのナビから）

// オープニングを出すのは、サイトを開いたページが Home のとき（直接来た・再読み込みした）だけ
// サイト内のリンクで Home に戻ってきたときは出さない
let splashPending = true;

function isFirstPageOfTab() {
  // React Router は履歴の位置を history.state.idx に持つ。0 ならこのタブで最初に開いたページ
  const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
  return idx === 0;
}

export default function Home() {
  // 初期化関数は StrictMode で 2 回呼ばれることがあるので、ここでは読むだけにする
  const [showSplash, setShowSplash] = useState(() => splashPending && isFirstPageOfTab());
  const hideSplash = useCallback(() => setShowSplash(false), []);

  // 一度 Home を表示したら、以降はオープニングを出さない
  useEffect(() => {
    splashPending = false;
  }, []);

  return (
    <>
      {showSplash && <Splash onDone={hideSplash} />}

      {/* ヒーロー: 看板・会話ウィンドウ・ボタン・街並み */}
      <section className="hero">
        <p className="hero-welcome">Welcomeませ</p>
        <h1 className="hero-name">New Hiroto Cityへ！</h1>

        <div className="dialog hero-dialog">
          <p>
            <span aria-hidden="true">◆</span>こんにちは　ここでは　わたしがかいた　きじを　まとめています
            <span className="dialog-next" aria-hidden="true">
              ▼
            </span>
          </p>
        </div>

        <Skyline className="hero-skyline" />
        <div className="earth" aria-hidden="true" />
      </section>
    </>
  );
}
