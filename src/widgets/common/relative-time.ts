const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * 마지막 갱신 시각을 "방금 / ○분 전 / ○시간 전 / ○일 전"으로 표시한다.
 * @param timestamp 갱신 시각(ms). 0이나 없으면 null을 돌려준다.
 */
export function formatRelativeTime(timestamp: number | undefined, now = Date.now()): string | null {
  if (!timestamp) return null;

  const elapsed = now - timestamp;
  if (elapsed < 0) return '방금';
  if (elapsed < MINUTE) return '방금';
  if (elapsed < HOUR) return `${Math.floor(elapsed / MINUTE)}분 전`;
  if (elapsed < DAY) return `${Math.floor(elapsed / HOUR)}시간 전`;
  return `${Math.floor(elapsed / DAY)}일 전`;
}
