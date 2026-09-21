import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { getWidgetDefinition, listWidgetDefinitions } from '@/widgets';
import type { WidgetDefinition } from '@/widgets';

type Props = {
  visible: boolean;
  /** 수정할 위젯. 없으면 새로 추가하는 화면으로 연다. */
  editing?: { type: string; config: Record<string, unknown> } | null;
  onClose: () => void;
  onSubmit: (type: string, config: Record<string, unknown>) => void;
};

/**
 * 열 때마다 새로 그려지도록 부모에서 `key`를 바꿔 준다.
 * 수정으로 열리면 타입 선택을 건너뛰고 기존 설정으로 시작한다.
 */
export function WidgetFormModal({ visible, editing, onClose, onSubmit }: Props) {
  const [definition, setDefinition] = useState<WidgetDefinition | null>(() =>
    editing ? (getWidgetDefinition(editing.type) ?? null) : null,
  );
  const [config, setConfig] = useState<Record<string, unknown>>(() =>
    editing ? { ...editing.config } : {},
  );
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    setError(null);
    onClose();
  };

  const selectType = (selected: WidgetDefinition) => {
    setDefinition(selected);
    setConfig(selected.defaultConfig);
    setError(null);
  };

  const submit = () => {
    if (!definition) return;

    const parsed = definition.configSchema.safeParse(config);
    if (!parsed.success) {
      setError(parsed.error.issues.map((issue) => issue.message).join('\n'));
      return;
    }

    onSubmit(definition.type, config);
    close();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={close}
    >
      {/* 키보드가 올라오면 입력란과 버튼이 가리지 않도록 시트를 밀어 올린다 */}
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.sheet}>
          <Text style={styles.heading}>{editing ? '위젯 수정' : '위젯 추가'}</Text>

          {definition ? (
            <ScrollView
              contentContainerStyle={styles.scrollBody}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
            >
              <Text style={styles.selectedType}>{definition.label}</Text>
              <definition.ConfigEditor value={config} onChange={setConfig} />
              {error ? <Text style={styles.error}>{error}</Text> : null}
            </ScrollView>
          ) : (
            <View style={styles.body}>
              {listWidgetDefinitions().map((item) => (
                <Pressable
                  key={item.type}
                  style={styles.typeButton}
                  onPress={() => selectType(item)}
                >
                  <Text style={styles.typeLabel}>{item.label}</Text>
                </Pressable>
              ))}
            </View>
          )}

          <View style={styles.actions}>
            <Pressable style={[styles.action, styles.secondary]} onPress={close}>
              <Text style={styles.secondaryLabel}>취소</Text>
            </Pressable>
            {definition ? (
              <Pressable style={[styles.action, styles.primary]} onPress={submit}>
                <Text style={styles.primaryLabel}>{editing ? '저장' : '추가'}</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    gap: 16,
    maxHeight: '90%',
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
  },
  body: {
    gap: 12,
  },
  scrollBody: {
    gap: 12,
    paddingBottom: 96,
  },
  selectedType: {
    fontSize: 14,
    color: '#555',
  },
  typeButton: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#b0b0b0',
    borderRadius: 10,
    padding: 14,
  },
  typeLabel: {
    fontSize: 16,
  },
  error: {
    color: '#a32f2b',
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  action: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
  },
  primary: {
    backgroundColor: '#208aef',
  },
  primaryLabel: {
    color: '#fff',
    fontWeight: '600',
  },
  secondary: {
    backgroundColor: '#eee',
  },
  secondaryLabel: {
    color: '#333',
  },
});
