import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { listWidgetDefinitions } from '@/widgets';
import type { WidgetDefinition } from '@/widgets';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (type: string, config: Record<string, unknown>) => void;
};

export function AddWidgetModal({ visible, onClose, onSubmit }: Props) {
  const [definition, setDefinition] = useState<WidgetDefinition | null>(null);
  const [config, setConfig] = useState<Record<string, unknown>>({});
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    setDefinition(null);
    setConfig({});
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
    <Modal visible={visible} animationType="slide" transparent onRequestClose={close}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.heading}>위젯 추가</Text>

          {definition ? (
            <ScrollView contentContainerStyle={styles.body}>
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
                <Text style={styles.primaryLabel}>추가</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>
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
    maxHeight: '80%',
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
  },
  body: {
    gap: 12,
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
