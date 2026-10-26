// 文字の変換（XML の記号を戻す・Markdown / HTML から概要用の文字を作る）
// 記事の取得（fetch-feeds.mjs）から使う。テストしやすいように、外部への通信やファイル操作はしない

/** 概要の最大文字数 */
export const SUMMARY_LENGTH = 120;

/** XML の要素（文字列 or 属性付きオブジェクト）から本文を取り出し、エンティティを戻す */
export function text(value) {
  if (value == null) return '';
  return decodeXml(typeof value === 'object' ? String(value['#text'] ?? '') : String(value));
}

/** XML のエンティティを 1 段だけ戻す（&amp;lt; は &lt; になる） */
export function decodeXml(value) {
  return value.replace(/&(#x[0-9a-f]+|#\d+|lt|gt|amp|quot|apos);/gi, (_, code) => {
    if (code[0] === '#') {
      const n = code[1] === 'x' || code[1] === 'X' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return String.fromCodePoint(n);
    }
    return { lt: '<', gt: '>', amp: '&', quot: '"', apos: "'" }[code.toLowerCase()];
  });
}

/** Markdown から記号を取り除いて、概要用のプレーンテキストにする */
export function markdownToText(markdown) {
  return htmlToText(
    markdown
      .replace(/```[\s\S]*?```/g, ' ') // コードブロック
      .replace(/:::[\s\S]*?:::/g, ' ') // Qiita の note 記法
      .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ') // 画像
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // リンク → テキスト
      .replace(/`([^`]*)`/g, '$1') // インラインコード
      .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+\.)\s+/gm, '') // 見出し・引用・リスト
      .replace(/^\|.*\|$/gm, ' ') // 表
      .replace(/[*_~]{1,3}/g, ''), // 強調
  );
}

/** HTML のタグを消し、よく使うエンティティを戻し、空白を 1 つにまとめる */
export function htmlToText(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

/** 概要の長さに切り詰める（絵文字などが途中で壊れないよう、文字単位で数える） */
export function truncate(value) {
  const chars = [...value];
  return chars.length > SUMMARY_LENGTH ? `${chars.slice(0, SUMMARY_LENGTH).join('')}…` : value;
}
