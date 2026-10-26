// UT-P05: 画面の切り替え、UT-P09: タブのタイトル、UT-P07-07〜12: 記事詳細の表示
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router';
import App from '../../src/app/App';

/** 今の URL を画面に出す（転送の確認用） */
function CurrentPath() {
  return <output data-testid="path">{useLocation().pathname}</output>;
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
      <CurrentPath />
    </MemoryRouter>,
  );
}

/** 本文の読み込み（fetch）を偽物にする。resolve を呼ぶまで読み込み中のまま */
function stubBody(response: () => Response) {
  const fetchMock = vi.fn(async () => response());
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

beforeEach(() => {
  // 記事詳細以外では fetch を使わないが、念のため空の本文を返す
  stubBody(() => new Response(JSON.stringify({ html: '' })));
  // オープニング（Home）は UT-P08 で確かめる。ここでは履歴の位置を 1 にして出さない
  window.history.replaceState({ idx: 1 }, '');
});
afterEach(() => {
  vi.unstubAllGlobals();
});

describe('UT-P05 画面の切り替え', () => {
  test('UT-P05-01: / は Home', () => {
    renderAt('/');
    expect(screen.getByRole('heading', { name: 'New Hiroto Cityへ！' })).toBeInTheDocument();
  });

  test.each([
    ['/tech', 'Tech', '三番目の技術記事'],
    ['/diary', 'Diary', '静岡に行きました'],
  ])('UT-P05-02: %s は記事一覧', (path, title, firstArticle) => {
    renderAt(path);
    expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument();
    expect(screen.getByText(firstArticle)).toBeInTheDocument();
  });

  test.each([
    ['/tech/1F', '一番目の技術記事'],
    ['/diary/1F', 'はじめての日記'],
  ])('UT-P05-03: %s は記事詳細', async (path, title) => {
    renderAt(path);
    expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument();
    await screen.findByRole('link', { name: /で読む/ });
  });

  test('UT-P05-04: /about は About', () => {
    renderAt('/about');
    expect(screen.getByText('岩手県盛岡市')).toBeInTheDocument();
  });

  test.each(['/travel', '/travel/1F'])('UT-P05-05: %s は /diary に転送', (path) => {
    renderAt(path);
    expect(screen.getByTestId('path')).toHaveTextContent('/diary');
    expect(screen.getByRole('heading', { level: 1, name: 'Diary' })).toBeInTheDocument();
  });

  test('UT-P05-06: 存在しない URL は 404', () => {
    renderAt('/xxx');
    expect(screen.getByRole('heading', { name: '404' })).toBeInTheDocument();
  });
});

describe('UT-P09 タブのタイトル', () => {
  test.each([
    ['/', 'Home'],
    ['/tech', 'Tech'],
    ['/tech/3F', 'Tech'],
    ['/diary', 'Diary'],
    ['/diary/2F', 'Diary'],
    ['/about', 'About'],
    ['/xxx', '404'],
  ])('%s → %s　|　SatoHiroto', (path, name) => {
    renderAt(path);
    expect(document.title).toBe(`${name}　|　SatoHiroto`);
  });
});

describe('UT-P07 記事詳細の表示', () => {
  test('UT-P07-07: 存在しない階数は 404', () => {
    renderAt('/tech/99F');
    expect(screen.getByRole('heading', { name: '404' })).toBeInTheDocument();
  });

  test('UT-P07-08: 本文の読み込み中は「読み込み中…」', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})));
    renderAt('/tech/1F');
    expect(screen.getByText('読み込み中…')).toBeInTheDocument();
  });

  test('UT-P07-09: 本文の読み込みに失敗したら、エラーメッセージ', async () => {
    stubBody(() => new Response('', { status: 500 }));
    renderAt('/tech/1F');
    expect(await screen.findByRole('alert')).toHaveTextContent('記事の本文を読み込めませんでした（500）');
  });

  test('UT-P07-10: 本文の画像が読み込めなければ「画像を表示できませんでした」', async () => {
    stubBody(() => new Response(JSON.stringify({ html: '<p>本文です</p><img src="https://example.com/x.png" alt="x">' })));
    renderAt('/tech/1F');
    await screen.findByText('本文です');
    const img = screen.getByRole('img', { name: 'x' });
    act(() => {
      fireEvent.error(img);
    });
    expect(screen.getByText('画像を表示できませんでした')).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: 'x' })).not.toBeInTheDocument();
  });

  test('UT-P07-11: 表示中は canonical（元の記事）があり、画面を離れるとなくなる', async () => {
    const { unmount } = renderAt('/diary/2F');
    await screen.findByRole('link', { name: /はてなブログで読む/ });
    const canonical = document.head.querySelector('link[rel="canonical"]');
    expect(canonical).toHaveAttribute('href', 'https://test.hatenablog.com/entry/2026/10/25/023819');
    unmount();
    expect(document.head.querySelector('link[rel="canonical"]')).toBeNull();
  });

  test.each([
    ['/tech/1F', '技術記事の一覧へ', '/tech', 'Qiitaで読む'],
    ['/diary/1F', '日記の一覧へ', '/diary', 'はてなブログで読む'],
  ])('UT-P07-12: %s のボタン', async (path, listLabel, listPath, originalLabel) => {
    renderAt(path);
    // ◀・▶ は飾り（aria-hidden）なので、読み上げる名前には入らない。見た目の文字は textContent で確かめる
    const back = await screen.findByRole('link', { name: listLabel });
    const original = screen.getByRole('link', { name: originalLabel });
    expect(back.textContent).toBe(`◀ ${listLabel}`);
    expect(original.textContent).toBe(`${originalLabel} ▶`);
    expect(back).toHaveAttribute('href', listPath);
    expect(original).toHaveAttribute('target', '_blank');
    // 左に「一覧へ」、右に「元の記事で読む」
    expect(back.compareDocumentPosition(original) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
