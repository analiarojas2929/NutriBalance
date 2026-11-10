import { createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

function requireAuth() {
  if (!auth) throw new Error('Firebase aún no está configurado. Puedes continuar usando NutriBalance en modo local.');
  return auth;
}

export async function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(requireAuth(), email.trim(), password);
}

export async function register(email: string, password: string) {
  return createUserWithEmailAndPassword(requireAuth(), email.trim(), password);
}

export async function sendPasswordReset(email: string) {
  return sendPasswordResetEmail(requireAuth(), email.trim());
}

export async function signOutUser() {
  return signOut(requireAuth());
}
