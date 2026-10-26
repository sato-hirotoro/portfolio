// @vitest-environment node
// UT-P01-01〜11: 記事の取得（scripts/lib/sources.mjs）
// 本物の Qiita・はてなブログにはアクセスせず、fetch を偽物（モック）に置き換える
import { countHatenaEntries, fetchHatena, fetchQiita } from '../../scripts/lib/sources.mjs';

/** Qiita API が返す記事を 1 件作る */
function qiitaItem(i) {
  return {
    id: `id${i}`,
    title: `記事${i}`,
    url: `https://qiita.com/u/items/id${i}`,
    created_at: '2026-10-25T00:00:00+09:00',
    tags: [{ name: 'Test' }],
    body: '本文',
    rendered_body: '<p>本文</p>',
    likes_count: i,
  };
}

const json = (data, headers = {}) => new Response(JSON.stringify(data), { headers });
const xml = (body) => new Response(body, { headers: { 'content-type': 'application/xml' } });

/** はてなブログの Atom フィードを作る */
function feed(entries) {
  return `<?xml version="1.0" encoding="utf-8"?><feed xmlns="http://www.w3.org/2005/Atom">${entries.join('')}</feed>`;
}

function entry({ id = '123', categories = [], content = '&lt;p&gt;本文&lt;/p&gt;' } = {}) {
  return `<entry>
    <title>タイトル</title>
    <link href="https://test.hatenablog.com/entry/1"/>
    <id>hatenablog://entry/${id}</id>
    <published>2026-10-25T02:38:19+09:00</published>
    <summary type="html">概要</summary>
    <content type="html">${content}</content>
    ${categories.map((c) => `<category term="${c}" label="${c}" />`).join('')}
  </entry>`;
}

let fetchMock;
beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('fetchQiita', () => {
  test('UT-P01-01: 1 ページ分（100 件未満）なら 1 回だけ取得し、Total-Count を総数にする', async () => {
    fetchMock.mockResolvedValueOnce(json([qiitaItem(1), qiitaItem(2), qiitaItem(3)], { 'total-count': '5' }));
    const result = await fetchQiita('u', 100);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result.total).toBe(5);
    expect(result.articles).toHaveLength(3);
    expect(result.articles[0]).toMatchObject({ slug: 'id1', title: '記事1', likes: 1, tags: ['Test'], html: '<p>本文</p>' });
  });

  test('UT-P01-02: 1 ページ目がちょうど 100 件なら、2 ページ目も取得する', async () => {
    fetchMock
      .mockResolvedValueOnce(json(Array.from({ length: 100 }, (_, i) => qiitaItem(i))))
      .mockResolvedValueOnce(json([qiitaItem(100)]));
    const result = await fetchQiita('u', 200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][0]).toContain('page=2');
    expect(result.articles).toHaveLength(101);
  });

  test('UT-P01-03: maxItems を超えたら、そこで止める', async () => {
    fetchMock
      .mockResolvedValueOnce(json(Array.from({ length: 100 }, (_, i) => qiitaItem(i))))
      .mockResolvedValueOnce(json(Array.from({ length: 100 }, (_, i) => qiitaItem(100 + i))));
    const result = await fetchQiita('u', 150);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.articles).toHaveLength(150);
  });

  test('UT-P01-04: トークンがあれば Authorization ヘッダーを付ける', async () => {
    fetchMock.mockResolvedValueOnce(json([]));
    await fetchQiita('u', 100, 'secret-token');
    expect(fetchMock.mock.calls[0][1].headers).toEqual({ Authorization: 'Bearer secret-token' });
  });

  test('UT-P01-05: API がエラー（500）を返したら、エラーにする', async () => {
    fetchMock.mockResolvedValueOnce(new Response('error', { status: 500 }));
    await expect(fetchQiita('u', 100)).rejects.toThrow('500');
  });
});

describe('fetchHatena', () => {
  /** URL ごとに返す内容を決める（フィード・サイトマップ） */
  function route(responses) {
    fetchMock.mockImplementation(async (url) => {
      const body = responses[url];
      if (body === undefined) throw new Error(`想定外の URL: ${url}`);
      return xml(body);
    });
  }

  const emptySitemap = '<sitemapindex></sitemapindex>';

  test('UT-P01-06: 本文に記号（エンティティ）が大量にあっても、上限エラーにならず本文を取り出せる', async () => {
    const content = '&lt;b&gt;x&lt;/b&gt;'.repeat(1500);
    route({
      'https://test.hatenablog.com/feed': feed([entry({ content })]),
      'https://test.hatenablog.com/sitemap_index.xml': emptySitemap,
    });
    const result = await fetchHatena('https://test.hatenablog.com/');
    expect(result.articles[0].html).toContain('<b>x</b>');
  });

  test('UT-P01-07: カテゴリが 1 つ / 複数 / なし でも、tags は配列になる', async () => {
    route({
      'https://test.hatenablog.com/feed': feed([
        entry({ id: '1', categories: ['旅行'] }),
        entry({ id: '2', categories: ['旅行', '静岡'] }),
        entry({ id: '3' }),
      ]),
      'https://test.hatenablog.com/sitemap_index.xml': emptySitemap,
    });
    const { articles } = await fetchHatena('https://test.hatenablog.com');
    expect(articles.map((a) => a.tags)).toEqual([['旅行'], ['旅行', '静岡'], []]);
  });

  test('UT-P01-08: エントリー ID から slug を取り出す', async () => {
    route({
      'https://test.hatenablog.com/feed': feed([entry({ id: '14945776032094859597' })]),
      'https://test.hatenablog.com/sitemap_index.xml': emptySitemap,
    });
    const { articles } = await fetchHatena('https://test.hatenablog.com');
    expect(articles[0].slug).toBe('14945776032094859597');
    expect(articles[0].likes).toBeNull();
  });

  test('UT-P01-09: カテゴリを指定したら、カテゴリのフィードを取得し、総数は数えない', async () => {
    route({ 'https://test.hatenablog.com/feed/category/%E6%97%85%E8%A1%8C': feed([entry()]) });
    const result = await fetchHatena('https://test.hatenablog.com', '旅行');
    expect(result.total).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe('countHatenaEntries', () => {
  test('UT-P01-10: 月ごとのサイトマップの記事数を合計する', async () => {
    const pages = {
      'https://test.hatenablog.com/sitemap_index.xml':
        '<sitemapindex>' +
        '<sitemap><loc>https://test.hatenablog.com/sitemap_common.xml</loc></sitemap>' +
        '<sitemap><loc>https://test.hatenablog.com/sitemap_periodical.xml?year=2026&amp;month=10</loc></sitemap>' +
        '<sitemap><loc>https://test.hatenablog.com/sitemap_periodical.xml?year=2026&amp;month=9</loc></sitemap>' +
        '</sitemapindex>',
      'https://test.hatenablog.com/sitemap_periodical.xml?year=2026&month=10': '<urlset><url></url><url></url><url></url></urlset>',
      'https://test.hatenablog.com/sitemap_periodical.xml?year=2026&month=9': '<urlset><url></url><url></url></urlset>',
    };
    fetchMock.mockImplementation(async (url) => xml(pages[url]));
    expect(await countHatenaEntries('https://test.hatenablog.com')).toBe(5);
  });

  test('UT-P01-11: サイトマップを取得できなければ null（警告を出す）', async () => {
    fetchMock.mockRejectedValue(new Error('network'));
    expect(await countHatenaEntries('https://test.hatenablog.com')).toBeNull();
    expect(console.warn).toHaveBeenCalled();
  });
});
