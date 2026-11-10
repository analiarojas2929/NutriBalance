import type { ActivityLevel, SexForEquation, UserProfile } from "@/types";

const activityFactors: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  high: 1.725,
  veryHigh: 1.9,
};

export function estimateMaintenanceCalories(
  profile: Pick<
    UserProfile,
    "age" | "heightCm" | "weightKg" | "sexForEquation" | "activityLevel"
  >,
): number {
  const sexAdjustment = profile.sexForEquation === "male" ? 5 : -161;
  const restingEnergy =
    10 * profile.weightKg +
    6.25 * profile.heightCm -
    5 * profile.age +
    sexAdjustment;
  return Math.round(restingEnergy * activityFactors[profile.activityLevel]);
}

export function isBelowMaintenance(
  goal: number,
  profile: Parameters<typeof estimateMaintenanceCalories>[0],
): boolean {
  return goal < estimateMaintenanceCalories(profile);
}

export function formatNutrient(value: number | null, suffix = ""): string {
  return value === null ? "—" : `${Math.round(value)}${suffix}`;
}

export function calculateDailyTotals(
  entries: Array<{
    food: {
      calories: number | null;
      protein: number | null;
      carbohydrates: number | null;
      fat: number | null;
    };
    amountGrams: number;
  }>,
) {
  const totals = entries.reduce(
    (result, entry) => {
      const scale = entry.amountGrams / 100;
      return {
        calories: result.calories + (entry.food.calories ?? 0) * scale,
        protein: result.protein + (entry.food.protein ?? 0) * scale,
        carbohydrates:
          result.carbohydrates + (entry.food.carbohydrates ?? 0) * scale,
        fat: result.fat + (entry.food.fat ?? 0) * scale,
      };
    },
    { calories: 0, protein: 0, carbohydrates: 0, fat: 0 },
  );
  return {
    calories: totals.calories,
    protein:
      entries.length > 0 &&
      entries.every((entry) => entry.food.protein !== null)
        ? totals.protein
        : null,
    carbohydrates:
      entries.length > 0 &&
      entries.every((entry) => entry.food.carbohydrates !== null)
        ? totals.carbohydrates
        : null,
    fat:
      entries.length > 0 && entries.every((entry) => entry.food.fat !== null)
        ? totals.fat
        : null,
  };
}

export function isSupportedEquationSex(
  value: SexForEquation,
): value is SexForEquation {
  return value === "female" || value === "male";
}
