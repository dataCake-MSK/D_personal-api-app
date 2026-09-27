import { StyleSheet, Text, TextInput, View } from 'react-native';

import { FONT_SCALE_LABELS, resolveTextDisplay, type TextDisplayConfig } from './text-display';

type Props = {
  value: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
};

const SCALES: TextDisplayConfig['fontScale'][] = ['small', 'medium', 'large'];

/** 위젯 설정에 붙이는 공통 텍스트 표시 옵션 UI (SRS-019, SRS-020) */
export function TextDisplayEditor({ value, onChange }: Props) {
  const display = resolveTextDisplay(value);
  const set = (patch: Partial<TextDisplayConfig>) => onChange({ ...value, ...patch });

  return (
    <View style={styles.container}>
      <Text style={styles.label}>글자 크기</Text>
      <View style={styles.chips}>
        {SCALES.map((scale) => (
          <Text
            key={scale}
            accessibilityRole="button"
            onPress={() => set({ fontScale: scale })}
            style={[styles.chip, display.fontScale === scale && styles.chipSelected]}
          >
            {FONT_SCALE_LABELS[scale]}
          </Text>
        ))}
      </View>

      <Text
        accessibilityRole="button"
        onPress={() => set({ wrap: !display.wrap })}
        style={styles.toggle}
      >
        {display.wrap ? '☑' : '☐'} 긴 내용 줄바꿈
      </Text>

      {display.wrap ? (
        <>
          <Text style={styles.label}>최대 줄 수 (0 = 제한 없음)</Text>
          <TextInput
            style={styles.input}
            value={String(display.maxLines)}
            onChangeText={(text) => {
              const digits = text.replace(/[^0-9]/g, '');
              set({ maxLines: Math.min(20, Number(digits || 0)) });
            }}
            keyboardType="number-pad"
            placeholder="0"
          />
        </>
      ) : (
        <>
          <Text style={styles.label}>한 줄에 넘칠 때</Text>
          <View style={styles.chips}>
            {(['ellipsis', 'scroll'] as const).map((option) => (
              <Text
                key={option}
                accessibilityRole="button"
                onPress={() => set({ overflow: option })}
                style={[styles.chip, display.overflow === option && styles.chipSelected]}
              >
                {option === 'ellipsis' ? '… 로 줄임' : '가로 스크롤'}
              </Text>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  label: { fontSize: 13, color: '#555' },
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
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#b0b0b0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
});
