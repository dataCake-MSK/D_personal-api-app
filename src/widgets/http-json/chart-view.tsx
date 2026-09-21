import { LineChart } from 'react-native-gifted-charts';
import { StyleSheet, Text, View } from 'react-native';

import type { ChartPoint } from './timeseries';
import { thinLabels } from './timeseries';

export function TimeSeriesView({ points }: { points: ChartPoint[] }) {
  if (points.length === 0) {
    return <Text style={styles.empty}>그릴 수 있는 숫자 데이터가 없습니다.</Text>;
  }

  const data = thinLabels(points);
  const values = points.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);

  return (
    <View style={styles.container}>
      <LineChart
        data={data}
        areaChart
        curved
        hideDataPoints={data.length > 24}
        thickness={2}
        color="#208aef"
        startFillColor="#208aef"
        startOpacity={0.25}
        endOpacity={0.02}
        initialSpacing={8}
        yAxisTextStyle={styles.axisText}
        xAxisLabelTextStyle={styles.axisText}
        rulesColor="#e6e6e6"
        yAxisColor="#d0d0d0"
        xAxisColor="#d0d0d0"
        adjustToWidth
      />
      <Text style={styles.summary}>
        {points.length}개 · 최소 {format(min)} · 최대 {format(max)}
      </Text>
    </View>
  );
}

function format(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

const styles = StyleSheet.create({
  container: { gap: 4 },
  empty: { fontSize: 14, color: '#666' },
  axisText: { fontSize: 10, color: '#888' },
  summary: { fontSize: 12, color: '#777' },
});
