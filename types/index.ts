export type SexForEquation = 'female' | 'male';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'high' | 'veryHigh';
export type MealType = 'Desayuno' | 'Comida' | 'Cena' | 'Tentempié';

export interface UserProfile {
  name: string;
  age: number;
  heightCm: number;
  weightKg: number;
  sexForEquation: SexForEquation;
  activityLevel: ActivityLevel;
  calorieGoal: number;
  waterGoalMl: number | null;
  professionalSupervision: boolean;
}

export interface Nutrients {
  calories: number | null;
  protein: number | null;
  carbohydrates: number | null;
  fat: number | null;
}

export interface FoodItem extends Nutrients {
  fdcId: number;
  name: string;
  dataType: string;
  servingSize: number | null;
  servingSizeUnit: string | null;
}

export interface MealEntry {
  id: string;
  date: string;
  mealType: MealType;
  food: FoodItem;
  amountGrams: number;
  createdAt: string;
}

export interface WeightEntry {
  id: string;
  date: string;
  weightKg: number;
}

export interface AppData {
  profile: UserProfile | null;
  meals: Record<string, MealEntry[]>;
  water: Record<string, number>;
  weights: WeightEntry[];
}
