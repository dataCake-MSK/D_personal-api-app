import { z } from 'zod';

/** 갱신 주기(초). 0은 수동(자동 갱신 없음) */
export const REFRESH_INTERVALS = [0, 30, 60, 300, 900] as const;

export type RefreshInterval = (typeof REFRESH_INTERVALS)[number];

export const refreshIntervalSchema = z.object({
  /** 기본값은 수동(D11) */
  refreshSeconds: z
    .union([z.literal(0), z.literal(30), z.literal(60), z.literal(300), z.literal(900)])
    .default(0),
});

export const REFRESH_INTERVAL_LABELS: Record<RefreshInterval, string> = {
  0: '수동',
  30: '30초',
  60: '1분',
  300: '5분',
  900: '15분',
};

/** 설정에서 주기를 읽는다. 없거나 허용되지 않은 값이면 수동(0). */
export function resolveRefreshSeconds(config: unknown): RefreshInterval {
  const parsed = refreshIntervalSchema.safeParse(config ?? {});
  return parsed.success ? parsed.data.refreshSeconds : 0;
}

/** TanStack Query의 refetchInterval 값으로 바꾼다. 수동이면 false. */
export function toRefetchInterval(seconds: RefreshInterval): number | false {
  return seconds > 0 ? seconds * 1000 : false;
}
