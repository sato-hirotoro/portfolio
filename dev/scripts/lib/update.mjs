// 取得した記事を、一覧の JSON と記事ごとの本文の JSON に保存する
import { access, mkdir, rm, writeFile } from 'node:fs/promises';
import { assignFloors } from './floors.mjs';

/**
 * 1 つの取得元（qiita / hatena）について、記事を取得して保存する
 * @param {string} name 取得元の名前（ファイル名に使う）
 * @param {unknown} configured 設定（ID / URL）。空なら取得しない
 * @param {() => Promise<{ profileUrl: string, total: number | null, articles: object[] }>} fetcher 記事を取得する関数
 * @param {{ listDir: string, bodyDir: string }} dirs 保存先（一覧 / 本文）
 * @returns {Promise<boolean>} 成功（または未設定）なら true、取得に失敗したら false
 */
export async function update(name, configured, fetcher, { listDir, bodyDir }) {
  const listFile = `${listDir}/${name}.json`;
  const sourceBodyDir = `${bodyDir}/${name}`;
  const empty = { configured: Boolean(configured), profileUrl: null, fetchedAt: null, articles: [] };
  await mkdir(listDir, { recursive: true });

  if (!configured) {
    await write(listFile, empty);
    await rm(sourceBodyDir, { recursive: true, force: true });
    console.warn(`[feeds] ${name}: 未設定のためスキップしました（feeds.config.json）`);
    return true;
  }

  try {
    const { profileUrl, total, articles: fetched } = await fetcher();
    const articles = assignFloors(fetched, total);

    // 本文は記事ごとのファイルに分け、一覧には含めない（最初の読み込みを軽くするため）
    await rm(sourceBodyDir, { recursive: true, force: true });
    await mkdir(sourceBodyDir, { recursive: true });
    await Promise.all(articles.map(({ slug, html }) => write(`${sourceBodyDir}/${slug}.json`, { html })));

    await write(listFile, {
      configured: true,
      profileUrl,
      fetchedAt: new Date().toISOString(),
      articles: articles.map(({ html, ...article }) => article),
    });
    console.log(`[feeds] ${name}: ${articles.length} 件取得しました`);
    return true;
  } catch (error) {
    console.error(`[feeds] ${name}: 取得に失敗しました: ${error.message}`);
    // 前回のファイルがあれば残す（手元の開発を止めないため）。なければ 0 件のファイルを作る
    if (!(await exists(listFile))) await write(listFile, empty);
    return false;
  }
}

async function write(file, data) {
  await writeFile(file, `${JSON.stringify(data, null, 2)}\n`);
}

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}
