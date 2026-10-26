// @vitest-environment node
// UT-P01-40〜44: 取得結果の保存と、失敗したときの動き（scripts/lib/update.mjs、scripts/fetch-feeds.mjs）
// 保存先は一時フォルダを使い、本物のデータには触れない
import { mkdtemp, mkdir, readFile, rm, writeFile, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { update } from '../../scripts/lib/update.mjs';
import { main } from '../../scripts/fetch-feeds.mjs';

let root;
let dirs;
const readJson = async (file) => JSON.parse(await readFile(file, 'utf8'));
const exists = (file) => access(file).then(() => true, () => false);

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'portfolio-test-'));
  dirs = { listDir: join(root, 'generated'), bodyDir: join(root, 'articles') };
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(async () => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  await rm(root, { recursive: true, force: true });
});

test('UT-P01-40: 取得元が未設定なら、記事 0 件の JSON を書き、本文のフォルダを消す', async () => {
  await mkdir(join(dirs.bodyDir, 'qiita'), { recursive: true });
  await writeFile(join(dirs.bodyDir, 'qiita', 'old.json'), '{}');

  const fetcher = vi.fn();
  expect(await update('qiita', '', fetcher, dirs)).toBe(true);
  expect(fetcher).not.toHaveBeenCalled();
  expect(await readJson(join(dirs.listDir, 'qiita.json'))).toMatchObject({ configured: false, articles: [] });
  expect(await exists(join(dirs.bodyDir, 'qiita'))).toBe(false);
});

test('UT-P01-41: 取得に成功したら、一覧には本文を含めず、本文は記事ごとのファイルに書く', async () => {
  const fetcher = async () => ({
    profileUrl: 'https://qiita.com/u',
    total: 1,
    articles: [{ slug: 'a1', title: 'T', publishedAt: '2026-10-25T00:00:00Z', html: '<p>本文</p>' }],
  });
  expect(await update('qiita', 'u', fetcher, dirs)).toBe(true);

  const list = await readJson(join(dirs.listDir, 'qiita.json'));
  expect(list.configured).toBe(true);
  expect(list.articles[0]).toMatchObject({ slug: 'a1', floor: 1 });
  expect(list.articles[0]).not.toHaveProperty('html');
  expect(await readJson(join(dirs.bodyDir, 'qiita', 'a1.json'))).toEqual({ html: '<p>本文</p>' });
});

test('UT-P01-42: 取得に失敗しても、前回の JSON があれば残す', async () => {
  await mkdir(dirs.listDir, { recursive: true });
  const previous = { configured: true, profileUrl: 'x', fetchedAt: 'before', articles: [{ slug: 'old' }] };
  await writeFile(join(dirs.listDir, 'qiita.json'), JSON.stringify(previous));

  const result = await update('qiita', 'u', async () => { throw new Error('network'); }, dirs);
  expect(result).toBe(false);
  expect(await readJson(join(dirs.listDir, 'qiita.json'))).toEqual(previous);
});

test('UT-P01-43: 取得に失敗し、前回の JSON もなければ、記事 0 件の JSON を書く', async () => {
  const result = await update('qiita', 'u', async () => { throw new Error('network'); }, dirs);
  expect(result).toBe(false);
  expect(await readJson(join(dirs.listDir, 'qiita.json'))).toMatchObject({ configured: true, articles: [] });
});

describe('UT-P01-44: CI で取得に失敗したら、公開を止める（終了コード 1）', () => {
  async function run(env) {
    const configPath = join(root, 'feeds.config.json');
    await writeFile(
      configPath,
      JSON.stringify({ qiita: { userId: 'u', maxItems: 10 }, hatena: { blogUrl: 'https://test.hatenablog.com', category: '' } }),
    );
    vi.stubGlobal('fetch', vi.fn(async () => new Response('error', { status: 500 })));
    return main({ configPath, env, argv: [], ...dirs });
  }

  test('CI=true なら終了コード 1', async () => {
    expect(await run({ CI: 'true' })).toBe(1);
  });

  test('手元（CI なし）なら終了コード 0 で続行する', async () => {
    expect(await run({})).toBe(0);
  });
});
