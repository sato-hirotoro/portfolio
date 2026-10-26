// 階数（1F, 2F, …）の付与
// 一番古い記事を 1F とし、新しい記事ほど上の階にする（最新の記事 = 記事の総数）。
// 新しい記事を書いても、既存の記事の階数（= 詳細ページの URL /tech/1F）は変わらない

/**
 * 記事を投稿日時の新しい順に並べ、階数（floor）を振る
 * @param {Array<{ publishedAt: string }>} articles 取得した記事（最新の一部でもよい）
 * @param {number | null} total 記事の総数。分からなければ null
 * @returns 新しい順に並べ、floor を付けた記事の配列（元の配列は変更しない）
 */
export function assignFloors(articles, total) {
  // 総数が分からない・取得した件数より少ない場合は、取得した件数を総数とみなす
  const top = Math.max(total ?? 0, articles.length);
  return [...articles]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .map((article, i) => ({ ...article, floor: top - i }));
}
