import { useSyncExternalStore } from 'react';

/** 경과 시간 표시를 갱신하는 간격 */
export const TICK_MS = 30_000;

let now = Date.now();
let timer: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  // 오래 지난 뒤 처음 구독할 수 있으므로 현재 시각으로 맞춘다.
  now = Date.now();
  listeners.add(onChange);

  // 위젯이 몇 개든 타이머는 하나만 돌린다.
  if (!timer) {
    timer = setInterval(() => {
      now = Date.now();
      listeners.forEach((listener) => listener());
    }, TICK_MS);
  }

  return () => {
    listeners.delete(onChange);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

/**
 * 30초마다 갱신되는 "현재 시각".
 * 경과 시간 문구가 시간이 지나도 따라 바뀌게 하려고 쓴다.
 */
export function useNow(): number {
  return useSyncExternalStore(
    subscribe,
    () => now,
    () => now,
  );
}
