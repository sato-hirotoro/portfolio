import PageHeader from '../components/PageHeader';
import ArticleList from '../components/ArticleList';
import { feeds, SOURCE_PAGES, type Source } from '../data/articles';

// 記事一覧ページ（/tech は Qiita、/diary ははてなブログ）
// 2 つのページを切り替えても部品の位置がずれないよう、同じ部品を同じ順番で並べ、違いは文言と色（SOURCE_PAGES）だけにする
export default function ArticleListPage({ source }: { source: Source }) {
  const page = SOURCE_PAGES[source];
  const { profileUrl } = feeds[source];

  return (
    // ページ全体を枠で囲む（Home の Tech・Diary と同じまとまりの見た目）
    <section className="section-group">
      <PageHeader kicker={page.kicker} title={page.title} lead={page.lead} tone={page.tone} />
      <ArticleList source={source} />
      {profileUrl && (
        <p className="more">
          <a href={profileUrl} target="_blank" rel="noreferrer" className="button button-ghost">
            {page.serviceName}で読む <span className="button-arrow" aria-hidden="true">▶</span>
          </a>
        </p>
      )}
    </section>
  );
}
