import { ScrollView, StyleSheet, Text, View } from 'react-native';

const MAX_ROWS = 20;

export function TextValueView({ value }: { value: unknown }) {
  return <Text style={styles.value}>{formatValue(value)}</Text>;
}

export function TableValueView({ value }: { value: unknown }) {
  const rows = toRows(value);

  if (rows.length === 0) {
    return <Text style={styles.empty}>표시할 데이터가 없습니다.</Text>;
  }

  const columns = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  const shown = rows.slice(0, MAX_ROWS);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View>
        <View style={[styles.row, styles.headerRow]}>
          {columns.map((column) => (
            <Text key={column} style={[styles.cell, styles.headerCell]} numberOfLines={1}>
              {column}
            </Text>
          ))}
        </View>

        {shown.map((row, index) => (
          <View key={index} style={styles.row}>
            {columns.map((column) => (
              <Text key={column} style={styles.cell} numberOfLines={1}>
                {formatValue(row[column])}
              </Text>
            ))}
          </View>
        ))}

        {rows.length > shown.length ? (
          <Text style={styles.more}>… 외 {rows.length - shown.length}행</Text>
        ) : null}
      </View>
    </ScrollView>
  );
}

/** 표로 그릴 수 있는 형태(객체 배열)로 바꾼다. 원시값 배열은 value 열 하나로 만든다. */
export function toRows(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) {
    return value && typeof value === 'object' ? [value as Record<string, unknown>] : [];
  }

  return value.map((item) =>
    item && typeof item === 'object' && !Array.isArray(item)
      ? (item as Record<string, unknown>)
      : { value: item },
  );
}

export function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return JSON.stringify(value);
}

const styles = StyleSheet.create({
  value: { fontSize: 18 },
  empty: { fontSize: 14, color: '#666' },
  row: { flexDirection: 'row' },
  headerRow: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#c0c0c0' },
  cell: { minWidth: 90, maxWidth: 160, paddingVertical: 4, paddingRight: 12, fontSize: 13 },
  headerCell: { fontWeight: '600', color: '#555' },
  more: { fontSize: 12, color: '#888', paddingTop: 4 },
});
