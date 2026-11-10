import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Polyline } from 'react-native-svg';
import { theme } from '@/constants/theme';

export function LineChart({ values, color = theme.colors.mintStrong, unit }: { values: { label: string; value: number }[]; color?: string; unit: string }) {
  if (values.length < 2) return <Text style={styles.empty}>Añade al menos dos registros para ver la tendencia.</Text>;
  const width = 300;
  const height = 148;
  const padding = 18;
  const numbers = values.map((item) => item.value);
  const span = Math.max(...numbers) - Math.min(...numbers) || 1;
  const points = values.map((item, index) => {
    const x = padding + (index / (values.length - 1)) * (width - padding * 2);
    const y = padding + ((Math.max(...numbers) - item.value) / span) * (height - padding * 2);
    return { x, y };
  });
  return (
    <View style={styles.wrap}>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <Polyline points={points.map((point) => `${point.x},${point.y}`).join(' ')} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((point, index) => <Circle key={`${point.x}-${index}`} cx={point.x} cy={point.y} r="4" fill={color} />)}
      </Svg>
      <View style={styles.labels}>
        <Text style={styles.label}>{values[0].label}</Text>
        <Text style={styles.value}>{values[values.length - 1].value.toFixed(1)} {unit}</Text>
        <Text style={styles.label}>{values[values.length - 1].label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 4 },
  labels: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { color: theme.colors.muted, fontSize: 12, textTransform: 'capitalize' },
  value: { color: theme.colors.text, fontSize: 13, fontWeight: '700' },
  empty: { color: theme.colors.muted, lineHeight: 20, fontSize: 14 },
});
