import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { z } from 'zod';

import { checkUrl, runAction } from '@/lib/http-request';

import type { WidgetConfigEditorProps, WidgetDefinition, WidgetRendererProps } from '../types';

const METHODS = ['POST', 'PUT', 'PATCH', 'DELETE', 'GET'] as const;

export const httpActionConfigSchema = z.object({
  title: z.string().min(1).optional(),
  buttonLabel: z.string().min(1).default('실행'),
  url: z.string().url(),
  method: z.enum(METHODS).default('POST'),
  /** 예: { "Authorization": "Bearer {{secret:MY_TOKEN}}" } */
  headers: z.record(z.string(), z.string()).optional(),
  body: z.string().optional(),
  /** 실행 전에 한 번 더 확인할지 */
  confirm: z.boolean().default(true),
});

export type HttpActionConfig = z.infer<typeof httpActionConfigSchema>;

function HttpActionRenderer({ config }: WidgetRendererProps<HttpActionConfig>) {
  const [confirming, setConfirming] = useState(false);

  const send = useMutation({
    mutationFn: () =>
      runAction({
        url: config.url,
        method: config.method,
        headers: config.headers,
        body: config.body,
      }),
  });

  const run = () => {
    setConfirming(false);
    send.mutate();
  };

  const warning = checkUrl(config.url).warning;

  return (
    <>
      {config.title ? <Text style={styles.title}>{config.title}</Text> : null}
      {warning ? <Text style={styles.warning}>{warning}</Text> : null}

      {confirming ? (
        <View style={styles.confirmBox}>
          <Text style={styles.confirmText}>{config.method} 요청을 보낼까요?</Text>
          <View style={styles.confirmActions}>
            <Pressable accessibilityRole="button" onPress={() => setConfirming(false)}>
              <Text style={styles.cancelLabel}>취소</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={run}>
              <Text style={styles.confirmLabel}>보내기</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable
          accessibilityRole="button"
          disabled={send.isPending}
          style={[styles.button, send.isPending && styles.buttonDisabled]}
          onPress={() => (config.confirm ? setConfirming(true) : run())}
        >
          <Text style={styles.buttonLabel}>
            {send.isPending ? '보내는 중…' : config.buttonLabel}
          </Text>
        </Pressable>
      )}

      {send.isSuccess ? <Text style={styles.success}>성공 (HTTP {send.data.status})</Text> : null}
      {send.isError ? <Text style={styles.error}>{send.error.message}</Text> : null}
    </>
  );
}

function HttpActionConfigEditor({ value, onChange }: WidgetConfigEditorProps) {
  const text = (key: string) => (typeof value[key] === 'string' ? (value[key] as string) : '');
  const method = METHODS.find((m) => m === value.method) ?? 'POST';
  const confirm = value.confirm !== false;

  return (
    <View style={styles.form}>
      <Text style={styles.label}>제목 (선택)</Text>
      <TextInput
        style={styles.input}
        value={text('title')}
        onChangeText={(title) => onChange({ ...value, title })}
        placeholder="예: 배포 트리거"
      />

      <Text style={styles.label}>버튼 문구</Text>
      <TextInput
        style={styles.input}
        value={text('buttonLabel')}
        onChangeText={(buttonLabel) => onChange({ ...value, buttonLabel })}
        placeholder="실행"
      />

      <Text style={styles.label}>주소 (https)</Text>
      <TextInput
        style={styles.input}
        value={text('url')}
        onChangeText={(url) => onChange({ ...value, url })}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="https://api.example.com/actions"
      />

      <Text style={styles.label}>방식</Text>
      <View style={styles.chips}>
        {METHODS.map((option) => (
          <Text
            key={option}
            accessibilityRole="button"
            onPress={() => onChange({ ...value, method: option })}
            style={[styles.chip, method === option && styles.chipSelected]}
          >
            {option}
          </Text>
        ))}
      </View>

      <Text style={styles.label}>보낼 내용 (선택, JSON)</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        value={text('body')}
        onChangeText={(body) => onChange({ ...value, body })}
        autoCapitalize="none"
        autoCorrect={false}
        multiline
        placeholder={'{"key": "value"}'}
      />

      <Text
        accessibilityRole="button"
        onPress={() => onChange({ ...value, confirm: !confirm })}
        style={styles.toggle}
      >
        {confirm ? '☑' : '☐'} 보내기 전에 한 번 더 확인
      </Text>

      <Text style={styles.hint}>
        인증이 필요하면 헤더에 {'{{secret:이름}}'} 을 쓰세요. 응답 본문은 비밀 값이 섞일 수 있어
        표시하지 않고 상태 코드만 보여줍니다.
      </Text>
    </View>
  );
}

export const httpActionWidget: WidgetDefinition<HttpActionConfig> = {
  type: 'http-action',
  label: '데이터 전송',
  configSchema: httpActionConfigSchema,
  Renderer: HttpActionRenderer,
  ConfigEditor: HttpActionConfigEditor,
  defaultConfig: { url: '', method: 'POST', buttonLabel: '실행', confirm: true },
};

const styles = StyleSheet.create({
  title: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  warning: { fontSize: 12, color: '#8a6d1f', marginBottom: 4 },
  button: {
    backgroundColor: '#208aef',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonDisabled: { backgroundColor: '#9dc7ef' },
  buttonLabel: { color: '#fff', fontSize: 16, fontWeight: '600' },
  confirmBox: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#208aef',
    borderRadius: 10,
    padding: 12,
    gap: 8,
  },
  confirmText: { fontSize: 14 },
  confirmActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16 },
  cancelLabel: { fontSize: 15, color: '#666' },
  confirmLabel: { fontSize: 15, color: '#208aef', fontWeight: '600' },
  success: { fontSize: 13, color: '#2a6b2f', marginTop: 6 },
  error: { fontSize: 13, color: '#a32f2b', marginTop: 6 },
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
  multiline: { minHeight: 72, textAlignVertical: 'top' },
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
  toggle: { fontSize: 14, color: '#333', paddingVertical: 6 },
  hint: { fontSize: 12, color: '#777', marginTop: 4 },
});
