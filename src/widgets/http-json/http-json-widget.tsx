import { useQuery } from '@tanstack/react-query';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { z } from 'zod';

import { checkUrl, requestJson } from '@/lib/http-request';
import { getByPath } from '@/lib/json-path';

import type { WidgetConfigEditorProps, WidgetDefinition, WidgetRendererProps } from '../types';

import { TimeSeriesView } from './chart-view';
import { toChartPoints } from './timeseries';
import { TableValueView, TextValueView } from './views';

export const httpJsonConfigSchema = z.object({
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
  const { data, error, isPending } = useQuery({
    queryKey: ['http-json', id, config.url, config.path, config.xPath],
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
          <TableValueView value={data.value} />
        ) : config.view === 'timeseries' ? (
          <TimeSeriesView
            points={toChartPoints(
              data.value,
              { xField: config.xField, yField: config.yField },
              data.xValues,
            )}
          />
        ) : (
          <TextValueView value={data.value} />
        )
      ) : null}
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

      <Text style={styles.hint}>
        인증이 필요하면 헤더에 {'{{secret:이름}}'} 을 쓰세요. 값은 API 키 관리 화면에서 저장합니다.
      </Text>
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
