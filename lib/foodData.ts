import type { FoodItem } from '@/types';

const BASE_URL = 'https://api.nal.usda.gov/fdc/v1';
const PROXY_URL = process.env.EXPO_PUBLIC_FDC_PROXY_URL?.replace(/\/$/, '');

type FdcNutrient = { nutrientId?: number; nutrientNumber?: string; amount?: number; value?: number };
type FdcFood = {
  fdcId: number;
  description: string;
  dataType?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  foodNutrients?: FdcNutrient[];
};

function nutrientAmount(food: FdcFood, id: number, nutrientNumber: string): number | null {
  const nutrient = food.foodNutrients?.find((item) => item.nutrientId === id || item.nutrientNumber === nutrientNumber);
  const value = nutrient?.value ?? nutrient?.amount;
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function mapFood(food: FdcFood): FoodItem {
  return {
    fdcId: food.fdcId,
    name: food.description,
    dataType: food.dataType ?? 'FoodData Central',
    servingSize: typeof food.servingSize === 'number' ? food.servingSize : null,
    servingSizeUnit: food.servingSizeUnit ?? null,
    calories: nutrientAmount(food, 1008, '208'),
    protein: nutrientAmount(food, 1003, '203'),
    carbohydrates: nutrientAmount(food, 1005, '205'),
    fat: nutrientAmount(food, 1004, '204'),
  };
}

export async function searchFoods(query: string, signal?: AbortSignal): Promise<FoodItem[]> {
  const normalizedQuery = query.trim();
  if (normalizedQuery.length < 2) return [];
  const endpoint = PROXY_URL ? `${PROXY_URL}/foods/search` : `${BASE_URL}/foods/search?api_key=DEMO_KEY`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: normalizedQuery, pageSize: 20 }),
    signal,
  });
  if (!response.ok) {
    if (response.status === 429) {
      throw new Error(PROXY_URL
        ? 'Se alcanzó el límite de FoodData Central. Espera un poco y vuelve a intentar.'
        : 'Se agotó la cuota de DEMO_KEY de USDA. Configura el proxy privado descrito en README.md.');
    }
    if (response.status === 403) throw new Error('La clave de FoodData Central no es válida. Revisa la configuración.');
    throw new Error('No se pudo consultar FoodData Central. Comprueba tu conexión.');
  }
  const payload = await response.json() as { foods?: FdcFood[] };
  return (payload.foods ?? []).map(mapFood).filter((food) => food.calories !== null);
}
