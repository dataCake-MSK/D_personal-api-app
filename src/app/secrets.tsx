import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { InvalidSecretNameError } from '@/features/secrets/secret-store';
import { useSecretsStore } from '@/features/secrets/secrets-store';

export default function SecretsScreen() {
  const names = useSecretsStore((state) => state.names);
  const refresh = useSecretsStore((state) => state.refresh);
  const saveSecret = useSecretsStore((state) => state.save);
  const removeSecret = useSecretsStore((state) => state.remove);
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const save = async () => {
    if (!name.trim() || !value) {
      setMessage('이름과 값을 모두 입력하세요.');
      return;
    }

    try {
      await saveSecret(name.trim(), value);
    } catch (error) {
      setMessage(error instanceof InvalidSecretNameError ? error.message : '저장하지 못했습니다.');
      return;
    }

    // 저장 후 입력란의 값은 즉시 지운다(화면에 남기지 않음).
    setValue('');
    setName('');
    setMessage(`저장했습니다: ${name.trim()}`);
  };

  const remove = async (target: string) => {
    await removeSecret(target);
    setMessage(`삭제했습니다: ${target}`);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>API 키 관리</Text>
          <Link href="/" style={styles.backLink}>
            ← 대시보드
          </Link>
        </View>
        <Text style={styles.description}>
          저장한 값은 기기 보안 저장소에만 있고 다시 볼 수 없습니다. 위젯 설정에서{' '}
          <Text style={styles.code}>{'{{secret:이름}}'}</Text> 으로 사용하세요.
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>이름</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            autoCapitalize="none"
            placeholder="예: WEATHER_API_KEY"
          />

          <Text style={styles.label}>값</Text>
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={setValue}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
            placeholder="여기에 붙여넣기"
          />

          <Pressable accessibilityRole="button" style={styles.saveButton} onPress={save}>
            <Text style={styles.saveLabel}>저장</Text>
          </Pressable>
          {message ? <Text style={styles.message}>{message}</Text> : null}
        </View>

        <Text style={styles.sectionTitle}>저장된 키</Text>
        {names.length === 0 ? (
          <Text style={styles.empty}>저장된 키가 없습니다.</Text>
        ) : (
          names.map((stored) => (
            <View key={stored} style={styles.row}>
              <View style={styles.rowText}>
                <Text style={styles.rowName}>{stored}</Text>
                <Text style={styles.rowValue}>••••••••</Text>
              </View>
              <Pressable accessibilityRole="button" onPress={() => remove(stored)}>
                <Text style={styles.removeLabel}>삭제</Text>
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 22, fontWeight: '600' },
  backLink: { fontSize: 14, color: '#208aef' },
  description: { fontSize: 13, color: '#555', lineHeight: 19 },
  code: { fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }), fontSize: 12 },
  form: { gap: 6, marginTop: 8 },
  label: { fontSize: 13, color: '#555' },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#b0b0b0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#208aef',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  saveLabel: { color: '#fff', fontWeight: '600', fontSize: 16 },
  message: { fontSize: 13, color: '#2a6b2f' },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginTop: 16 },
  empty: { fontSize: 14, color: '#666' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#d0d0d0',
    borderRadius: 10,
    padding: 12,
  },
  rowText: { gap: 2 },
  rowName: { fontSize: 15 },
  rowValue: { fontSize: 13, color: '#888', letterSpacing: 2 },
  removeLabel: { color: '#d9534f', fontSize: 14 },
});
