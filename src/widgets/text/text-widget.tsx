import { StyleSheet, Text, TextInput, View } from 'react-native';
import { z } from 'zod';

import type { WidgetConfigEditorProps, WidgetDefinition, WidgetRendererProps } from '../types';

export const textWidgetConfigSchema = z.object({
  title: z.string().min(1).optional(),
  text: z.string().min(1),
});

export type TextWidgetConfig = z.infer<typeof textWidgetConfigSchema>;

function TextWidgetRenderer({ config }: WidgetRendererProps<TextWidgetConfig>) {
  return (
    <>
      {config.title ? <Text style={styles.title}>{config.title}</Text> : null}
      <Text style={styles.text}>{config.text}</Text>
    </>
  );
}

function TextWidgetConfigEditor({ value, onChange }: WidgetConfigEditorProps) {
  return (
    <View style={styles.form}>
      <Text style={styles.label}>제목 (선택)</Text>
      <TextInput
        style={styles.input}
        value={typeof value.title === 'string' ? value.title : ''}
        onChangeText={(title) => onChange({ ...value, title })}
        placeholder="예: 서버 상태"
      />

      <Text style={styles.label}>내용</Text>
      <TextInput
        style={styles.input}
        value={typeof value.text === 'string' ? value.text : ''}
        onChangeText={(text) => onChange({ ...value, text })}
        placeholder="표시할 문구"
      />
    </View>
  );
}

export const textWidget: WidgetDefinition<TextWidgetConfig> = {
  type: 'text',
  label: '텍스트',
  configSchema: textWidgetConfigSchema,
  Renderer: TextWidgetRenderer,
  ConfigEditor: TextWidgetConfigEditor,
  defaultConfig: { text: '' },
};

const styles = StyleSheet.create({
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  text: {
    fontSize: 16,
  },
  form: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    color: '#555',
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#b0b0b0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
});
