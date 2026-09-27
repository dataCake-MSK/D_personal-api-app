import {
  REFRESH_INTERVAL_LABELS,
  REFRESH_INTERVALS,
  resolveRefreshSeconds,
  toRefetchInterval,
} from '@/widgets/common/refresh-interval';

describe('자동 갱신 주기 설정', () => {
  it('설정이 없으면 수동(0)이다 — 기존 위젯 동작 유지', () => {
    expect(resolveRefreshSeconds(undefined)).toBe(0);
    expect(resolveRefreshSeconds({ url: 'https://example.com' })).toBe(0);
  });

  it('허용된 값만 받는다', () => {
    expect(resolveRefreshSeconds({ refreshSeconds: 60 })).toBe(60);
    expect(resolveRefreshSeconds({ refreshSeconds: 7 })).toBe(0);
    expect(resolveRefreshSeconds({ refreshSeconds: 'abc' })).toBe(0);
  });

  it('선택지와 이름이 짝을 이룬다', () => {
    expect(REFRESH_INTERVALS).toEqual([0, 30, 60, 300, 900]);
    expect(REFRESH_INTERVALS.map((s) => REFRESH_INTERVAL_LABELS[s])).toEqual([
      '수동',
      '30초',
      '1분',
      '5분',
      '15분',
    ]);
  });

  it('수동이면 자동 갱신을 끄고, 주기가 있으면 밀리초로 바꾼다', () => {
    expect(toRefetchInterval(0)).toBe(false);
    expect(toRefetchInterval(30)).toBe(30_000);
    expect(toRefetchInterval(900)).toBe(900_000);
  });
});
