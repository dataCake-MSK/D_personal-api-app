import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';

import { clearWidgetRegistry } from '@/widgets/registry';
import { registerBuiltInWidgets, WidgetCard } from '@/widgets';

const fetchMock = jest.fn();

function renderWithQuery(ui: ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

const widget = (config: Record<string, unknown>) => ({ id: 'w1', type: 'http-json', config });

beforeEach(() => {
  clearWidgetRegistry();
  registerBuiltInWidgets();
  fetchMock.mockReset();
  globalThis.fetch = fetchMock as unknown as typeof fetch;
});

describe('API 데이터 위젯', () => {
  it('불러오는 동안 진행 상태를 보여준다', async () => {
    fetchMock.mockReturnValue(new Promise(() => {}));

    await renderWithQuery(
      <WidgetCard widget={widget({ url: 'https://example.com/data', view: 'text' })} />,
    );

    expect(screen.getByText('불러오는 중…')).toBeTruthy();
  });

  it('경로로 꺼낸 값을 텍스트로 보여준다', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ hourly: { temperature_2m: [21.4] } }),
    });

    await renderWithQuery(
      <WidgetCard
        widget={widget({
          title: '서울 기온',
          url: 'https://example.com/data',
          path: 'hourly.temperature_2m[0]',
          view: 'text',
        })}
      />,
    );

    expect(await screen.findByText('21.4')).toBeTruthy();
    expect(screen.getByText('서울 기온')).toBeTruthy();
  });

  it('배열을 표로 보여준다', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ items: [{ id: 1, price: 1000 }] }),
    });

    await renderWithQuery(
      <WidgetCard
        widget={widget({ url: 'https://example.com/data', path: 'items', view: 'table' })}
      />,
    );

    expect(await screen.findByText('price')).toBeTruthy();
    expect(screen.getByText('1000')).toBeTruthy();
  });

  it('요청이 실패하면 이유를 보여준다', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 500, json: async () => ({}) });

    await renderWithQuery(
      <WidgetCard widget={widget({ url: 'https://example.com/data', view: 'text' })} />,
    );

    expect(await screen.findByText(/HTTP 500/)).toBeTruthy();
  });

  it('경로에 값이 없으면 안내한다', async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 200, json: async () => ({}) });

    await renderWithQuery(
      <WidgetCard
        widget={widget({ url: 'https://example.com/data', path: 'nope.here', view: 'text' })}
      />,
    );

    expect(await screen.findByText('해당 경로에 데이터가 없습니다.')).toBeTruthy();
  });

  it('http 주소에는 경고를 표시한다', async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 200, json: async () => ({ v: 1 }) });

    await renderWithQuery(
      <WidgetCard widget={widget({ url: 'http://example.com/data', path: 'v', view: 'text' })} />,
    );

    expect(await screen.findByText(/https를 쓰세요/)).toBeTruthy();
  });

  it('주소가 없으면 설정 오류로 표시한다', async () => {
    await renderWithQuery(<WidgetCard widget={widget({ url: '', view: 'text' })} />);

    expect(screen.getByText('API 데이터 설정 오류')).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('시계열 표시', () => {
  it('시간축 경로와 값 배열로 그래프를 그린다', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        hourly: {
          time: ['2026-09-20T00:00', '2026-09-20T01:00'],
          temperature_2m: [21.4, 22.6],
        },
      }),
    });

    await renderWithQuery(
      <WidgetCard
        widget={widget({
          url: 'https://example.com/data',
          path: 'hourly.temperature_2m',
          xPath: 'hourly.time',
          view: 'timeseries',
        })}
      />,
    );

    expect(await screen.findByText('2개 · 최소 21.4 · 최대 22.6')).toBeTruthy();
  });

  it('숫자가 없으면 안내를 표시한다', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ items: ['a', 'b'] }),
    });

    await renderWithQuery(
      <WidgetCard
        widget={widget({ url: 'https://example.com/data', path: 'items', view: 'timeseries' })}
      />,
    );

    expect(await screen.findByText('그릴 수 있는 숫자 데이터가 없습니다.')).toBeTruthy();
  });
});
