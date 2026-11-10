import {
    ActionButton,
    Heading,
    Notice,
    Page,
    Panel,
    SectionTitle,
} from "@/components/ui";
import { theme } from "@/constants/theme";
import { useAppData } from "@/context/AppContext";
import { formatLocalDate, localDateKey } from "@/lib/date";
import { calculateDailyTotals, formatNutrient } from "@/lib/energy";
import { router } from "expo-router";
import { ArrowUpRight, Plus } from "lucide-react-native";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

export default function TodayScreen() {
  const { data, addWater } = useAppData();
  const profile = data.profile!;
  const today = localDateKey();
  const savedEntries = data.meals[today];
  const entries = savedEntries ?? [];
  const totals = useMemo(
    () => calculateDailyTotals(savedEntries ?? []),
    [savedEntries],
  );
  const remaining = Math.max(0, profile.calorieGoal - totals.calories);
  const progress = Math.min(
    1,
    totals.calories / Math.max(1, profile.calorieGoal),
  );
  const water = data.water[today] ?? 0;

  return (
    <Page>
      <Heading
        title={`Hola, ${profile.name}`}
        subtitle={formatLocalDate(today)}
        right={<Text style={styles.mark}>NB</Text>}
      />
      <Panel style={styles.caloriePanel}>
        <SectionTitle>Tu balance hoy</SectionTitle>
        <View style={styles.energyRow}>
          <View style={styles.ringWrap}>
            <Svg width={124} height={124} viewBox="0 0 124 124">
              <Circle
                cx="62"
                cy="62"
                r="50"
                fill="none"
                stroke={theme.colors.surfaceMuted}
                strokeWidth="10"
              />
              <Circle
                cx="62"
                cy="62"
                r="50"
                fill="none"
                stroke={theme.colors.mintStrong}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${314 * progress} 314`}
                transform="rotate(-90 62 62)"
              />
            </Svg>
            <View style={styles.ringText}>
              <Text style={styles.ringNumber}>{Math.round(remaining)}</Text>
              <Text style={styles.ringLabel}>restantes</Text>
            </View>
          </View>
          <View style={styles.energyDetails}>
            <EnergyStat
              label="Consumidas"
              value={`${Math.round(totals.calories)} kcal`}
            />
            <EnergyStat
              label="Referencia diaria"
              value={`${profile.calorieGoal} kcal`}
            />
            <Text style={styles.estimateNote}>
              Referencia estimada de mantenimiento
            </Text>
          </View>
        </View>
        <ActionButton
          title="Añadir alimento"
          onPress={() => router.push("/add-food")}
        />
      </Panel>
      <View style={styles.sectionHeader}>
        <SectionTitle>Macronutrientes</SectionTitle>
        <Text
          accessibilityRole="button"
          onPress={() => router.push("/(tabs)/diary")}
          style={styles.link}
        >
          Ver diario <ArrowUpRight size={14} color={theme.colors.mintStrong} />
        </Text>
      </View>
      <View style={styles.macroGrid}>
        <MacroPanel
          label="Proteína"
          value={formatNutrient(totals.protein, " g")}
          color={theme.colors.mintStrong}
        />
        <MacroPanel
          label="Carbohidratos"
          value={formatNutrient(totals.carbohydrates, " g")}
          color={theme.colors.orange}
        />
        <MacroPanel
          label="Grasas"
          value={formatNutrient(totals.fat, " g")}
          color={theme.colors.blue}
        />
      </View>
      <Panel style={styles.waterPanel}>
        <View style={styles.waterHead}>
          <View>
            <Text style={styles.waterTitle}>Hidratación</Text>
            <Text style={styles.waterSub}>
              {profile.waterGoalMl
                ? `Meta personal: ${profile.waterGoalMl.toLocaleString("es-ES")} ml`
                : "Sin meta definida"}
            </Text>
          </View>
          <Text style={styles.waterCount}>
            {water.toLocaleString("es-ES")} ml
          </Text>
        </View>
        {profile.waterGoalMl ? (
          <View style={styles.waterTrack}>
            <View
              style={[
                styles.waterFill,
                {
                  width: `${Math.min(100, (water / profile.waterGoalMl) * 100)}%`,
                },
              ]}
            />
          </View>
        ) : null}
        <View style={styles.waterButtons}>
          <ActionButton
            title="+ 250 ml"
            variant="secondary"
            onPress={() => addWater(250)}
          />
          <ActionButton
            title="+ 500 ml"
            variant="secondary"
            onPress={() => addWater(500)}
          />
        </View>
      </Panel>
      <Panel style={styles.quickPanel}>
        <View style={styles.quickIcon}>
          <Plus color={theme.colors.forest} size={17} />
        </View>
        <View style={styles.quickCopy}>
          <Text style={styles.quickTitle}>Tu día, a tu ritmo</Text>
          <Text style={styles.quickSubtitle}>
            {entries.length
              ? `${entries.length} alimentos registrados hoy`
              : "Registra una comida o una colación cuando quieras."}
          </Text>
        </View>
        <Text
          accessibilityRole="button"
          onPress={() => router.push("/(tabs)/diary")}
          style={styles.link}
        >
          Abrir
        </Text>
      </Panel>
      <Notice>
        Los cálculos son orientativos y no sustituyen la atención profesional.
        No se recomiendan déficits extremos.
      </Notice>
    </Page>
  );
}

function EnergyStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.energyStat}>
      <Text style={styles.energyValue}>{value}</Text>
      <Text style={styles.energyLabel}>{label}</Text>
    </View>
  );
}

function MacroPanel({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <Panel style={styles.macroPanel}>
      <View style={[styles.macroDot, { backgroundColor: color }]} />
      <Text style={styles.macroValue}>{value}</Text>
      <Text style={styles.macroLabel}>{label}</Text>
    </Panel>
  );
}

const styles = StyleSheet.create({
  mark: {
    width: 42,
    height: 42,
    lineHeight: 42,
    overflow: "hidden",
    textAlign: "center",
    borderRadius: 15,
    color: theme.colors.forest,
    backgroundColor: theme.colors.mint,
    fontSize: 13,
    fontWeight: "800",
  },
  caloriePanel: { gap: 17, padding: 20 },
  energyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    gap: 10,
  },
  ringWrap: {
    width: 124,
    height: 124,
    alignItems: "center",
    justifyContent: "center",
  },
  ringText: { position: "absolute", alignItems: "center", gap: 1 },
  ringNumber: { color: theme.colors.forest, fontSize: 27, fontWeight: "700" },
  ringLabel: { color: theme.colors.muted, fontSize: 11 },
  energyDetails: { gap: 12, flex: 1 },
  energyStat: { gap: 3 },
  energyValue: { color: theme.colors.text, fontSize: 16, fontWeight: "700" },
  energyLabel: { color: theme.colors.muted, fontSize: 12 },
  estimateNote: { color: theme.colors.muted, fontSize: 10, lineHeight: 14 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  link: { color: theme.colors.mintStrong, fontSize: 12, fontWeight: "700" },
  macroGrid: { flexDirection: "row", gap: 9 },
  macroPanel: { flex: 1, minWidth: 0, padding: 13, gap: 7 },
  macroDot: { width: 8, height: 8, borderRadius: 4 },
  macroValue: { color: theme.colors.text, fontSize: 17, fontWeight: "700" },
  macroLabel: { color: theme.colors.muted, fontSize: 11 },
  waterPanel: { gap: 14 },
  waterHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  waterTitle: { color: theme.colors.text, fontSize: 16, fontWeight: "700" },
  waterSub: { color: theme.colors.muted, fontSize: 12, marginTop: 3 },
  waterCount: { color: theme.colors.blue, fontWeight: "700" },
  waterTrack: {
    height: 9,
    borderRadius: 8,
    backgroundColor: theme.colors.blueSoft,
    overflow: "hidden",
  },
  waterFill: {
    height: "100%",
    borderRadius: 8,
    backgroundColor: theme.colors.blue,
  },
  waterButtons: { flexDirection: "row", gap: 10 },
  quickPanel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    padding: 14,
  },
  quickIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  quickCopy: { flex: 1, gap: 3 },
  quickTitle: { color: theme.colors.text, fontWeight: "700", fontSize: 13 },
  quickSubtitle: { color: theme.colors.muted, fontSize: 11, lineHeight: 15 },
});
