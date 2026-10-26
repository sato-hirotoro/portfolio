import { useState } from 'react';
import { Link, NavLink } from 'react-router';
import styles from './Header.module.css';

// ナビゲーションの項目（左から順に並ぶ）
const NAV_ITEMS = [
  { to: '/', label: 'Home', ja: 'ホーム' },
  { to: '/tech', label: 'Tech', ja: '技術' },
  { to: '/diary', label: 'Diary', ja: '日記' },
  { to: '/about', label: 'About', ja: '自己紹介' },
];

// 全ページ共通のヘッダー: ロゴ（顔のアイコン + 名前）とナビゲーション。下に地層の帯
// スマホ幅（680px 以下）ではナビを ☰ ボタンで開閉する
export default function Header() {
  // スマホのメニューが開いているか
  const [open, setOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link to="/" className={styles.logo} onClick={() => setOpen(false)}>
          {/* オープニングでリムジンから顔を出す人の顔 */}
          <img className={styles.logoIcon} src={`${import.meta.env.BASE_URL}driver-face.png`} alt="" width="44" height="44" />
          <span className={styles.logoText}>Sato Hiroto</span>
        </Link>
        <button
          className={styles.menuButton}
          aria-label="メニューを開閉"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          ☰
        </button>
        <nav className={`${styles.nav} ${open ? styles.open : ''}`}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              // Home は "/" と完全に一致するときだけ選択中にする（ほかのページでも選択中にならないように）
              end={item.to === '/'}
              className={({ isActive }) => (isActive ? `${styles.link} ${styles.active}` : styles.link)}
              onClick={() => setOpen(false)}
            >
              <span className={styles.linkJa}>{item.ja}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="earth" aria-hidden="true" />
    </header>
  );
}
