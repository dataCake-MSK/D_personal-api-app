import { REFRESH_INTERVAL_LABELS, type RefreshInterval } from './refresh-interval';
import { formatRelativeTime } from './relative-time';

type StatusInput = {
  /** 마지막으로 데이터를 받은 시각(ms) */
  updatedAt: number | undefined;
  refreshSeconds: RefreshInterval;
  isFetching: boolean;
  now?: number;
};

/**
 * 카드 하단 상태 문구를 만든다.
 * 예: "갱신 중…", "방금 갱신 · 수동", "3분 전 갱신 · 1분마다"
 */
export function buildStatusText({
  updatedAt,
  refreshSeconds,
  isFetching,
  now = Date.now(),
}: StatusInput): string {
  if (isFetching) return '갱신 중…';

  const elapsed = formatRelativeTime(updatedAt, now);
  const mode = refreshSeconds > 0 ? `${REFRESH_INTERVAL_LABELS[refreshSeconds]}마다` : '수동';

  return elapsed ? `${elapsed} 갱신 · ${mode}` : mode;
}
