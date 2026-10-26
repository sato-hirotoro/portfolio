import ArticleCard from './ArticleCard';
import FeedEmpty from './FeedEmpty';
import { feeds, SOURCE_PAGES, type Source } from '../data/articles';

// 記事カードの一覧（グリッド）。記事がなければ「まだ記事がありません」を出す
export default function ArticleList({ source }: { source: Source }) {
  const feed = feeds[source];
  const { articles } = feed;

  if (articles.length === 0) {
    return <FeedEmpty feed={feed} configKey={SOURCE_PAGES[source].configKey} />;
  }

  return (
    <div className="grid">
      {articles.map((article) => (
        <ArticleCard key={article.slug} source={source} article={article} />
      ))}
    </div>
  );
}
