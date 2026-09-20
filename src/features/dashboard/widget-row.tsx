import { Pressable, StyleSheet, Text, View } from 'react-native';

import { WidgetCard } from '@/widgets';

import type { WidgetInstance } from './types';

type Props = {
  widget: WidgetInstance;
  index: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
};

export function WidgetRow({ widget, index, total, onMoveUp, onMoveDown, onRemove }: Props) {
  return (
    <View style={styles.row}>
      <WidgetCard widget={widget} />

      <View style={styles.controls}>
        <Control label="위로" disabled={index === 0} onPress={onMoveUp} />
        <Control label="아래로" disabled={index === total - 1} onPress={onMoveDown} />
        <Control label="삭제" onPress={onRemove} destructive />
      </View>
    </View>
  );
}

function Control({
  label,
  onPress,
  disabled,
  destructive,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  destructive?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={styles.control}
    >
      <Text
        style={[
          styles.controlLabel,
          disabled && styles.controlDisabled,
          destructive && styles.controlDestructive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 6,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 4,
  },
  control: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  controlLabel: {
    fontSize: 13,
    color: '#208aef',
  },
  controlDisabled: {
    color: '#bbb',
  },
  controlDestructive: {
    color: '#d9534f',
  },
});
