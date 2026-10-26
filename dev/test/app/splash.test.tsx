// UT-P08: オープニングの表示判定（Home、Splash）
import { act, fireEvent, render, screen } from '@testing-library/react';
import Splash from '../../src/app/components/Splash';

describe('Home', () => {
  // Home は「一度表示したか」をモジュールの変数に持つので、テストごとに読み込み直す
  async function loadHome() {
    vi.resetModules();
    const [{ MemoryRouter }, { default: Home }] = await Promise.all([
      import('react-router'),
      import('../../src/app/pages/Home'),
    ]);
    return (ui?: 'again') =>
      render(
        <MemoryRouter key={ui}>
          <Home />
        </MemoryRouter>,
      );
  }

  test('UT-P08-01: 履歴の位置が 0 で初回なら、オープニングを出す', async () => {
    window.history.replaceState({ idx: 0 }, '');
    const renderHome = await loadHome();
    renderHome();
    expect(screen.getByText('NOW LOADING')).toBeInTheDocument();
  });

  test('UT-P08-02: 履歴の位置が 1 以上なら出さない', async () => {
    window.history.replaceState({ idx: 1 }, '');
    const renderHome = await loadHome();
    renderHome();
    expect(screen.queryByText('NOW LOADING')).not.toBeInTheDocument();
  });

  test('UT-P08-03: 一度 Home を表示したあと、もう一度 Home を表示しても出さない', async () => {
    window.history.replaceState({ idx: 0 }, '');
    const renderHome = await loadHome();
    const first = renderHome();
    expect(screen.getByText('NOW LOADING')).toBeInTheDocument();
    first.unmount();
    renderHome('again');
    expect(screen.queryByText('NOW LOADING')).not.toBeInTheDocument();
  });
});

describe('Splash', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  test('UT-P08-04: 幕を押すと閉じる', () => {
    const onDone = vi.fn();
    render(<Splash onDone={onDone} />);
    fireEvent.click(screen.getByRole('presentation'));
    expect(onDone).toHaveBeenCalled();
  });

  test('UT-P08-05: 幕のアニメーションが終わると閉じる', () => {
    const onDone = vi.fn();
    render(<Splash onDone={onDone} />);
    fireEvent.animationEnd(screen.getByRole('presentation'));
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  test('UT-P08-06: 中のリムジンのアニメーションが終わっても閉じない', () => {
    const onDone = vi.fn();
    render(<Splash onDone={onDone} />);
    fireEvent.animationEnd(screen.getByText('NOW LOADING'));
    expect(onDone).not.toHaveBeenCalled();
  });

  test('UT-P08-07: 4.2 秒たつと閉じる（保険）', () => {
    vi.useFakeTimers();
    const onDone = vi.fn();
    render(<Splash onDone={onDone} />);
    act(() => vi.advanceTimersByTime(4199));
    expect(onDone).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(onDone).toHaveBeenCalledTimes(1);
  });
});
