import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';
import type { ReactElement } from 'react';

import { setSecret } from '@/features/secrets/secret-store';
import { HttpRequestError, runAction } from '@/lib/http-request';
import { clearWidgetRegistry } from '@/widgets/registry';
import { registerBuiltInWidgets, WidgetCard } from '@/widgets';

const fetchMock = jest.fn();

function renderWithQuery(ui: ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

const widget = (config: Record<string, unknown>) => ({ id: 'a1', type: 'http-action', config });

beforeEach(() => {
  clearWidgetRegistry();
  registerBuiltInWidgets();
  (SecureStore as unknown as { __store: Map<string, string> }).__store.clear();
  fetchMock.mockReset();
  globalThis.fetch = fetchMock as unknown as typeof fetch;
});

describe('전송 요청', () => {
  it('본문이 있으면 JSON 헤더와 함께 보낸다', async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 200 });

    await runAction({
      url: 'https://example.com/hook',
      method: 'POST',
      body: '{"a":1}',
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://example.com/hook');
    expect(init.method).toBe('POST');
    expect(init.body).toBe('{"a":1}');
    expect(init.headers).toMatchObject({ 'Content-Type': 'application/json' });
  });

  it('GET에는 본문을 붙이지 않는다', async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 204 });

    await runAction({ url: 'https://example.com/ping', method: 'GET', body: '{"a":1}' });

    expect(fetchMock.mock.calls[0][1].body).toBeUndefined();
  });

  it('헤더의 비밀 값을 요청 직전에 치환한다', async () => {
    await setSecret('HOOK_TOKEN', 'real-token');
    fetchMock.mockResolvedValue({ ok: true, status: 200 });

    await runAction({
      url: 'https://example.com/hook',
      method: 'POST',
      headers: { Authorization: 'Bearer {{secret:HOOK_TOKEN}}' },
    });

    expect(fetchMock.mock.calls[0][1].headers).toMatchObject({
      Authorization: 'Bearer real-token',
    });
  });

  it('실패 상태는 오류로 알린다', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 403 });

    await expect(runAction({ url: 'https://example.com/hook' })).rejects.toBeInstanceOf(
      HttpRequestError,
    );
  });
});

describe('데이터 전송 위젯', () => {
  it('확인을 거쳐 요청을 보내고 결과를 표시한다', async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 200 });

    await renderWithQuery(
      <WidgetCard
        widget={widget({
          url: 'https://example.com/hook',
          method: 'POST',
          buttonLabel: '배포',
          confirm: true,
        })}
      />,
    );

    await fireEvent.press(screen.getByText('배포'));
    expect(screen.getByText('POST 요청을 보낼까요?')).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByText('보내기'));

    expect(await screen.findByText('성공 (HTTP 200)')).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('확인 단계에서 취소하면 보내지 않는다', async () => {
    await renderWithQuery(
      <WidgetCard
        widget={widget({ url: 'https://example.com/hook', buttonLabel: '실행', confirm: true })}
      />,
    );

    await fireEvent.press(screen.getByText('실행'));
    await fireEvent.press(screen.getByText('취소'));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByText('실행')).toBeTruthy();
  });

  it('확인 옵션이 꺼져 있으면 바로 보낸다', async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 204 });

    await renderWithQuery(
      <WidgetCard
        widget={widget({ url: 'https://example.com/hook', buttonLabel: '실행', confirm: false })}
      />,
    );

    await fireEvent.press(screen.getByText('실행'));

    expect(await screen.findByText('성공 (HTTP 204)')).toBeTruthy();
  });

  it('실패하면 이유를 표시한다', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 500 });

    await renderWithQuery(
      <WidgetCard
        widget={widget({ url: 'https://example.com/hook', buttonLabel: '실행', confirm: false })}
      />,
    );

    await fireEvent.press(screen.getByText('실행'));

    expect(await screen.findByText(/HTTP 500/)).toBeTruthy();
  });

  it('응답 본문은 화면에 표시하지 않는다', async () => {
    const json = jest.fn();
    const text = jest.fn();
    fetchMock.mockResolvedValue({ ok: true, status: 200, json, text });

    await renderWithQuery(
      <WidgetCard
        widget={widget({ url: 'https://example.com/hook', buttonLabel: '실행', confirm: false })}
      />,
    );

    await fireEvent.press(screen.getByText('실행'));
    await screen.findByText('성공 (HTTP 200)');

    expect(json).not.toHaveBeenCalled();
    expect(text).not.toHaveBeenCalled();
  });
});
