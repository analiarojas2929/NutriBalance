import {
    ActionButton,
    ChoiceGroup,
    FormField,
    Notice,
    Page,
    Panel,
} from "@/components/ui";
import { theme } from "@/constants/theme";
import { useAppData } from "@/context/AppContext";
import { estimateMaintenanceCalories } from "@/lib/energy";
import { ActivityLevel, SexForEquation, UserProfile } from "@/types";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    View,
} from "react-native";

const activityOptions: { value: ActivityLevel; label: string }[] = [
  { value: "sedentary", label: "Poco activa" },
  { value: "light", label: "Ligera" },
  { value: "moderate", label: "Moderada" },
  { value: "high", label: "Alta" },
  { value: "veryHigh", label: "Muy alta" },
];

export default function OnboardingScreen() {
  const { completeOnboarding } = useAppData();
  const router = useRouter();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [sexForEquation, setSex] = useState<SexForEquation>("female");
  const [activityLevel, setActivity] = useState<ActivityLevel>("sedentary");
  const [error, setError] = useState("");

  const submit = () => {
    const parsedAge = Number(age);
    const parsedHeight = Number(heightCm);
    const parsedWeight = Number(weightKg);
    if (
      !name.trim() ||
      !Number.isInteger(parsedAge) ||
      parsedAge < 18 ||
      parsedAge > 100 ||
      !Number.isFinite(parsedHeight) ||
      parsedHeight < 120 ||
      parsedHeight > 230 ||
      !Number.isFinite(parsedWeight) ||
      parsedWeight < 35 ||
      parsedWeight > 300
    ) {
      setError(
        "Completa todos los campos con valores válidos. Esta versión está pensada para personas adultas.",
      );
      return;
    }
    const draft: UserProfile = {
      name: name.trim(),
      age: parsedAge,
      heightCm: parsedHeight,
      weightKg: parsedWeight,
      sexForEquation,
      activityLevel,
      calorieGoal: 0,
      waterGoalMl: null,
      professionalSupervision: false,
    };
    draft.calorieGoal = estimateMaintenanceCalories(draft);
    completeOnboarding(draft);
    router.replace("/(tabs)");
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Page contentStyle={styles.content}>
        <View style={styles.brand}>
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>N</Text>
          </View>
          <Text style={styles.brandName}>NutriBalance</Text>
        </View>
        <View style={styles.intro}>
          <Text style={styles.eyebrow}>TU BIENESTAR, A TU RITMO</Text>
          <Text style={styles.title}>Empecemos con tu perfil</Text>
          <Text style={styles.subtitle}>
            Con estos datos estimamos una referencia de mantenimiento. No es un
            diagnóstico médico.
          </Text>
        </View>
        <Panel>
          <FormField
            label="Nombre"
            placeholder="Cómo te llamamos"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
          <View style={styles.row}>
            <View style={styles.half}>
              <FormField
                label="Edad"
                placeholder="Años"
                value={age}
                onChangeText={setAge}
                keyboardType="number-pad"
              />
            </View>
            <View style={styles.half}>
              <FormField
                label="Altura"
                placeholder="cm"
                value={heightCm}
                onChangeText={setHeightCm}
                keyboardType="decimal-pad"
              />
            </View>
          </View>
          <FormField
            label="Peso actual"
            placeholder="kg"
            value={weightKg}
            onChangeText={setWeightKg}
            keyboardType="decimal-pad"
          />
          <ChoiceGroup
            label="Sexo utilizado por la ecuación"
            value={sexForEquation}
            onChange={setSex}
            options={[
              { value: "female", label: "Femenino" },
              { value: "male", label: "Masculino" },
            ]}
          />
          <ChoiceGroup
            label="Actividad habitual"
            value={activityLevel}
            onChange={setActivity}
            options={activityOptions}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <ActionButton title="Crear mi perfil" onPress={submit} />
        </Panel>
        <Notice>
          Las ecuaciones de gasto energético son orientativas. No recomendamos
          déficits extremos ni sustituyen la atención de profesionales de salud.
          Si estás embarazada, en lactancia, eres menor de edad o tienes una
          condición médica, consulta con tu equipo de salud.
        </Notice>
        <Text
          accessibilityRole="button"
          onPress={() => router.push("/auth")}
          style={styles.authLink}
        >
          ¿Ya tienes una cuenta? Inicia sesión
        </Text>
      </Page>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingTop: 30, gap: 23 },
  brand: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandMark: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: theme.colors.mint,
    alignItems: "center",
    justifyContent: "center",
  },
  brandMarkText: {
    color: theme.colors.forest,
    fontWeight: "800",
    fontSize: 20,
  },
  brandName: { color: theme.colors.forest, fontSize: 17, fontWeight: "700" },
  intro: { gap: 8 },
  eyebrow: {
    color: theme.colors.mintStrong,
    fontSize: 11,
    letterSpacing: 1.1,
    fontWeight: "800",
  },
  title: { color: theme.colors.forest, fontSize: 30, fontWeight: "700" },
  subtitle: { color: theme.colors.muted, lineHeight: 21, fontSize: 14 },
  row: { flexDirection: "row", gap: 12 },
  half: { flex: 1 },
  error: { color: theme.colors.danger, fontSize: 13 },
  authLink: {
    color: theme.colors.mintStrong,
    fontWeight: "700",
    textAlign: "center",
    padding: 10,
  },
});
