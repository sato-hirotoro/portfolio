// Qiita とはてなブログの記事を取得して保存する
// npm run dev / npm run build の前に自動で実行される（package.json の predev / prebuild）
//
// 出力:
//   src/app/data/generated/{qiita,hatena}.json      一覧用（タイトル・階数など。サイトに埋め込む）
//   src/public/articles/{qiita,hatena}/<slug>.json  記事の本文 HTML（詳細ページを開いたときに読み込む）
//
// 階数（floor）: 一番古い記事を 1F とし、新しい記事ほど上の階になる（最新 = 記事の総数）。lib/floors.mjs
//
// 設定: feeds.config.json（環境変数 QIITA_USER_ID / HATENA_BLOG_URL / HATENA_CATEGORY で上書き可）
// Qiita のレート制限を緩めたい場合は QIITA_TOKEN を設定する（読み取り専用トークン）
//
// 取得に失敗した場合:
//   - CI（GitHub Actions）では異常終了してデプロイを止める（前回の公開内容が残る）
//   - ローカルでは前回のファイルを残して続行する
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { fetchHatena, fetchQiita } from './lib/sources.mjs';
import { update } from './lib/update.mjs';

/**
 * 記事を取得して保存する
 * @returns {Promise<number>} 終了コード（0: 成功 / 1: CI で取得に失敗）
 */
export async function main({
  configPath = 'feeds.config.json',
  env = process.env,
  argv = process.argv,
  listDir = 'src/app/data/generated',
  bodyDir = 'src/public/articles',
} = {}) {
  const strict = env.CI === 'true' || argv.includes('--strict');
  const config = JSON.parse(await readFile(configPath, 'utf8'));
  const qiitaUserId = env.QIITA_USER_ID || config.qiita.userId;
  const hatenaBlogUrl = env.HATENA_BLOG_URL || config.hatena.blogUrl;
  const hatenaCategory = env.HATENA_CATEGORY || config.hatena.category;
  const dirs = { listDir, bodyDir };

  const results = await Promise.all([
    update('qiita', qiitaUserId, () => fetchQiita(qiitaUserId, config.qiita.maxItems ?? 100, env.QIITA_TOKEN), dirs),
    update('hatena', hatenaBlogUrl, () => fetchHatena(hatenaBlogUrl, hatenaCategory), dirs),
  ]);

  if (strict && results.includes(false)) {
    console.error('[feeds] 記事の取得に失敗したため中断します');
    return 1;
  }
  return 0;
}

// node scripts/fetch-feeds.mjs として実行されたときだけ動かす（テストから import したときは動かさない）
if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  process.exitCode = await main();
}
