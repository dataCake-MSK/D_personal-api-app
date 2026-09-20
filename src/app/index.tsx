import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AddWidgetModal } from '@/features/dashboard/add-widget-modal';
import { useDashboardStore } from '@/features/dashboard/store';
import { WidgetRow } from '@/features/dashboard/widget-row';

export default function DashboardScreen() {
  const widgets = useDashboardStore((state) => state.widgets);
  const addWidget = useDashboardStore((state) => state.addWidget);
  const removeWidget = useDashboardStore((state) => state.removeWidget);
  const moveWidget = useDashboardStore((state) => state.moveWidget);
  const [adding, setAdding] = useState(false);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.list}>
        <View style={styles.header}>
          <Text style={styles.title}>내 대시보드</Text>
          <Link href="/secrets" style={styles.secretsLink}>
            API 키 관리
          </Link>
        </View>

        {widgets.length === 0 ? (
          <Text style={styles.empty}>아직 위젯이 없습니다.</Text>
        ) : (
          widgets.map((widget, index) => (
            <WidgetRow
              key={widget.id}
              widget={widget}
              index={index}
              total={widgets.length}
              onMoveUp={() => moveWidget(widget.id, 'up')}
              onMoveDown={() => moveWidget(widget.id, 'down')}
              onRemove={() => removeWidget(widget.id)}
            />
          ))
        )}

        <Pressable
          accessibilityRole="button"
          style={styles.addButton}
          onPress={() => setAdding(true)}
        >
          <Text style={styles.addLabel}>+ 위젯 추가</Text>
        </Pressable>
      </ScrollView>

      <AddWidgetModal
        visible={adding}
        onClose={() => setAdding(false)}
        onSubmit={(type, config) => addWidget(type, config)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
  secretsLink: {
    fontSize: 14,
    color: '#208aef',
  },
  empty: {
    fontSize: 16,
    color: '#666',
  },
  addButton: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#208aef',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addLabel: {
    color: '#208aef',
    fontSize: 16,
    fontWeight: '600',
  },
});
