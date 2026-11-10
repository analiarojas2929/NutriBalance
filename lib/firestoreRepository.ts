import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import type { AppData } from '@/types';

function requireFirestore() {
  if (!firestore) throw new Error('Firebase aún no está configurado.');
  return firestore;
}

export async function syncProfile(uid: string, profile: NonNullable<AppData['profile']>) {
  await setDoc(doc(requireFirestore(), 'users', uid), { profile, updatedAt: serverTimestamp() }, { merge: true });
}

export async function syncDay(uid: string, date: string, data: Pick<AppData, 'meals' | 'water' | 'weights'>) {
  await setDoc(doc(requireFirestore(), 'users', uid, 'days', date), {
    meals: data.meals[date] ?? [],
    waterMl: data.water[date] ?? 0,
    weights: data.weights.filter((entry) => entry.date === date),
    updatedAt: serverTimestamp(),
  }, { merge: true });
}
