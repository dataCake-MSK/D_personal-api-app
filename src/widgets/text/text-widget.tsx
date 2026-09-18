import { StyleSheet, Text } from 'react-native';
import { z } from 'zod';

import type { WidgetDefinition, WidgetRendererProps } from '../types';

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

export const textWidget: WidgetDefinition<TextWidgetConfig> = {
  type: 'text',
  label: '텍스트',
  configSchema: textWidgetConfigSchema,
  Renderer: TextWidgetRenderer,
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
});
