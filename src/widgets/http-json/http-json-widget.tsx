import { useQuery } from '@tanstack/react-query';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { z } from 'zod';

import { checkUrl, requestJson } from '@/lib/http-request';
import { getByPath } from '@/lib/json-path';

import { HeadersEditor } from '../common/headers-editor';
import { buildStatusText } from '../common/status-text';
import {
  REFRESH_INTERVAL_LABELS,
  REFRESH_INTERVALS,
  refreshIntervalSchema,
  resolveRefreshSeconds,
  toRefetchInterval,
} from '../common/refresh-interval';
import { resolveTextDisplay, textDisplaySchema } from '../common/text-display';
import { TextDisplayEditor } from '../common/text-display-editor';
import { useNow } from '../common/use-now';
import type { WidgetConfigEditorProps, WidgetDefinition, WidgetRendererProps } from '../types';

import { TimeSeriesView } from './chart-view';
import { toChartPoints } from './timeseries';
import { TableValueView, TextValueView } from './views';

export const httpJsonConfigSchema = textDisplaySchema.extend(refreshIntervalSchema.shape).extend({
  title: z.string().min(1).optional(),
  url: z.string().url(),
  /** 점 표기 경로. 예: hourly.temperature_2m[0] */
  path: z.string().optional(),
  view: z.enum(['text', 'table', 'timeseries']).default('text'),
  /** 시계열: 시간축 값이 따로 있는 경우의 경로. 예: hourly.time */
  xPath: z.string().optional(),
  /** 시계열: 객체 배열일 때 쓸 필드 이름 */
  xField: z.string().optional(),
  yField: z.string().optional(),
  /** 예: { "Authorization": "Bearer {{secret:MY_TOKEN}}" } */
  headers: z.record(z.string(), z.string()).optional(),
});

export type HttpJsonConfig = z.infer<typeof httpJsonConfigSchema>;

function HttpJsonRenderer({ id, config }: WidgetRendererProps<HttpJsonConfig>) {
  const refreshSeconds = resolveRefreshSeconds(config);
  const { data, error, isPending, isFetching, dataUpdatedAt, refetch } = useQuery({
    queryKey: ['http-json', id, config.url, config.path, config.xPath],
    refetchInterval: toRefetchInterval(refreshSeconds),
    // 경로에 값이 없을 수도 있으므로 undefined를 그대로 반환하지 않고 감싼다.
    queryFn: async () => {
      const json = await requestJson({ url: config.url, headers: config.headers });
      return {
        value: getByPath(json, config.path),
        xValues: config.xPath ? getByPath(json, config.xPath) : undefined,
      };
    },
  });

  const warning = checkUrl(config.url).warning;
  const display = resolveTextDisplay(config);
  // 30초마다 바뀌는 현재 시각을 써서 "○분 전" 표시가 멈추지 않게 한다.
  const now = useNow();
  const statusText = buildStatusText({
    updatedAt: dataUpdatedAt,
    refreshSeconds,
    isFetching,
    now,
  });

  return (
    <>
      {config.title ? <Text style={styles.title}>{config.title}</Text> : null}
      {warning ? <Text style={styles.warning}>{warning}</Text> : null}

      {isPending ? <Text style={styles.status}>불러오는 중…</Text> : null}
      {error ? <Text style={styles.error}>{error.message}</Text> : null}

      {!isPending && !error ? (
        data.value === undefined ? (
          <Text style={styles.status}>해당 경로에 데이터가 없습니다.</Text>
        ) : config.view === 'table' ? (
          <TableValueView value={data.value} display={display} />
        ) : config.view === 'timeseries' ? (
          <TimeSeriesView
            points={toChartPoints(
              data.value,
              { xField: config.xField, yField: config.yField },
              data.xValues,
            )}
          />
        ) : (
          <TextValueView value={data.value} display={display} />
        )
      ) : null}

      <View style={styles.footer}>
        <Text style={styles.updatedAt}>{statusText}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="새로고침"
          disabled={isFetching}
          onPress={() => refetch()}
        >
          <Text style={[styles.refresh, isFetching && styles.refreshDisabled]}>새로고침</Text>
        </Pressable>
      </View>
    </>
  );
}

