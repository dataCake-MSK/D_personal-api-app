import { formatRelativeTime } from '@/widgets/common/relative-time';

const NOW = new Date('2026-09-27T12:00:00Z').getTime();

describe('마지막 갱신 시각 표시', () => {
  it('값이 없으면 표시하지 않는다', () => {
    expect(formatRelativeTime(undefined, NOW)).toBeNull();
    expect(formatRelativeTime(0, NOW)).toBeNull();
  });

  it('1분 이내는 "방금"', () => {
    expect(formatRelativeTime(NOW, NOW)).toBe('방금');
    expect(formatRelativeTime(NOW - 59_000, NOW)).toBe('방금');
  });

  it('분 단위로 표시한다', () => {
    expect(formatRelativeTime(NOW - 60_000, NOW)).toBe('1분 전');
    expect(formatRelativeTime(NOW - 59 * 60_000, NOW)).toBe('59분 전');
  });

  it('시간 단위로 표시한다', () => {
    expect(formatRelativeTime(NOW - 60 * 60_000, NOW)).toBe('1시간 전');
    expect(formatRelativeTime(NOW - 23 * 60 * 60_000, NOW)).toBe('23시간 전');
  });

  it('하루가 지나면 일 단위로 표시한다', () => {
    expect(formatRelativeTime(NOW - 24 * 60 * 60_000, NOW)).toBe('1일 전');
  });

  it('시계가 앞선 경우에도 "방금"으로 처리한다', () => {
    expect(formatRelativeTime(NOW + 5_000, NOW)).toBe('방금');
  });
});
