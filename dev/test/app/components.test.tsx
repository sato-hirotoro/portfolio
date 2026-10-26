// UT-P06-09〜14: 記事一覧・記事カード（ArticleList、ArticleCard）
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import ArticleList from '../../src/app/components/ArticleList';
import ArticleCard from '../../src/app/components/ArticleCard';
import { articlePath, feeds, hatena, qiita, type Feed } from '../../src/app/data/articles';

const renderInRouter = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('ArticleList', () => {
  test('UT-P06-09: 記事の数だけカードを、JSON の並び（新しい順）のまま出す', () => {
    renderInRouter(<ArticleList source="qiita" />);
    const titles = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    expect(titles).toEqual(qiita.articles.map((a) => a.title));
    expect(titles).toEqual(['三番目の技術記事', '二番目の技術記事', '一番目の技術記事']);
  });

  describe('記事が 0 件のとき', () => {
    let original: Feed;
    beforeEach(() => {
      original = feeds.qiita;
      feeds.qiita = { configured: false, profileUrl: null, fetchedAt: null, articles: [] };
    });
    afterEach(() => {
      feeds.qiita = original;
      vi.unstubAllEnvs();
    });

    test('UT-P06-10: 未設定・開発中なら、設定方法を出す', () => {
      vi.stubEnv('DEV', true);
      renderInRouter(<ArticleList source="qiita" />);
      expect(screen.getByText(/feeds\.config\.json の「qiita\.userId」を設定すると/)).toBeInTheDocument();
    });

    test('UT-P06-11: 本番なら「まだ記事がありません。」', () => {
      vi.stubEnv('DEV', false);
      renderInRouter(<ArticleList source="qiita" />);
      expect(screen.getByText('まだ記事がありません。')).toBeInTheDocument();
      expect(screen.queryByText(/feeds\.config\.json/)).not.toBeInTheDocument();
    });
  });
});

describe('ArticleCard', () => {
  test('UT-P06-12: Qiita の記事は、階数・日付・♡・タイトル・絵文字・タグを出し、概要は出さない', () => {
    const article = qiita.articles[0];
    renderInRouter(<ArticleCard source="qiita" article={article} />);
    const card = screen.getByRole('link');
    expect(within(card).getByLabelText('3階')).toHaveTextContent('3F');
    expect(card.textContent).toContain('2026.10.25　♡ 0'); // 全角スペース区切り（toHaveTextContent は空白をまとめてしまうので textContent で比べる）
    expect(within(card).getByRole('heading')).toHaveTextContent('三番目の技術記事');
    expect(within(card).getAllByRole('listitem').map((li) => li.textContent)).toEqual(['React', 'TypeScript']);
    expect(card).toHaveTextContent(/\p{Extended_Pictographic}/u);
    expect(card).not.toHaveTextContent(article.summary);
  });

  test('UT-P06-13: はてなブログの記事は、♡ とアイキャッチ画像を出さない', () => {
    const article = hatena.articles[0];
    expect(article.thumbnail).not.toBeNull(); // 画像があっても出さないことを確かめる
    renderInRouter(<ArticleCard source="hatena" article={article} />);
    const card = screen.getByRole('link');
    expect(card).not.toHaveTextContent('♡');
    expect(card.querySelector('img')).toBeNull();
  });

  test('UT-P06-14: リンク先は articlePath() の URL', () => {
    const article = hatena.articles[1];
    renderInRouter(<ArticleCard source="hatena" article={article} />);
    expect(screen.getByRole('link')).toHaveAttribute('href', articlePath('hatena', article));
    expect(screen.getByRole('link')).toHaveAttribute('href', '/diary/1F');
  });
});
