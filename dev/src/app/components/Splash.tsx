import { useEffect, type AnimationEvent } from 'react';
import Limo from './Limo';
import styles from './Splash.module.css';

// アニメーションの合計時間（Splash.module.css の --drive = 3 秒 + 幕が消える 0.4 秒）より少し長め。
// animationend が届かなかった場合（タブが裏にあるなど）の保険
const FALLBACK_MS = 4200;

// サイトを Home から開いたとき（直接来た・再読み込みした）に出すオープニング
// リムジンが右から左へ一定の速さで走り抜け、真ん中あたりで運転席から顔を出す。走り去ったら Home を見せる
// 画面を押すとすぐに閉じる。アニメーションが終わったら onDone を呼んで、この要素を取り除く
export default function Splash({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onDone, FALLBACK_MS);
    return () => window.clearTimeout(timer);
  }, [onDone]);

  const handleAnimationEnd = (e: AnimationEvent<HTMLDivElement>) => {
    // 子要素（リムジンなど）のアニメーション終了は無視し、幕が消え終わったときだけ閉じる
    if (e.target === e.currentTarget) onDone();
  };

  return (
    <div className={styles.splash} onAnimationEnd={handleAnimationEnd} onClick={onDone} role="presentation">
      <div className={styles.stage}>
        <div className={styles.car}>
          <Limo className={styles.limo} />
        </div>
        <div className={styles.road} />
      </div>
      <p className={styles.loading}>NOW LOADING</p>
    </div>
  );
}
