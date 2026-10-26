// 記事の取得元（Qiita API・はてなブログのフィードとサイトマップ）への通信と、記事データへの変換
import { XMLParser } from 'fast-xml-parser';
import { sanitizeArticleHtml } from '../sanitize-article.mjs';
import { decodeXml, htmlToText, markdownToText, text, truncate } from './text.mjs';

/**
 * Qiita の記事を取得する（新しい順に最大 maxItems 件。100 件ずつページ送り）
 * @param {string} userId Qiita のユーザー ID
 * @param {number} maxItems 取得する最大件数
 * @param {string} [token] 読み取り専用トークン（あれば利用回数の上限が上がる）
 */
export async function fetchQiita(userId, maxItems, token) {
  const perPage = Math.min(maxItems, 100);
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const items = [];
  let total = null; // 記事の総数（レスポンスヘッダー Total-Count）

  for (let page = 1; items.length < maxItems; page++) {
    const url = `https://qiita.com/api/v2/users/${encodeURIComponent(userId)}/items?page=${page}&per_page=${perPage}`;
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`Qiita API が ${res.status} を返しました（${url}）`);
    total ??= Number(res.headers.get('total-count')) || null;
    const pageItems = await res.json();
    items.push(...pageItems);
    if (pageItems.length < perPage) break;
  }

  return {
    profileUrl: `https://qiita.com/${userId}`,
    total,
    articles: items.slice(0, maxItems).map((item) => ({
      slug: item.id,
      title: item.title,
      url: item.url,
      publishedAt: item.created_at,
      tags: item.tags.map((tag) => tag.name),
      summary: truncate(markdownToText(item.body)),
      thumbnail: null,
      likes: item.likes_count,
      html: sanitizeArticleHtml(item.rendered_body, 'https://qiita.com'),
    })),
  };
}

/**
 * はてなブログの記事を取得する（Atom フィード。最新 30 件まで）
 * @param {string} blogUrl ブログの URL
 * @param {string} [category] 指定するとそのカテゴリの記事だけを取得する
 */
export async function fetchHatena(blogUrl, category) {
  const base = blogUrl.replace(/\/+$/, '');
  const url = category ? `${base}/feed/category/${encodeURIComponent(category)}` : `${base}/feed`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`はてなブログのフィードが ${res.status} を返しました（${url}）`);

  // 本文（<content>）は HTML エンティティが大量にあり、パーサーの展開上限に達するため、
  // パーサーでは展開せず decodeXml() で自前で戻す
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
    processEntities: false,
    isArray: (name) => ['entry', 'link', 'category'].includes(name),
  });
  const { feed } = parser.parse(await res.text());
  if (!feed) throw new Error('Atom フィードとして読み込めませんでした');

  return {
    profileUrl: `${base}/`,
    // カテゴリで絞っている場合、サイトマップの総数は使えない（全カテゴリの数になる）ので取得した件数で数える
    total: category ? null : await countHatenaEntries(base),
    articles: (feed.entry ?? []).map((entry) => {
      const links = entry.link ?? [];
      const id = text(entry.id);
      return {
        // hatenablog://entry/1494577... → 1494577...
        slug: id.split('/').pop(),
        title: text(entry.title),
        url: decodeXml(links.find((l) => !l.rel || l.rel === 'alternate')?.href ?? base),
        publishedAt: text(entry.published),
        tags: (entry.category ?? []).map((c) => decodeXml(c.term)),
        summary: truncate(htmlToText(text(entry.summary))),
        thumbnail: decodeXml(links.find((l) => l.rel === 'enclosure')?.href ?? '') || null,
        likes: null,
        html: sanitizeArticleHtml(text(entry.content), `${base}/`),
      };
    }),
  };
}

/**
 * はてなブログの記事の総数を、サイトマップ（月ごとの記事一覧）から数える
 * フィードには最新 30 件しか入らないため、階数を固定するのに使う。取得できなければ null
 */
export async function countHatenaEntries(base) {
  try {
    const index = await (await fetch(`${base}/sitemap_index.xml`)).text();
    const monthly = [...index.matchAll(/<loc>([^<]*sitemap_periodical[^<]*)<\/loc>/g)].map((m) => decodeXml(m[1]));
    const counts = await Promise.all(
      monthly.map(async (url) => {
        const xml = await (await fetch(url)).text();
        return (xml.match(/<url>/g) ?? []).length;
      }),
    );
    return counts.reduce((sum, n) => sum + n, 0) || null;
  } catch (error) {
    console.warn(`[feeds] hatena: 記事の総数を数えられませんでした（取得した件数で階数を振ります）: ${error.message}`);
    return null;
  }
}
