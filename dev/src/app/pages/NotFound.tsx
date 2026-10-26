import { Link } from 'react-router';
import PageHeader from '../components/PageHeader';

// 存在しない URL・存在しない記事（/tech/99F など）のときに表示する
export default function NotFound() {
  return (
    <>
      <PageHeader kicker="▶ まいごの おしらせ" title="404" lead="そのページは みつからなかった……" tone="green" />
      <p className="more">
        <Link to="/" className="button">Home に もどる</Link>
      </p>
    </>
  );
}
