import { Link } from 'react-router';
import { articleEmoji, articleMeta, articlePath, floorLabel, type Article, type Source } from '../data/articles';
import styles from './ArticleCard.module.css';

type Props = {
  source: Source;
  article: Article;
};

// 記事 1 件のカード（Tech・Diary・Home で共通。Tech と Diary で同じ見た目にする）
// 左上の階数表示「1F」、日付（Qiita は ♡ いいねの数）、タイトル、絵文字、タグを並べる
// 本文は載せず、押すとサイト内の詳細ページ（/tech/1F など）で読める
export default function ArticleCard({ source, article }: Props) {
  const floor = floorLabel(article.floor);

  return (
    <Link className={styles.card} to={articlePath(source, article)}>
      {/* 階数表示。1 文字ずつ箱に入れる（読み上げは「1階」） */}
      <span className={styles.floor} aria-label={`${article.floor}階`}>
        {[...floor].map((char, i) => (
          <span key={i} aria-hidden="true">
            {char}
          </span>
        ))}
      </span>
      <p className={styles.meta}>{articleMeta(article)}</p>
      <h3 className={styles.title}>{article.title}</h3>
      {/* 本文のかわりに飾る絵文字（記事ごとに決まる） */}
      <p className={styles.emoji} aria-hidden="true">
        {articleEmoji(article)}
      </p>
      {/* Qiita のタグ / はてなブログのカテゴリ */}
      {article.tags.length > 0 && (
        <ul className={styles.tags}>
          {article.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      )}
      <span className={styles.more}>
        <span className={styles.moreArrow} aria-hidden="true">
          ▶
        </span>{' '}
        よむ
      </span>
    </Link>
  );
}