function HttpJsonConfigEditor({ value, onChange }: WidgetConfigEditorProps) {
  const text = (key: string) => (typeof value[key] === 'string' ? (value[key] as string) : '');
  const view =
    value.view === 'table' ? 'table' : value.view === 'timeseries' ? 'timeseries' : 'text';

  return (
    <View style={styles.form}>
      <Text style={styles.label}>제목 (선택)</Text>
      <TextInput
        style={styles.input}
        value={text('title')}
        onChangeText={(title) => onChange({ ...value, title })}
        placeholder="예: 서울 기온"
      />

      <Text style={styles.label}>주소 (https)</Text>
      <TextInput
        style={styles.input}
        value={text('url')}
        onChangeText={(url) => onChange({ ...value, url })}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="https://api.example.com/data"
      />

      <Text style={styles.label}>값 경로 (선택, 점 표기)</Text>
      <TextInput
        style={styles.input}
        value={text('path')}
        onChangeText={(path) => onChange({ ...value, path })}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="예: hourly.temperature_2m[0]"
      />

      <Text style={styles.label}>표시 형식</Text>
      <View style={styles.viewToggle}>
        {(['text', 'table', 'timeseries'] as const).map((option) => (
          <Text
            key={option}
            accessibilityRole="button"
            onPress={() => onChange({ ...value, view: option })}
            style={[styles.viewOption, view === option && styles.viewOptionSelected]}
          >
            {option === 'text' ? '텍스트' : option === 'table' ? '테이블' : '그래프'}
          </Text>
        ))}
      </View>

      {view === 'timeseries' ? (
        <>
          <Text style={styles.label}>시간축 경로 (선택)</Text>
          <TextInput
            style={styles.input}
            value={text('xPath')}
            onChangeText={(xPath) => onChange({ ...value, xPath })}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="예: hourly.time"
          />

          <Text style={styles.label}>값 필드 / 시간 필드 (객체 배열일 때)</Text>
          <View style={styles.fieldRow}>
            <TextInput
              style={[styles.input, styles.fieldInput]}
              value={text('yField')}
              onChangeText={(yField) => onChange({ ...value, yField })}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="예: price"
            />
            <TextInput
              style={[styles.input, styles.fieldInput]}
              value={text('xField')}
              onChangeText={(xField) => onChange({ ...value, xField })}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="예: date"
            />
          </View>
        </>
      ) : null}

      <Text style={styles.label}>자동 갱신</Text>
      <View style={styles.chips}>
        {REFRESH_INTERVALS.map((seconds) => (
          <Text
            key={seconds}
            accessibilityRole="button"
            onPress={() => onChange({ ...value, refreshSeconds: seconds })}
            style={[styles.chip, resolveRefreshSeconds(value) === seconds && styles.chipSelected]}
          >
            {REFRESH_INTERVAL_LABELS[seconds]}
          </Text>
        ))}
      </View>
      <Text style={styles.hint}>화면을 보고 있는 동안만 갱신됩니다.</Text>

      {view !== 'timeseries' ? <TextDisplayEditor value={value} onChange={onChange} /> : null}

      <HeadersEditor
        headers={value.headers as Record<string, string> | undefined}
        onChange={(headers) => onChange({ ...value, headers })}
      />
    </View>
  );
}

export const httpJsonWidget: WidgetDefinition<HttpJsonConfig> = {
  type: 'http-json',
  label: 'API 데이터',
  configSchema: httpJsonConfigSchema,
  Renderer: HttpJsonRenderer,
  ConfigEditor: HttpJsonConfigEditor,
  defaultConfig: { url: '', view: 'text' },
};

const styles = StyleSheet.create({
  title: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  updatedAt: { fontSize: 11, color: '#999' },
  refresh: { fontSize: 12, color: '#208aef' },
  refreshDisabled: { color: '#9dc7ef' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#b0b0b0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 14,
    color: '#333',
  },
  chipSelected: { borderColor: '#208aef', color: '#208aef', fontWeight: '600' },
  status: { fontSize: 14, color: '#666' },
  error: { fontSize: 13, color: '#a32f2b' },
  warning: { fontSize: 12, color: '#8a6d1f', marginBottom: 4 },
  form: { gap: 6 },
  label: { fontSize: 13, color: '#555' },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#b0b0b0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  viewToggle: { flexDirection: 'row', gap: 8 },
  fieldRow: { flexDirection: 'row', gap: 8 },
  fieldInput: { flex: 1 },
  viewOption: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#b0b0b0',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 15,
    color: '#333',
  },
  viewOptionSelected: { borderColor: '#208aef', color: '#208aef', fontWeight: '600' },
  hint: { fontSize: 12, color: '#777', marginTop: 4 },
});
