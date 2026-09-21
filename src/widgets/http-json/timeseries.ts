export type ChartPoint = {
  value: number;
  label?: string;
};

export type SeriesMapping = {
  /** 객체 배열일 때 값으로 쓸 필드 */
  yField?: string;
  /** 객체 배열일 때 시간축으로 쓸 필드 */
  xField?: string;
};

const MAX_LABELS = 6;

/**
 * 응답 데이터를 선 그래프용 점 배열로 바꾼다.
 * - 숫자 배열: 값 그대로, 라벨은 xValues(있으면) 또는 없음
 * - 객체 배열: yField/xField로 값과 라벨을 꺼냄
 */
export function toChartPoints(
  value: unknown,
  mapping: SeriesMapping = {},
  xValues?: unknown,
): ChartPoint[] {
  if (!Array.isArray(value)) return [];

  const labels = Array.isArray(xValues) ? xValues : undefined;

  return value
    .map((item, index): ChartPoint | null => {
      const raw =
        item && typeof item === 'object' && !Array.isArray(item)
          ? (item as Record<string, unknown>)[mapping.yField ?? 'value']
          : item;

      const numeric = toNumber(raw);
      if (numeric === null) return null;

      const labelSource =
        item && typeof item === 'object' && !Array.isArray(item) && mapping.xField
          ? (item as Record<string, unknown>)[mapping.xField]
          : labels?.[index];

      return { value: numeric, label: formatLabel(labelSource) };
    })
    .filter((point): point is ChartPoint => point !== null);
}

/** 점이 많으면 라벨이 겹치므로 일정 간격만 남긴다. */
export function thinLabels(points: ChartPoint[], maxLabels = MAX_LABELS): ChartPoint[] {
  if (points.length <= maxLabels) return points;

  const step = Math.ceil(points.length / maxLabels);
  return points.map((point, index) =>
    index % step === 0 ? point : { ...point, label: undefined },
  );
}

function toNumber(raw: unknown): number | null {
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  if (typeof raw === 'string' && raw.trim() !== '' && Number.isFinite(Number(raw))) {
    return Number(raw);
  }
  return null;
}

/** ISO 시각이면 시:분만 남기고, 그 외에는 짧은 문자열로 만든다. */
function formatLabel(raw: unknown): string | undefined {
  if (raw === null || raw === undefined) return undefined;

  const text = String(raw);

  // 2026-09-20T13:00 → 13:00
  const isoTime = text.match(/^\d{4}-\d{2}-\d{2}T(\d{2}:\d{2})/);
  if (isoTime) return isoTime[1];

  // 2026-09-20 → 09-20
  const isoDate = text.match(/^\d{4}-(\d{2}-\d{2})$/);
  if (isoDate) return isoDate[1];

  return text.length > 8 ? `${text.slice(0, 7)}…` : text;
}
