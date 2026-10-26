import FrogParade from './FrogParade';

// 全ページ共通のフッター: カエルの行列 → 地層の帯 → END？・©
export default function Footer() {
  return (
    <footer className="footer">
      <FrogParade />
      <div className="earth" aria-hidden="true" />
      <div className="footer-body">
        <div className="container">
          <p className="footer-bye">END？</p>
          <small>© {new Date().getFullYear()} Sato Hiroto</small>
        </div>
      </div>
    </footer>
  );
}
