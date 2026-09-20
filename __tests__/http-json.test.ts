import * as SecureStore from 'expo-secure-store';

import { setSecret } from '@/features/secrets/secret-store';
import { checkUrl, HttpRequestError, requestJson } from '@/lib/http-request';
import { getByPath, parsePath } from '@/lib/json-path';
import { formatValue, toRows } from '@/widgets/http-json/views';

const sample = {
  hourly: { time: ['2026-09-20T00:00'], temperature_2m: [21.4] },
  items: [
    { id: 1, price: 1000 },
    { id: 2, price: 2000 },
  ],
};

describe('점 표기 경로', () => {
  it('경로를 키와 인덱스로 나눈다', () => {
    expect(parsePath('data.items[0].price')).toEqual(['data', 'items', 0, 'price']);
  });

  it('중첩 값과 배열 요소를 꺼낸다', () => {
    expect(getByPath(sample, 'hourly.temperature_2m[0]')).toBe(21.4);
    expect(getByPath(sample, 'items[1].price')).toBe(2000);
    expect(getByPath(sample, 'items')).toEqual(sample.items);
  });

  it('경로가 없으면 원본을 돌려준다', () => {
    expect(getByPath(sample)).toBe(sample);
    expect(getByPath(sample, '')).toBe(sample);
  });

  it('없는 경로는 undefined', () => {
    expect(getByPath(sample, 'hourly.humidity')).toBeUndefined();
    expect(getByPath(sample, 'items[9].price')).toBeUndefined();
    expect(getByPath(sample, 'hourly.time[0].nope')).toBeUndefined();
  });
});

describe('주소 검사', () => {
  it('https는 통과한다', () => {
    expect(checkUrl('https://api.open-meteo.com/v1/forecast')).toEqual({ ok: true });
  });

  it('http는 통과하되 경고를 준다', () => {
    const result = checkUrl('http://example.com');
    expect(result.ok).toBe(true);
    expect(result.warning).toContain('https');
  });

  it('형식이 잘못되면 거부한다', () => {
    expect(checkUrl('그냥 글자').ok).toBe(false);
    expect(checkUrl('ftp://example.com').ok).toBe(false);
  });
});

describe('요청', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    (SecureStore as unknown as { __store: Map<string, string> }).__store.clear();
    fetchMock.mockReset();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  it('JSON 응답을 돌려준다', async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 200, json: async () => sample });

    expect(await requestJson({ url: 'https://example.com/data' })).toEqual(sample);
  });

  it('헤더의 {{secret:NAME}}을 요청 직전에 치환한다', async () => {
    await setSecret('MY_TOKEN', 'real-token-value');
    fetchMock.mockResolvedValue({ ok: true, status: 200, json: async () => ({}) });

    const config = {
      url: 'https://example.com/data',
      headers: { Authorization: 'Bearer {{secret:MY_TOKEN}}' },
    };
    await requestJson(config);

    expect(fetchMock.mock.calls[0][1].headers).toEqual({
      Authorization: 'Bearer real-token-value',
    });
    // 원본 설정에는 실제 값이 남지 않는다
    expect(config.headers.Authorization).toBe('Bearer {{secret:MY_TOKEN}}');
  });

  it('실패 응답은 상태 코드와 함께 알린다', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 401, json: async () => ({}) });

    await expect(requestJson({ url: 'https://example.com/data' })).rejects.toMatchObject({
      name: 'HttpRequestError',
      status: 401,
    });
  });

  it('네트워크 오류 메시지에 헤더를 넣지 않는다', async () => {
    fetchMock.mockRejectedValue(new Error('getaddrinfo ENOTFOUND secret-host'));

    const error: HttpRequestError = await requestJson({
      url: 'https://example.com/data',
      headers: { Authorization: 'Bearer very-secret' },
    }).then(
      () => {
        throw new Error('오류가 발생해야 합니다');
      },
      (e: HttpRequestError) => e,
    );

    expect(error.message).not.toContain('very-secret');
    expect(error.message).toContain('네트워크');
  });

  it('잘못된 주소는 호출하지 않는다', async () => {
    await expect(requestJson({ url: 'ftp://example.com' })).rejects.toBeInstanceOf(
      HttpRequestError,
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('표 변환', () => {
  it('객체 배열은 그대로, 원시값 배열은 value 열로 만든다', () => {
    expect(toRows(sample.items)).toEqual(sample.items);
    expect(toRows([1, 2])).toEqual([{ value: 1 }, { value: 2 }]);
    expect(toRows({ a: 1 })).toEqual([{ a: 1 }]);
    expect(toRows(3)).toEqual([]);
  });

  it('값을 사람이 읽을 형태로 바꾼다', () => {
    expect(formatValue(null)).toBe('-');
    expect(formatValue(21.4)).toBe('21.4');
    expect(formatValue('안녕')).toBe('안녕');
    expect(formatValue({ a: 1 })).toBe('{"a":1}');
  });
});
