import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useSecretsStore } from '@/features/secrets/secrets-store';

export type HeaderRow = { name: string; value: string };

type Props = {
  /** 위젯 설정에 저장된 형태: { "Authorization": "Bearer {{secret:TOKEN}}" } */
  headers: Record<string, string> | undefined;
  onChange: (headers: Record<string, string>) => void;
};

/** 저장 형태(객체) ↔ 편집 형태(줄 목록) 변환. 입력 도중 이름이 비어도 줄이 사라지지 않게 한다. */
export function toHeaderRows(headers: Record<string, string> | undefined): HeaderRow[] {
  return Object.entries(headers ?? {}).map(([name, value]) => ({ name, value }));
}

export function toHeaderRecord(rows: HeaderRow[]): Record<string, string> {
  return Object.fromEntries(
    rows.filter((row) => row.name.trim() !== '').map((row) => [row.name.trim(), row.value]),
  );
}

export function secretReference(name: string) {
  return `{{secret:${name}}}`;
}

export function HeadersEditor({ headers, onChange }: Props) {
  // 이름을 비우는 순간 줄이 사라지지 않도록 편집 중에는 줄 목록을 그대로 들고 있는다.
  const [rows, setRows] = useState<HeaderRow[]>(() => toHeaderRows(headers));
  const secretNames = useSecretsStore((state) => state.names);
  const refreshSecrets = useSecretsStore((state) => state.refresh);

  useEffect(() => {
    refreshSecrets();
  }, [refreshSecrets]);

  const apply = (next: HeaderRow[]) => {
    setRows(next);
    onChange(toHeaderRecord(next));
  };

  const update = (index: number, patch: Partial<HeaderRow>) => {
    apply(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const remove = (index: number) => {
    apply(rows.filter((_, i) => i !== index));
  };

  const add = () => {
    apply([...rows, { name: 'Authorization', value: '' }]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>요청 헤더 (선택)</Text>

      {rows.map((row, index) => (
        <View key={index} style={styles.row}>
          <View style={styles.inputs}>
            <TextInput
              style={styles.input}
              value={row.name}
              onChangeText={(name) => update(index, { name })}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="이름 (예: Authorization)"
            />
            <TextInput
              style={styles.input}
              value={row.value}
              onChangeText={(value) => update(index, { value })}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="값 (예: Bearer {{secret:MY_TOKEN}})"
            />
          </View>

          {secretNames.length > 0 ? (
            <View style={styles.secretRow}>
              <Text style={styles.secretHint}>저장된 키 넣기:</Text>
              {secretNames.map((name) => (
                <Text
                  key={name}
                  accessibilityRole="button"
                  onPress={() => update(index, { value: `${row.value}${secretReference(name)}` })}
                  style={styles.secretChip}
                >
                  {name}
                </Text>
              ))}
            </View>
          ) : null}

          <Pressable accessibilityRole="button" onPress={() => remove(index)} style={styles.remove}>
            <Text style={styles.removeLabel}>헤더 삭제</Text>
          </Pressable>
        </View>
      ))}

      <Pressable accessibilityRole="button" onPress={add} style={styles.add}>
        <Text style={styles.addLabel}>+ 헤더 추가</Text>
      </Pressable>

      {secretNames.length === 0 ? (
        <Text style={styles.hint}>
          API 키 관리 화면에 키를 저장하면 값에 넣을 수 있습니다. 직접 {'{{secret:이름}}'} 을 적어도
          됩니다.
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  label: { fontSize: 13, color: '#555' },
  row: {
    gap: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#d8d8d8',
    borderRadius: 10,
    padding: 10,
  },
  inputs: { gap: 6 },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#b0b0b0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  secretRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 },
  secretHint: { fontSize: 12, color: '#777' },
  secretChip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#208aef',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 12,
    color: '#208aef',
  },
  remove: { alignSelf: 'flex-end' },
  removeLabel: { fontSize: 13, color: '#d9534f' },
  add: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#208aef',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  addLabel: { fontSize: 14, color: '#208aef', fontWeight: '600' },
  hint: { fontSize: 12, color: '#777' },
});
