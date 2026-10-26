// 外部（Qiita / はてなブログ）から取得した記事の HTML を、サイトに埋め込んで安全な形にする
// 許可したタグ・属性だけを残し、スクリプトや未許可の iframe は取り除く（ビルド時に実行）
import sanitizeHtml from 'sanitize-html';

// iframe で埋め込みを許可するサービス
const IFRAME_HOSTS = ['www.youtube.com', 'www.youtube-nocookie.com', 'www.google.com'];

/**
 * @param {string} html 記事の HTML
 * @param {string} baseUrl 相対リンクを解決する基準（Qiita なら https://qiita.com）
 */
export function sanitizeArticleHtml(html, baseUrl) {
  return sanitizeHtml(replaceUnsupportedIframes(html), {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img', 'iframe', 'details', 'summary', 'del', 'ins'],
    allowedAttributes: {
      '*': ['id', 'class', 'data-lang'],
      a: ['href', 'name', 'title', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
      iframe: ['src', 'width', 'height', 'title', 'allow', 'allowfullscreen', 'loading', 'frameborder'],
      th: ['style', 'colspan', 'rowspan'],
      td: ['style', 'colspan', 'rowspan'],
      ol: ['start'],
    },
    // 表の文字揃えだけはスタイルを残す
    allowedStyles: {
      th: { 'text-align': [/^(left|right|center)$/] },
      td: { 'text-align': [/^(left|right|center)$/] },
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedIframeHostnames: IFRAME_HOSTS,
    allowIframeRelativeUrls: false,
    transformTags: {
      a: (tagName, attribs) => {
        // はてなキーワードの自動リンクは、ただの文字にする
        if ((attribs.class ?? '').split(/\s+/).includes('keyword')) return { tagName: 'span', attribs: {} };
        // 相対リンク（/user など）は元のサイトの URL にする。ページ内リンク（#...）はそのまま
        const href = attribs.href ? absolutize(attribs.href, baseUrl) : attribs.href;
        // 外部リンクは別タブで開く
        if (/^https?:/i.test(href ?? '')) {
          return { tagName, attribs: { ...attribs, href, target: '_blank', rel: 'noopener noreferrer' } };
        }
        return { tagName, attribs: { ...attribs, href } };
      },
      img: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, src: absolutize(attribs.src ?? '', baseUrl), loading: 'lazy' },
      }),
      iframe: (tagName, attribs) => ({ tagName, attribs: { ...attribs, loading: 'lazy' } }),
    },
    exclusiveFilter: (frame) =>
      // Qiita の見出しに付くリンクアイコン（Font Awesome）
      (frame.tag === 'i' && /\bfa\b/.test(frame.attribs.class ?? '')) ||
      // 中身のないリンク（上のアイコンを消した後に残る見出しアンカーなど）
      (frame.tag === 'a' && !frame.text.trim() && frame.mediaChildren.length === 0),
  });
}

// 許可していない iframe は、内容に応じて置き換える
//   - Qiita のリンクカード → リンク先へのリンク
//   - Qiita の Mermaid（図）→ 図のコードをコードブロックで表示
//   - はてなブログカードなど → 埋め込み先へのリンク
function replaceUnsupportedIframes(html) {
  return html.replace(/<iframe\b([^>]*)>(?:[\s\S]*?<\/iframe>)?/gi, (tag, attrs) => {
    const src = attr(attrs, 'src');
    let url;
    try {
      url = new URL(src);
    } catch {
      return '';
    }
    if (IFRAME_HOSTS.includes(url.hostname) && (url.hostname !== 'www.google.com' || url.pathname.startsWith('/maps/embed'))) {
      return tag;
    }

    const content = attr(attrs, 'data-content');
    if (url.pathname === '/embed-contents/mermaid') {
      const code = safeJson(content)?.data ?? '';
      return `<div class="code-frame" data-lang="mermaid"><div class="highlight"><pre><code>${escapeHtml(code)}</code></pre></div></div>`;
    }
    const target = url.pathname === '/embed-contents/link-card' ? safeDecodeUri(content) : (url.searchParams.get('url') ?? src);
    if (!/^https?:/i.test(target)) return '';
    const title = attr(attrs, 'title') || target;
    return `<p class="embed-link"><a href="${escapeHtml(target)}">${escapeHtml(title)}</a></p>`;
  });
}

/** 属性の値を取り出す（"..." と '...' の両方に対応） */
function attr(attrs, name) {
  const m = new RegExp(`\\b${name}=(?:"([^"]*)"|'([^']*)')`, 'i').exec(attrs);
  return decodeHtmlAttr(m?.[1] ?? m?.[2] ?? '');
}

function absolutize(value, baseUrl) {
  if (!value || value.startsWith('#')) return value;
  try {
    return new URL(value, baseUrl).href;
  } catch {
    return value;
  }
}

function safeJson(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function safeDecodeUri(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return '';
  }
}

function decodeHtmlAttr(value) {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

function escapeHtml(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
