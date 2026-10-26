// UT-P06-01〜08、UT-P07-01〜06、UT-P10: 記事データの小さな関数（src/app/data/articles.ts）
// 記事の JSON はテスト用のデータ（test/fixtures）に差し替えている（vitest.config.ts）
import {
  articleEmoji,
  articleMeta,
  articlePath,
  fetchArticleHtml,
  findArticleByFloor,
  floorLabel,
  formatDate,
  hatena,
  likesLabel,
  qiita,
  type Article,
} from '../../src/app/data/articles';

const article = (over: Partial<Article> = {}): Article => ({
  slug: 'a',
  floor: 1,
  title: 'T',
  url: 'https://example.com/a',
  publishedAt: '2026-10-25T02:38:19+09:00',
  tags: [],
  summary: '',
  thumbnail: null,
  likes: null,
  ...over,
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('UT-P06 記事一覧の表示に使う関数', () => {
  test('UT-P06-01: floorLabel', () => {
    expect(floorLabel(1)).toBe('1F');
    expect(floorLabel(409)).toBe('409F');
  });

  test('UT-P06-02: articlePath（qiita）', () => {
    expect(articlePath('qiita', article({ floor: 3 }))).toBe('/tech/3F');
  });

  test('UT-P06-03: articlePath（hatena）', () => {
    expect(articlePath('hatena', article({ floor: 12 }))).toBe('/diary/12F');
  });

  test('UT-P06-04: formatDate', () => {
    expect(formatDate('2026-10-25T02:38:19+09:00')).toEqual({ dotted: '2026.10.25', label: '2026年10月25日' });
  });

  test('UT-P06-05: formatDate（1 桁の月日）', () => {
    expect(formatDate('2026-01-05T09:00:00+09:00')).toEqual({ dotted: '2026.01.05', label: '2026年1月5日' });
  });

  test('UT-P06-06: likesLabel', () => {
    expect(likesLabel(article({ likes: 3 }))).toBe('♡ 3');
    expect(likesLabel(article({ likes: 0 }))).toBe('♡ 0');
    expect(likesLabel(article({ likes: null }))).toBeNull();
  });

  test('UT-P06-07: articleMeta（Qiita）', () => {
    expect(articleMeta(article({ publishedAt: '2026-08-31T10:00:00+09:00', likes: 2 }))).toBe('2026.08.31　♡ 2');
  });

  test('UT-P06-08: articleMeta（はてなブログ）', () => {
    expect(articleMeta(article({ likes: null }))).toBe('2026.10.25');
  });
});

describe('UT-P07 記事詳細に使う関数', () => {
  test('UT-P07-01: findArticleByFloor（その階の記事あり）', () => {
    expect(findArticleByFloor('qiita', '3F')?.slug).toBe('qiita-3');
    expect(findArticleByFloor('hatena', '1F')?.slug).toBe('1001');
  });

  test('UT-P07-02: findArticleByFloor（小文字の f）', () => {
    expect(findArticleByFloor('qiita', '3f')?.slug).toBe('qiita-3');
  });

  test('UT-P07-03: findArticleByFloor（その階の記事なし）', () => {
    expect(findArticleByFloor('qiita', '99F')).toBeUndefined();
  });

  test('UT-P07-04: findArticleByFloor（形式が違う）', () => {
    for (const param of ['abc', '3', 'F3', '']) {
      expect(findArticleByFloor('qiita', param)).toBeUndefined();
    }
  });

  test('UT-P07-05: fetchArticleHtml（200）', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ html: '<p>a</p>' })));
    vi.stubGlobal('fetch', fetchMock);
    expect(await fetchArticleHtml('qiita', 'qiita-1')).toBe('<p>a</p>');
    expect(fetchMock).toHaveBeenCalledWith('/articles/qiita/qiita-1.json');
  });

  test('UT-P07-06: fetchArticleHtml（404）', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 404 })));
    await expect(fetchArticleHtml('qiita', 'x')).rejects.toThrow('記事の本文を読み込めませんでした（404）');
  });
});

describe('UT-P10 カードの絵文字', () => {
  test('UT-P10-01: 同じ記事なら、何回呼んでも同じ絵文字', () => {
    const a = article({ slug: '14945776032094859597' });
    expect(articleEmoji(a)).toBe(articleEmoji(a));
  });

  test('UT-P10-02: どの記事 ID でも、候補 20 種類のどれか', () => {
    const slugs = ['a', 'b', 'xyz', '123', 'c7f3e9a1b2d4', ...qiita.articles.map((x) => x.slug), ...hatena.articles.map((x) => x.slug)];
    const results = new Set(slugs.map((slug) => articleEmoji(article({ slug }))));
    for (const emoji of results) expect(emoji).toMatch(/\p{Extended_Pictographic}/u);
    expect(results.size).toBeGreaterThan(1);
  });
});
