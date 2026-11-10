import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Plus, Trash2 } from 'lucide-react-native';
import { ActionButton, Heading, Notice, Page, Panel, SectionTitle } from '@/components/ui';
import { useAppData } from '@/context/AppContext';
import { localDateKey } from '@/lib/date';
import { calculateDailyTotals, formatNutrient } from '@/lib/energy';
import { theme } from '@/constants/theme';
import type { MealType } from '@/types';

const mealTypes: MealType[] = ['Desayuno', 'Comida', 'Cena', 'Tentempié'];

export default function DiaryScreen() {
  const { data, removeMeal, addWater } = useAppData();
  const date = localDateKey();
  const savedEntries = data.meals[date];
  const entries = savedEntries ?? [];
  const totals = useMemo(() => calculateDailyTotals(savedEntries ?? []), [savedEntries]);
  const water = data.water[date] ?? 0;
  const waterGoal = data.profile?.waterGoalMl;

  return (
    <Page>
      <Heading title="Tu diario" subtitle="Un registro flexible, a tu manera." />
      <Panel style={styles.summary}>
        <Text style={styles.kcal}>{Math.round(totals.calories)} <Text style={styles.kcalUnit}>kcal</Text></Text>
        <Text style={styles.summaryCaption}>Energía registrada hoy</Text>
        <View style={styles.macroRow}>
          <Macro label="Proteína" value={totals.protein} />
          <Macro label="Carbohidratos" value={totals.carbohydrates} />
          <Macro label="Grasas" value={totals.fat} />
        </View>
      </Panel>
      <View style={styles.waterHeader}><SectionTitle>Agua</SectionTitle><Text style={styles.waterAmount}>{water.toLocaleString('es-ES')} ml{waterGoal ? ` / ${waterGoal.toLocaleString('es-ES')} ml` : ''}</Text></View>
      <Panel style={styles.waterPanel}>
        {waterGoal ? <View style={styles.waterTrack}><View style={[styles.waterFill, { width: `${Math.min(100, (water / waterGoal) * 100)}%` }]} /></View> : null}
        <View style={styles.waterActions}>
          <ActionButton title="+ 250 ml" variant="secondary" onPress={() => addWater(250)} />
          <ActionButton title="+ 500 ml" variant="secondary" onPress={() => addWater(500)} />
        </View>
      </Panel>
      {mealTypes.map((mealType) => {
        const mealEntries = entries.filter((entry) => entry.mealType === mealType);
        return (
          <View key={mealType} style={styles.mealSection}>
            <SectionTitle trailing={<Text style={styles.mealCalories}>{Math.round(calculateDailyTotals(mealEntries).calories)} kcal</Text>}>{mealType}</SectionTitle>
            {mealEntries.length === 0 ? (
              <Text style={styles.emptyMeal}>Todavía no hay alimentos registrados.</Text>
            ) : mealEntries.map((entry) => (
              <Panel key={entry.id} style={styles.foodRow}>
                <View style={styles.foodDetails}>
                  <Text style={styles.foodName}>{entry.food.name}</Text>
                  <Text style={styles.foodMeta}>{entry.amountGrams} g · {formatNutrient(entry.food.calories === null ? null : entry.food.calories * entry.amountGrams / 100, ' kcal')}</Text>
                  <Text style={styles.source}>Fuente: USDA FoodData Central</Text>
                </View>
                <Pressable accessibilityRole="button" accessibilityLabel={`Eliminar ${entry.food.name}`} onPress={() => removeMeal(entry.id)} hitSlop={10}>
                  <Trash2 color={theme.colors.muted} size={19} />
                </Pressable>
              </Panel>
            ))}
          </View>
        );
      })}
      <ActionButton title="Registrar alimento" icon={<Plus color="#fff" size={18} />} onPress={() => router.push('/add-food')} />
      <Notice>Los alimentos y nutrientes provienen de USDA FoodData Central. Las cantidades registradas son estimaciones, no una indicación médica.</Notice>
    </Page>
  );
}

function Macro({ label, value }: { label: string; value: number | null }) {
  return <View style={styles.macro}><Text style={styles.macroValue}>{formatNutrient(value, ' g')}</Text><Text style={styles.macroLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  summary: { backgroundColor: theme.colors.forest, borderColor: theme.colors.forest, padding: 22 },
  kcal: { color: '#FFFFFF', fontSize: 36, lineHeight: 42, fontWeight: '700' },
  kcalUnit: { fontSize: 16, fontWeight: '500' },
  summaryCaption: { color: '#D5E6DC', fontSize: 13 },
  macroRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#547364' },
  macro: { gap: 4 },
  macroValue: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  macroLabel: { color: '#D5E6DC', fontSize: 11 },
  waterHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  waterAmount: { color: theme.colors.muted, fontSize: 12, fontWeight: '600' },
  waterPanel: { gap: 12 },
  waterTrack: { height: 9, backgroundColor: theme.colors.surfaceMuted, borderRadius: 8, overflow: 'hidden' },
  waterFill: { height: '100%', backgroundColor: theme.colors.blue, borderRadius: 8 },
  waterActions: { flexDirection: 'row', gap: 10 },
  mealSection: { gap: 11 },
  mealCalories: { color: theme.colors.muted, fontSize: 12 },
  emptyMeal: { color: theme.colors.muted, fontSize: 13, paddingVertical: 2 },
  foodRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: 14 },
  foodDetails: { flex: 1, gap: 3 },
  foodName: { color: theme.colors.text, fontSize: 14, fontWeight: '700' },
  foodMeta: { color: theme.colors.muted, fontSize: 12 },
  source: { color: theme.colors.mintStrong, fontSize: 11 },
});
