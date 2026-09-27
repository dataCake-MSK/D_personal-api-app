import { StyleSheet, Text, TextInput, View } from 'react-native';
import { z } from 'zod';

import { DisplayText } from '../common/display-text';
import { resolveTextDisplay, textDisplaySchema } from '../common/text-display';
import { TextDisplayEditor } from '../common/text-display-editor';
import type { WidgetConfigEditorProps, WidgetDefinition, WidgetRendererProps } from '../types';

export const textWidgetConfigSchema = textDisplaySchema.extend({
  title: z.string().min(1).optional(),
  text: z.string().min(1),
});

export type TextWidgetConfig = z.infer<typeof textWidgetConfigSchema>;

function TextWidgetRenderer({ config }: WidgetRendererProps<TextWidgetConfig>) {
  const display = resolveTextDisplay(config);

  return (
    <>
      {config.title ? (
        <DisplayText display={display} baseSize={14} style={styles.title}>
          {config.title}
        </DisplayText>
      ) : null}
      <DisplayText display={display} baseSize={16}>
        {config.text}
      </DisplayText>
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

      <TextDisplayEditor value={value} onChange={onChange} />
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
    fontWeight: '600',
    marginBottom: 4,
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
