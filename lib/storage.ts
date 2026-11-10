import type { AppData } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@nutribalance/data-v1";

export const emptyAppData: AppData = {
  profile: null,
  meals: {},
  water: {},
  weights: [],
};

export async function loadAppData(): Promise<AppData> {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  if (!stored) return emptyAppData;
  try {
    return { ...emptyAppData, ...JSON.parse(stored) } as AppData;
  } catch {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return emptyAppData;
  }
}

export async function saveAppData(data: AppData): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
