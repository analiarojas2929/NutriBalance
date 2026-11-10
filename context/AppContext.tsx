import { createContext, use, useEffect, useState, type PropsWithChildren } from 'react';
import { localDateKey } from '@/lib/date';
import { emptyAppData, loadAppData, saveAppData } from '@/lib/storage';
import type { AppData, FoodItem, MealType, UserProfile, WeightEntry } from '@/types';

type AppContextValue = {
  data: AppData;
  isReady: boolean;
  completeOnboarding: (profile: UserProfile) => void;
  updateProfile: (changes: Partial<UserProfile>) => void;
  addMeal: (food: FoodItem, amountGrams: number, mealType: MealType) => void;
  removeMeal: (id: string) => void;
  addWater: (amountMl: number) => void;
  addWeight: (weightKg: number) => void;
  resetLocalData: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: PropsWithChildren) {
  const [data, setData] = useState<AppData>(emptyAppData);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    loadAppData().then(setData).catch(() => setData(emptyAppData)).finally(() => setIsReady(true));
  }, []);

  useEffect(() => {
    if (isReady) void saveAppData(data);
  }, [data, isReady]);

  const completeOnboarding = (profile: UserProfile) => setData((current) => ({ ...current, profile }));
  const updateProfile = (changes: Partial<UserProfile>) => setData((current) => ({
    ...current,
    profile: current.profile ? { ...current.profile, ...changes } : null,
  }));
  const addMeal = (food: FoodItem, amountGrams: number, mealType: MealType) => setData((current) => {
    const date = localDateKey();
    const entry = { id: `${Date.now()}-${food.fdcId}`, date, mealType, food, amountGrams, createdAt: new Date().toISOString() };
    return { ...current, meals: { ...current.meals, [date]: [...(current.meals[date] ?? []), entry] } };
  });
  const removeMeal = (id: string) => setData((current) => {
    const date = localDateKey();
    return { ...current, meals: { ...current.meals, [date]: (current.meals[date] ?? []).filter((entry) => entry.id !== id) } };
  });
  const addWater = (amountMl: number) => setData((current) => {
    const date = localDateKey();
    return { ...current, water: { ...current.water, [date]: Math.max(0, (current.water[date] ?? 0) + amountMl) } };
  });
  const addWeight = (weightKg: number) => setData((current) => {
    const date = localDateKey();
    const entry: WeightEntry = { id: `${Date.now()}`, date, weightKg };
    return { ...current, weights: [...current.weights.filter((item) => item.date !== date), entry].sort((a, b) => a.date.localeCompare(b.date)) };
  });
  const resetLocalData = () => setData(emptyAppData);

  return <AppContext value={{ data, isReady, completeOnboarding, updateProfile, addMeal, removeMeal, addWater, addWeight, resetLocalData }}>{children}</AppContext>;
}

export function useAppData() {
  const value = use(AppContext);
  if (!value) throw new Error('useAppData debe utilizarse dentro de AppProvider.');
  return value;
}
