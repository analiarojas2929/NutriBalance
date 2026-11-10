import { LineChart } from "@/components/charts";
import { Heading, Notice, Page, Panel, SectionTitle } from "@/components/ui";
import { theme } from "@/constants/theme";
import { useAppData } from "@/context/AppContext";
import { calculateDailyTotals } from "@/lib/energy";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function ProgressScreen() {
  const { data } = useAppData();
  const weights = data.weights.slice(-8).map((entry) => ({
    value: entry.weightKg,
    label: new Date(`${entry.date}T12:00:00`).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    }),
  }));
  const calorieDays = useMemo(
    () =>
      Object.entries(data.meals)
        .filter(([, entries]) => entries.length > 0)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-7)
        .map(([date, entries]) => ({
          label: new Date(`${date}T12:00:00`).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "short",
          }),
          value: Math.round(calculateDailyTotals(entries).calories),
        })),
    [data.meals],
  );
  const latestWeight = data.weights.at(-1);
  const weightChange =
    data.weights.length > 1
      ? data.weights.at(-1)!.weightKg - data.weights.at(-2)!.weightKg
      : null;

  return (
    <Page>
      <Heading
        title="Tu progreso"
        subtitle="Observa tendencias con calma, no un solo día."
      />
      <Panel>
        <SectionTitle>Seguimiento de peso</SectionTitle>
        {latestWeight ? (
          <View style={styles.stat}>
            <Text style={styles.statValue}>
              {latestWeight.weightKg.toFixed(1)} kg
            </Text>
            <Text style={styles.statCaption}>
              {weightChange === null
                ? "Último registro"
                : `${weightChange > 0 ? "+" : ""}${weightChange.toFixed(1)} kg desde el registro anterior`}
            </Text>
          </View>
        ) : null}
        <LineChart values={weights} unit="kg" />
      </Panel>
      <Panel>
        <SectionTitle>Energía registrada</SectionTitle>
        <Text style={styles.caption}>
          Calorías anotadas por día, hasta los últimos 7 días con registros.
        </Text>
        <LineChart
          values={calorieDays}
          unit="kcal"
          color={theme.colors.orange}
        />
      </Panel>
      <Notice>
        El peso puede fluctuar por muchos factores. Estas gráficas describen
        registros personales y no diagnostican ni predicen resultados de salud.
      </Notice>
    </Page>
  );
}

const styles = StyleSheet.create({
  stat: { gap: 3 },
  statValue: { color: theme.colors.forest, fontSize: 28, fontWeight: "700" },
  statCaption: { color: theme.colors.muted, fontSize: 12 },
  caption: { color: theme.colors.muted, fontSize: 13, lineHeight: 19 },
});
