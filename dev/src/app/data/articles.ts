// 記事データの型・読み込み・表示用の小さな関数をまとめたファイル
// 記事の一覧はビルド時に scripts/fetch-feeds.mjs が生成した JSON をそのまま読み込む（サイトの JS に埋め込まれる）
import qiitaJson from './generated/qiita.json';
import hatenaJson from './generated/hatena.json';

/** 記事の取得元。qiita = Tech、hatena = Diary */
export type Source = 'qiita' | 'hatena';

export type Article = {
  slug: string; // 取得元での記事 ID。本文ファイル名（public/articles/<source>/<slug>.json）に使う
  floor: number; // 階数。一番古い記事が 1F（新しい記事を書いても変わらない）。カードの「1F」と詳細ページの URL（/tech/1F）に使う
  title: string;
  url: string; // 元の記事
  publishedAt: string; // 投稿日時（ISO 8601）
  tags: string[]; // Qiita のタグ / はてなブログのカテゴリ
  summary: string; // 概要（120 文字まで）
  thumbnail: string | null; // アイキャッチ画像（はてなブログ）
  likes: number | null; // Qiita の LGTM（いいね）の数。はてなブログは null
};

export type Feed = {
  configured: boolean; // feeds.config.json に設定があるか
  profileUrl: string | null; // 「Qiita で読む」などのリンク先
  fetchedAt: string | null; // 取得日時
  articles: Article[]; // 新しい順（上の階から）
};

/** Tech: Qiita の記事 */
export const qiita = qiitaJson as Feed;

/** Diary: はてなブログの記事 */
export const hatena = hatenaJson as Feed;

export const feeds: Record<Source, Feed> = { qiita, hatena };

/** 取得元ごとの、ページの表示内容。Tech と Diary で同じ部品を同じ位置に並べるため、違いはここだけにまとめる */
export const SOURCE_PAGES = {
  qiita: {
    basePath: '/tech',
    kicker: '▶ 技術',
    title: 'Tech',
    lead: 'ぎじゅつに　ついて　まとめています',
    tone: 'cyan',
    serviceName: 'Qiita',
    configKey: 'qiita.userId',
  },
  hatena: {
    basePath: '/diary',
    kicker: '▶ 日記',
    title: 'Diary',
    lead: 'にっきを　まとめています',
    tone: 'pink',
    serviceName: 'はてなブログ',
    configKey: 'hatena.blogUrl',
  },
} as const;

/** 階数の表記（1 → "1F"） */
export function floorLabel(floor: number) {
  return `${floor}F`;
}

/** 記事の詳細ページの URL（/tech/1F、/diary/2F） */
export function articlePath(source: Source, article: Article) {
  return `${SOURCE_PAGES[source].basePath}/${floorLabel(article.floor)}`;
}

/** URL の「1F」「2f」などから記事を探す。形式が違う・該当がなければ undefined */
export function findArticleByFloor(source: Source, floorParam: string): Article | undefined {
  const match = /^(\d+)F$/i.exec(floorParam);
  if (!match) return undefined;
  const floor = Number(match[1]);
  return feeds[source].articles.find((article) => article.floor === floor);
}

/**
 * 記事の本文 HTML を読み込む（src/public/articles/<source>/<slug>.json）
 * HTML はビルド時に scripts/sanitize-article.mjs でサニタイズ済み
 */
export async function fetchArticleHtml(source: Source, slug: string): Promise<string> {
  const res = await fetch(`${import.meta.env.BASE_URL}articles/${source}/${slug}.json`);
  if (!res.ok) throw new Error(`記事の本文を読み込めませんでした（${res.status}）`);
  const data = (await res.json()) as { html: string };
  return data.html;
}

/** ISO 8601 の日時を「2026.10.25」「2026年10月25日」の形にする */
export function formatDate(iso: string) {
  const date = new Date(iso);
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return {
    dotted: `${y}.${String(m).padStart(2, '0')}.${String(d).padStart(2, '0')}`,
    label: `${y}年${m}月${d}日`,
  };
}

/** いいね（Qiita の LGTM）の数の表記（はてなブログは null） */
export function likesLabel(article: Article) {
  return article.likes !== null ? `♡ ${article.likes}` : null;
}

/** カードに小さく出す情報（投稿日と、Qiita ならいいねの数） */
export function articleMeta(article: Article) {
  return [formatDate(article.publishedAt).dotted, likesLabel(article)].filter(Boolean).join('　');
}

// カードに飾る絵文字の候補
const CARD_EMOJIS = ['🐸', '🚀', '🎡', '🍜', '🦝', '📷', '🗼', '🎠', '🎈', '🍙', '🌙', '⭐', '🎮', '🛸', '🍡', '🎁', '🌸', '🍩', '🎪', '🧃'];

/**
 * カードに飾る絵文字を 1 つ選ぶ
 * 記事の ID から決めるので、記事ごとにばらばらだが、同じ記事はいつ見ても同じ絵文字になる
 */
export function articleEmoji(article: Article) {
  let hash = 0;
  for (const char of article.slug) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return CARD_EMOJIS[hash % CARD_EMOJIS.length];
}
