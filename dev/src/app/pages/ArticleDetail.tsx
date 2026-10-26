import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router';
import PageHeader from '../components/PageHeader';
import NotFound from './NotFound';
import { fetchArticleHtml, findArticleByFloor, floorLabel, formatDate, likesLabel, type Article, type Source } from '../data/articles';

// 記事の詳細ページ（/tech/1F は Qiita、/diary/1F ははてなブログ）
// 本文はビルド時に保存した HTML を読み込み、このサイトのデザイン（global.css の .article-body）で表示する

// 取得元ごとの表示の違い
const SOURCES = {
  qiita: {
    name: 'Qiita',
    listPath: '/tech',
    listLabel: '技術記事の一覧へ',
    originalLabel: 'Qiitaで読む',
    kicker: () => '▶ 技術記事',
  },
  hatena: {
    name: 'はてなブログ',
    listPath: '/diary',
    listLabel: '日記の一覧へ',
    originalLabel: 'はてなブログで読む',
    kicker: (article: Article) => `▶ ${article.tags[0] ?? '日記'}`,
  },
} as const;

// URL の階数（:floor = "1F" など）から記事を探す。見つからなければ 404
export default function ArticleDetail({ source }: { source: Source }) {
  const { floor = '' } = useParams();
  const article = findArticleByFloor(source, floor);

  if (!article) return <NotFound />;
  // key で記事ごとに作り直し、前の記事の本文が一瞬残らないようにする
  return <ArticleView key={article.slug} source={source} article={article} />;
}

/** 本文の読み込み状態 */
type BodyState = { status: 'loading' } | { status: 'success'; html: string } | { status: 'error'; message: string };

function ArticleView({ source, article }: { source: Source; article: Article }) {
  const info = SOURCES[source];
  const [body, setBody] = useState<BodyState>({ status: 'loading' });
  const bodyRef = useRef<HTMLDivElement>(null);
  const { label } = formatDate(article.publishedAt);

  // 本文の HTML（public/articles/<source>/<slug>.json）を読み込む
  useEffect(() => {
    let cancelled = false;
    fetchArticleHtml(source, article.slug)
      .then((html) => !cancelled && setBody({ status: 'success', html }))
      .catch((e: Error) => !cancelled && setBody({ status: 'error', message: e.message }));
    return () => {
      cancelled = true;
    };
  }, [source, article.slug]);

  useCanonical(article.url);

  // 外部の画像が表示できなかったときは、代わりのメッセージを出す
  useEffect(() => {
    if (body.status !== 'success' || !bodyRef.current) return;
    bodyRef.current.querySelectorAll('img').forEach((img) => {
      img.addEventListener('error', () => {
        const fallback = document.createElement('span');
        fallback.className = 'img-fallback';
        fallback.textContent = '画像を表示できませんでした';
        img.replaceWith(fallback);
      });
    });
  }, [body]);

  // 見出しの下に出す「階数・投稿日・♡ いいねの数」
  const lead = [floorLabel(article.floor), label, likesLabel(article)]
    .filter(Boolean)
    .join('　');

  return (
    // 一覧ページと同じく、ページ全体を枠で囲む
    <article className="section-group">
      <PageHeader kicker={info.kicker(article)} title={article.title} lead={lead} compact />

      {body.status === 'success' ? (
        // ビルド時にサニタイズ済みの HTML（scripts/sanitize-article.mjs）
        <div ref={bodyRef} className="prose article-body" dangerouslySetInnerHTML={{ __html: body.html }} />
      ) : (
        <p className={`status ${body.status === 'error' ? 'status-error' : ''}`} role={body.status === 'error' ? 'alert' : undefined}>
          {body.status === 'loading' ? '読み込み中…' : body.message}
        </p>
      )}

      {/* タグ・元の記事へのボタン・一覧へ戻るボタン */}
      {article.tags.length > 0 && (
        <ul className="tag-list article-tags">
          {article.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      )}

      {/* 左に「一覧へ」、右に「元の記事で読む」 */}
      <div className="article-actions">
        <Link to={info.listPath} className="button button-ghost">
          <span className="button-arrow" aria-hidden="true">◀</span> {info.listLabel}
        </Link>
        <a href={article.url} target="_blank" rel="noreferrer" className="button">
          {info.originalLabel} <span className="button-arrow" aria-hidden="true">▶</span>
        </a>
      </div>
      <p className="article-note">この記事は{info.name}に投稿したものです。</p>
    </article>
  );
}

/**
 * 正規の URL（元の記事）を <link rel="canonical"> で示す。検索エンジンに重複コンテンツと判断されないようにするため
 * （ページのタイトルは Layout が親ページ（Tech / Diary）に合わせて付ける）
 */
function useCanonical(canonicalUrl: string) {
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'canonical';
    link.href = canonicalUrl;
    document.head.appendChild(link);
    return () => link.remove();
  }, [canonicalUrl]);
}
