import { StyleSheet, Text, View } from 'react-native';

import { getWidgetDefinition } from './registry';
import type { WidgetInstanceLike } from './types';

type Props = {
  widget: WidgetInstanceLike;
};

/** 위젯 하나를 그린다. 타입이나 설정에 문제가 있어도 이 카드 안에서만 오류를 표시한다. */
export function WidgetCard({ widget }: Props) {
  const definition = getWidgetDefinition(widget.type);

  if (!definition) {
    return (
      <ErrorCard
        title="알 수 없는 위젯"
        message={`등록되지 않은 위젯 종류입니다: ${widget.type}`}
      />
    );
  }

  const parsed = definition.configSchema.safeParse(widget.config);
  if (!parsed.success) {
    const reason = parsed.error.issues
      .map((issue) => `${issue.path.join('.') || 'config'}: ${issue.message}`)
      .join('\n');
    return <ErrorCard title={`${definition.label} 설정 오류`} message={reason} />;
  }

  const { Renderer } = definition;
  return (
    <View style={styles.card}>
      <Renderer id={widget.id} config={parsed.data} />
    </View>
  );
}

function ErrorCard({ title, message }: { title: string; message: string }) {
  return (
    <View style={[styles.card, styles.errorCard]}>
      <Text style={styles.errorTitle}>{title}</Text>
      <Text style={styles.errorMessage}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#d0d0d0',
    padding: 16,
    gap: 4,
  },
  errorCard: {
    borderColor: '#d9534f',
    backgroundColor: '#fdf2f2',
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#a32f2b',
  },
  errorMessage: {
    fontSize: 13,
    color: '#a32f2b',
  },
});
