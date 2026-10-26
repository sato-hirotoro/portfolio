// @vitest-environment node
// UT-P03: 本文のサニタイズ（scripts/sanitize-article.mjs）
import { sanitizeArticleHtml } from '../../scripts/sanitize-article.mjs';

const QIITA = 'https://qiita.com';
const HATENA = 'https://test.hatenablog.com/';
const clean = (html, base = QIITA) => sanitizeArticleHtml(html, base);

test('UT-P03-01: <script> を消す', () => {
  expect(clean('<p>a</p><script>alert(1)</script>')).toBe('<p>a</p>');
});

test('UT-P03-02: onerror などのイベント属性を消し、画像に loading="lazy" を付ける', () => {
  const result = clean('<img src="https://e.com/a.png" onerror="alert(1)">');
  expect(result).not.toContain('onerror');
  expect(result).toContain('loading="lazy"');
});

test('UT-P03-03: javascript: のリンクを消す', () => {
  const result = clean('<a href="javascript:alert(1)">x</a>');
  expect(result).not.toContain('javascript');
  expect(result).toContain('x');
});

test('UT-P03-04: style 属性を消す', () => {
  expect(clean('<p style="color:red">a</p>')).toBe('<p>a</p>');
});

test('UT-P03-05: 表の文字揃え（text-align）だけ残す', () => {
  const result = clean('<table><tbody><tr><td style="text-align: right; color: red">1</td></tr></tbody></table>');
  expect(result).toContain('text-align:right');
  expect(result).not.toContain('color');
});

test('UT-P03-06: class と data-lang を残す（見た目に使うため）', () => {
  const result = clean('<div class="code-frame" data-lang="ruby">a</div>');
  expect(result).toContain('class="code-frame"');
  expect(result).toContain('data-lang="ruby"');
});

test('UT-P03-07: YouTube の iframe は残し、loading="lazy" を付ける', () => {
  const result = clean('<iframe src="https://www.youtube.com/embed/abc"></iframe>');
  expect(result).toContain('<iframe');
  expect(result).toContain('src="https://www.youtube.com/embed/abc"');
  expect(result).toContain('loading="lazy"');
});

test('UT-P03-08: Google マップの iframe は残す', () => {
  expect(clean('<iframe src="https://www.google.com/maps/embed?pb=1"></iframe>')).toContain('<iframe');
});

test('UT-P03-09: Google の他のページの iframe はリンクに置き換える', () => {
  const result = clean('<iframe src="https://www.google.com/search?q=a"></iframe>');
  expect(result).not.toContain('<iframe');
  expect(result).toContain('class="embed-link"');
  expect(result).toContain('href="https://www.google.com/search?q=a"');
});

test('UT-P03-10: Qiita のリンクカードは、リンク先へのリンクに置き換える', () => {
  const result = clean(
    '<iframe src="https://qiita.com/embed-contents/link-card#x" data-content="https%3A%2F%2Fexample.com%2Fpage"></iframe>',
  );
  expect(result).not.toContain('<iframe');
  expect(result).toContain('href="https://example.com/page"');
});

test('UT-P03-11: Qiita の Mermaid は、図のコードをコードブロックで表示する（記号はエスケープ）', () => {
  const result = clean(
    `<iframe src="https://qiita.com/embed-contents/mermaid#x" data-content='{"data":"graph TD\\n A--&gt;B"}'></iframe>`,
  );
  expect(result).not.toContain('<iframe');
  expect(result).toContain('data-lang="mermaid"');
  expect(result).toContain('A--&gt;B');
});

test('UT-P03-12: Mermaid の情報が壊れていても止まらず、空のコードブロックにする', () => {
  const result = clean(`<iframe src="https://qiita.com/embed-contents/mermaid#x" data-content='{broken'></iframe>`);
  expect(result).toContain('data-lang="mermaid"');
  expect(result).toContain('<code></code>');
});

test('UT-P03-13: はてなブログカードは、埋め込み先へのリンクに置き換える', () => {
  const result = clean(
    '<iframe src="https://hatenablog-parts.com/embed?url=https%3A%2F%2Ftest.hatenablog.com%2Fentry%2F1" title="前の記事"></iframe>',
    HATENA,
  );
  expect(result).toContain('href="https://test.hatenablog.com/entry/1"');
  expect(result).toContain('前の記事');
});

test('UT-P03-14: src が URL でない iframe は消す', () => {
  expect(clean('<p>a</p><iframe src="not a url"></iframe>')).toBe('<p>a</p>');
});

test('UT-P03-15: 相対リンクは元のサイト基準の URL にし、別タブで開く', () => {
  const result = clean('<a href="/user">user</a>');
  expect(result).toContain('href="https://qiita.com/user"');
  expect(result).toContain('target="_blank"');
  expect(result).toContain('rel="noopener noreferrer"');
});

test('UT-P03-16: ページ内リンク（#）はそのまま、別タブにしない', () => {
  const result = clean('<a href="#heading">見出しへ</a>');
  expect(result).toContain('href="#heading"');
  expect(result).not.toContain('target');
});

test('UT-P03-17: 相対パスの画像は、ブログの URL 基準の絶対 URL にする', () => {
  expect(clean('<img src="/img.png">', HATENA)).toContain('src="https://test.hatenablog.com/img.png"');
});

test('UT-P03-18: はてなキーワードの自動リンクは、ただの文字にする', () => {
  expect(clean('<a class="keyword" href="https://d.hatena.ne.jp/keyword/x">単語</a>', HATENA)).toBe('<span>単語</span>');
});

test('UT-P03-19: Qiita の見出しのリンクアイコンを消す', () => {
  const result = clean('<h2><a href="#x"><i class="fa fa-link"></i></a>見出し</h2>');
  expect(result).toBe('<h2>見出し</h2>');
});

test('UT-P03-20: 画像だけのリンクは消さない', () => {
  const result = clean('<a href="#x"><img src="https://e.com/a.png"></a>');
  expect(result).toContain('<a');
  expect(result).toContain('<img');
});
