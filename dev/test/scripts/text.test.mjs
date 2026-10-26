// @vitest-environment node
// UT-P01-20〜31: 記事の取得で使う文字の変換（scripts/lib/text.mjs）
import { decodeXml, htmlToText, markdownToText, truncate } from '../../scripts/lib/text.mjs';

describe('decodeXml（XML の記号を戻す）', () => {
  test('UT-P01-20: &lt;p&gt; → <p>', () => {
    expect(decodeXml('&lt;p&gt;')).toBe('<p>');
  });

  test('UT-P01-21: &amp;lt; は 1 段だけ戻して &lt; にする', () => {
    expect(decodeXml('&amp;lt;')).toBe('&lt;');
  });

  test('UT-P01-22: 数値の文字参照（10 進・16 進）を文字に戻す', () => {
    expect(decodeXml('&#12354;')).toBe('あ');
    expect(decodeXml('&#x3042;')).toBe('あ');
  });
});

describe('markdownToText（概要用の文字にする）', () => {
  test('UT-P01-23: コードブロックの中身を消す', () => {
    expect(markdownToText('前\n```js\nconst secret = 1;\n```\n後')).toBe('前 後');
  });

  test('UT-P01-24: リンクは文字だけ残す', () => {
    expect(markdownToText('[リンク](https://example.com)')).toBe('リンク');
  });

  test('UT-P01-25: 画像を消す', () => {
    expect(markdownToText('a ![画像](a.png) b')).toBe('a b');
  });

  test('UT-P01-26: 見出し・リスト・引用の記号を消す', () => {
    expect(markdownToText('# 見出し\n- リスト\n> 引用')).toBe('見出し リスト 引用');
  });

  test('UT-P01-27: Qiita の note 記法をまるごと消す', () => {
    expect(markdownToText('前\n:::note info\n補足\n:::\n後')).toBe('前 後');
  });
});

describe('htmlToText', () => {
  test('UT-P01-28: タグを消し、記号を戻し、空白を 1 つにまとめる', () => {
    expect(htmlToText('<p>a&amp;b</p>  <br> c')).toBe('a&b c');
  });
});

describe('truncate（120 文字に切り詰める）', () => {
  test('UT-P01-29: 120 文字以下はそのまま', () => {
    const value = 'あ'.repeat(120);
    expect(truncate(value)).toBe(value);
  });

  test('UT-P01-30: 121 文字以上は先頭 120 文字 + …', () => {
    expect(truncate('あ'.repeat(121))).toBe(`${'あ'.repeat(120)}…`);
  });

  test('UT-P01-31: 絵文字を途中で壊さない', () => {
    const result = truncate('🐸'.repeat(121));
    expect(result).toBe(`${'🐸'.repeat(120)}…`);
    expect(result).not.toMatch(/�/);
  });
});
