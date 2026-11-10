import {
    ActionButton,
    ChoiceGroup,
    FormField,
    Heading,
    Notice,
    Page,
    Panel,
} from "@/components/ui";
import { theme } from "@/constants/theme";
import { useAppData } from "@/context/AppContext";
import { formatNutrient } from "@/lib/energy";
import { searchFoods } from "@/lib/foodData";
import type { FoodItem, MealType } from "@/types";
import { router } from "expo-router";
import { ArrowLeft, Search } from "lucide-react-native";
import { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

const mealOptions: { value: MealType; label: string }[] = [
  { value: "Desayuno", label: "Desayuno" },
  { value: "Comida", label: "Comida" },
  { value: "Cena", label: "Cena" },
  { value: "Tentempié", label: "Tentempié" },
];

export default function AddFoodScreen() {
  const { addMeal } = useAppData();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodItem[]>([]);
  const [selected, setSelected] = useState<FoodItem | null>(null);
  const [amount, setAmount] = useState("100");
  const [mealType, setMealType] = useState<MealType>("Desayuno");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const search = async () => {
    if (query.trim().length < 2) {
      setError("Escribe al menos dos caracteres para buscar.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      setResults(await searchFoods(query));
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "No se pudo completar la búsqueda.",
      );
    } finally {
      setLoading(false);
    }
  };

  const save = () => {
    const grams = Number(amount.replace(",", "."));
    if (!selected || !Number.isFinite(grams) || grams <= 0 || grams > 3000) {
      setError("Indica una cantidad válida entre 1 y 3000 gramos.");
      return;
    }
    addMeal(selected, Math.round(grams * 10) / 10, mealType);
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Page contentStyle={styles.content}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver"
          onPress={() => router.back()}
          style={styles.back}
        >
          <ArrowLeft color={theme.colors.forest} size={21} />
          <Text style={styles.backText}>Volver</Text>
        </Pressable>
        <Heading
          title="Añadir alimento"
          subtitle="Busca productos y alimentos de la base USDA."
        />
        <View style={styles.searchRow}>
          <View style={styles.query}>
            <FormField
              label="Nombre del alimento"
              placeholder="Ej. avena, manzana..."
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={search}
              returnKeyType="search"
            />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Buscar en USDA"
            disabled={loading}
            onPress={search}
            style={styles.searchButton}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Search color="#fff" size={19} />
            )}
          </Pressable>
        </View>
        {loading ? (
          <Text style={styles.status}>Buscando en FoodData Central...</Text>
        ) : null}
        {error ? (
          <Text accessibilityRole="alert" style={styles.error}>
            {error}
          </Text>
        ) : null}
        {results.length > 0 ? (
          <Text style={styles.resultHeading}>
            {results.length} resultados de USDA
          </Text>
        ) : null}
        {results.map((food) => (
          <Pressable
            key={food.fdcId}
            accessibilityRole="button"
            onPress={() => {
              setSelected(food);
              setError("");
            }}
          >
            <Panel
              style={[
                styles.result,
                selected?.fdcId === food.fdcId && styles.resultSelected,
              ]}
            >
              <View style={styles.resultInfo}>
                <Text style={styles.foodName}>{food.name}</Text>
                <Text style={styles.foodMeta}>
                  {food.dataType} · {formatNutrient(food.calories, " kcal")} /
                  100 g
                </Text>
              </View>
              <Text style={styles.pick}>
                {selected?.fdcId === food.fdcId ? "Elegido" : "Elegir"}
              </Text>
            </Panel>
          </Pressable>
        ))}
        {selected ? (
          <Panel>
            <Text style={styles.selectedName}>{selected.name}</Text>
            <FormField
              label="Cantidad (gramos)"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />
            <ChoiceGroup
              label="Tipo de comida"
              value={mealType}
              onChange={setMealType}
              options={mealOptions}
            />
            <View style={styles.nutrientRow}>
              <Nutrient
                label="Energía"
                value={
                  selected.calories === null
                    ? null
                    : (selected.calories *
                        Number(amount.replace(",", ".") || 0)) /
                      100
                }
                unit=" kcal"
              />
              <Nutrient
                label="Proteína"
                value={
                  selected.protein === null
                    ? null
                    : (selected.protein *
                        Number(amount.replace(",", ".") || 0)) /
                      100
                }
                unit=" g"
              />
              <Nutrient
                label="Carbohidratos"
                value={
                  selected.carbohydrates === null
                    ? null
                    : (selected.carbohydrates *
                        Number(amount.replace(",", ".") || 0)) /
                      100
                }
                unit=" g"
              />
              <Nutrient
                label="Grasas"
                value={
                  selected.fat === null
                    ? null
                    : (selected.fat * Number(amount.replace(",", ".") || 0)) /
                      100
                }
                unit=" g"
              />
            </View>
            <ActionButton title="Registrar alimento" onPress={save} />
          </Panel>
        ) : null}
        {!loading &&
        query.trim().length >= 2 &&
        results.length === 0 &&
        !error ? (
          <Text style={styles.status}>
            No se encontraron resultados con valores calóricos. Prueba otro
            término.
          </Text>
        ) : null}
        <Notice>
          Fuente: U.S. Department of Agriculture, Agricultural Research Service,
          FoodData Central. Los nutrientes mostrados son los publicados por USDA
          y se prorratean según los gramos anotados.
        </Notice>
      </Page>
    </KeyboardAvoidingView>
  );
}

function Nutrient({
  label,
  value,
  unit,
}: {
  label: string;
  value: number | null;
  unit: string;
}) {
  return (
    <View style={styles.nutrient}>
      <Text style={styles.nutrientValue}>{formatNutrient(value, unit)}</Text>
      <Text style={styles.nutrientLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingTop: 16 },
  back: { flexDirection: "row", alignItems: "center", gap: 7, minHeight: 34 },
  backText: { color: theme.colors.forest, fontWeight: "600" },
  searchRow: { flexDirection: "row", alignItems: "flex-end", gap: 9 },
  query: { flex: 1 },
  searchButton: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.forest,
    marginBottom: 1,
  },
  status: { color: theme.colors.muted, fontSize: 13, lineHeight: 19 },
  error: { color: theme.colors.danger, fontSize: 13, lineHeight: 18 },
  resultHeading: { color: theme.colors.muted, fontSize: 12, fontWeight: "600" },
  result: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    gap: 10,
  },
  resultSelected: {
    borderColor: theme.colors.mintStrong,
    backgroundColor: theme.colors.surfaceMuted,
  },
  resultInfo: { flex: 1, gap: 4 },
  foodName: { color: theme.colors.text, fontSize: 14, fontWeight: "700" },
  foodMeta: { color: theme.colors.muted, fontSize: 11 },
  pick: { color: theme.colors.mintStrong, fontSize: 12, fontWeight: "700" },
  selectedName: {
    color: theme.colors.forest,
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 22,
  },
  nutrientRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  nutrient: {
    width: "47%",
    backgroundColor: theme.colors.background,
    padding: 11,
    borderRadius: 12,
    gap: 3,
  },
  nutrientValue: {
    color: theme.colors.forest,
    fontWeight: "700",
    fontSize: 14,
  },
  nutrientLabel: { color: theme.colors.muted, fontSize: 11 },
});
