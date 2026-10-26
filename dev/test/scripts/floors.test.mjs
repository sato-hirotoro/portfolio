// @vitest-environment node
// UT-P02: 階数の付与（scripts/lib/floors.mjs）
import { assignFloors } from '../../scripts/lib/floors.mjs';

/** 投稿日がずれた記事を n 件作る（i が大きいほど新しい） */
function articles(n) {
  return Array.from({ length: n }, (_, i) => ({
    slug: `a${i}`,
    publishedAt: new Date(Date.UTC(2026, 0, 1 + i)).toISOString(),
  }));
}

test('UT-P02-01: 総数 5・取得 5 件 → 新しい順に 5F〜1F', () => {
  expect(assignFloors(articles(5), 5).map((a) => a.floor)).toEqual([5, 4, 3, 2, 1]);
});

test('UT-P02-02: 総数 409・取得 100 件 → 409F〜310F', () => {
  const floors = assignFloors(articles(100), 409).map((a) => a.floor);
  expect(floors[0]).toBe(409);
  expect(floors.at(-1)).toBe(310);
});

test('UT-P02-03: 総数が分からない → 取得した件数で 3F〜1F', () => {
  expect(assignFloors(articles(3), null).map((a) => a.floor)).toEqual([3, 2, 1]);
});

test('UT-P02-04: 総数が取得した件数より少ない → 取得した件数を総数とみなす', () => {
  expect(assignFloors(articles(3), 2).map((a) => a.floor)).toEqual([3, 2, 1]);
});

test('UT-P02-05: 順番がばらばらでも、新しい順に並べてから振る', () => {
  const [a, b, c] = articles(3);
  const result = assignFloors([b, c, a], 3);
  expect(result.map((x) => x.slug)).toEqual([c.slug, b.slug, a.slug]);
  expect(result.map((x) => x.floor)).toEqual([3, 2, 1]);
});

test('UT-P02-06: 新しい記事が増えても、既存の記事の階数は変わらない', () => {
  const before = assignFloors(articles(5), 5);
  const after = assignFloors(articles(6), 6);
  for (const old of before) {
    expect(after.find((a) => a.slug === old.slug)?.floor).toBe(old.floor);
  }
  expect(after[0].floor).toBe(6);
});
