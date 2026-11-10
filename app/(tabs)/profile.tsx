import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { ChevronRight, LogIn, ShieldCheck } from 'lucide-react-native';
import { ActionButton, FormField, Heading, Notice, Page, Panel, SectionTitle } from '@/components/ui';
import { useAppData } from '@/context/AppContext';
import { isBelowMaintenance, estimateMaintenanceCalories } from '@/lib/energy';
import { isFirebaseConfigured } from '@/lib/firebase';
import { theme } from '@/constants/theme';

export default function ProfileScreen() {
  const { data, updateProfile, addWeight, resetLocalData } = useAppData();
  const profile = data.profile!;
  const [goal, setGoal] = useState(String(profile.calorieGoal));
  const [waterGoal, setWaterGoal] = useState(profile.waterGoalMl ? String(profile.waterGoalMl) : '');
  const [weight, setWeight] = useState(String(profile.weightKg));
  const [supervised, setSupervised] = useState(profile.professionalSupervision);
  const [confirmClear, setConfirmClear] = useState(false);
  const [message, setMessage] = useState('');
  const maintenance = estimateMaintenanceCalories(profile);

  const saveGoals = () => {
    const calorieValue = Number(goal);
    const waterValue = waterGoal.trim() ? Number(waterGoal) : null;
    if (!Number.isInteger(calorieValue) || calorieValue < 500 || calorieValue > 10000 || (waterValue !== null && (!Number.isInteger(waterValue) || waterValue < 250 || waterValue > 10000))) {
      setMessage('Introduce una meta calórica entre 500 y 10 000 kcal y, si defines agua, entre 250 y 10 000 ml.');
      return;
    }
    if (isBelowMaintenance(calorieValue, profile) && !supervised) {
      setMessage('Una meta inferior a la estimación de mantenimiento solo se puede guardar si ha sido acordada con un profesional de salud.');
      return;
    }
    updateProfile({ calorieGoal: calorieValue, waterGoalMl: waterValue, professionalSupervision: supervised });
    setMessage('Tus objetivos se han actualizado.');
  };

  const saveWeight = () => {
    const value = Number(weight.replace(',', '.'));
    if (!Number.isFinite(value) || value < 35 || value > 300) {
      setMessage('El peso debe estar entre 35 y 300 kg.');
      return;
    }
    addWeight(value);
    updateProfile({ weightKg: value });
    setMessage('Peso registrado para hoy.');
  };

  return (
    <Page>
      <Heading title="Tu perfil" subtitle="Datos y preferencias de NutriBalance." />
      <Panel style={styles.profilePanel}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{profile.name.slice(0, 1).toUpperCase()}</Text></View>
        <View style={styles.profileInfo}><Text style={styles.name}>{profile.name}</Text><Text style={styles.profileLine}>{profile.age} años · {profile.heightCm} cm</Text><Text style={styles.profileLine}>{profile.weightKg.toFixed(1)} kg actuales</Text></View>
      </Panel>
      <Panel>
        <SectionTitle>Objetivos diarios</SectionTitle>
        <Text style={styles.helper}>Mantenimiento estimado: {maintenance} kcal al día. Es una orientación, no una recomendación médica.</Text>
        <FormField label="Meta de energía (kcal)" value={goal} onChangeText={setGoal} keyboardType="number-pad" />
        <FormField label="Meta de agua (ml)" value={waterGoal} onChangeText={setWaterGoal} keyboardType="number-pad" />
        <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: supervised }} onPress={() => setSupervised((value) => !value)} style={styles.checkboxRow}>
          <View style={[styles.checkbox, supervised && styles.checkboxChecked]}>{supervised ? <Text style={styles.checkmark}>✓</Text> : null}</View>
          <Text style={styles.checkboxText}>Meta acordada con un profesional de salud</Text>
        </Pressable>
        {message ? <Text accessibilityRole="alert" style={styles.message}>{message}</Text> : null}
        <ActionButton title="Guardar objetivos" onPress={saveGoals} />
      </Panel>
      <Panel>
        <SectionTitle>Registro de peso</SectionTitle>
        <FormField label="Peso de hoy (kg)" value={weight} onChangeText={setWeight} keyboardType="decimal-pad" />
        <ActionButton title="Guardar peso" variant="secondary" onPress={saveWeight} />
      </Panel>
      <Panel>
        <SectionTitle>Ajustes de cuenta</SectionTitle>
        <SettingRow icon={<LogIn color={theme.colors.forest} size={18} />} title={isFirebaseConfigured ? 'Cuenta Firebase' : 'Iniciar sesión / crear cuenta'} description={isFirebaseConfigured ? 'Sincronización disponible al configurar el proyecto.' : 'Autenticación opcional, datos locales disponibles.'} onPress={() => router.push('/auth')} />
        <SettingRow icon={<ShieldCheck color={theme.colors.forest} size={18} />} title="Privacidad y salud" description="Revisa el uso y el alcance de tus datos." onPress={() => setMessage('NutriBalance es una herramienta de registro y no sustituye el diagnóstico, tratamiento ni consejo de un profesional de salud.')} />
        {confirmClear ? (
          <View style={styles.clearConfirm}>
            <Text style={styles.clearPrompt}>Se eliminarán el perfil y todos los registros locales de este dispositivo.</Text>
            <View style={styles.clearActions}>
              <ActionButton title="Cancelar" variant="secondary" onPress={() => setConfirmClear(false)} />
              <ActionButton title="Eliminar datos" onPress={resetLocalData} />
            </View>
          </View>
        ) : <Pressable accessibilityRole="button" onPress={() => setConfirmClear(true)} style={styles.clearButton}><Text style={styles.clear}>Eliminar todos los datos de este dispositivo</Text></Pressable>}
      </Panel>
      <Notice tone="warning">No se recomiendan déficits extremos. Las metas por debajo del mantenimiento requieren supervisión profesional. Consulta con un profesional antes de cambiar tus hábitos, especialmente ante una condición médica.</Notice>
      <Text style={styles.version}>NutriBalance · Datos de alimentos: USDA FoodData Central</Text>
    </Page>
  );
}

function SettingRow({ icon, title, description, onPress }: { icon: React.ReactNode; title: string; description: string; onPress: () => void }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={styles.settingRow}><View style={styles.settingIcon}>{icon}</View><View style={styles.settingCopy}><Text style={styles.settingTitle}>{title}</Text><Text style={styles.settingDescription}>{description}</Text></View><ChevronRight color={theme.colors.muted} size={18} /></Pressable>;
}

const styles = StyleSheet.create({
  profilePanel: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 54, height: 54, borderRadius: 20, backgroundColor: theme.colors.mint, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: theme.colors.forest, fontSize: 22, fontWeight: '700' },
  profileInfo: { gap: 3 },
  name: { color: theme.colors.forest, fontSize: 18, fontWeight: '700' },
  profileLine: { color: theme.colors.muted, fontSize: 12 },
  helper: { color: theme.colors.muted, fontSize: 13, lineHeight: 19 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 5 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: theme.colors.muted, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: theme.colors.forest, borderColor: theme.colors.forest },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: '700' },
  checkboxText: { flex: 1, color: theme.colors.text, fontSize: 13, lineHeight: 18 },
  message: { color: theme.colors.danger, fontSize: 13, lineHeight: 19 },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 9 },
  settingIcon: { width: 35, height: 35, borderRadius: 12, backgroundColor: theme.colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' },
  settingCopy: { flex: 1, gap: 3 },
  settingTitle: { color: theme.colors.text, fontWeight: '700', fontSize: 13 },
  settingDescription: { color: theme.colors.muted, fontSize: 11, lineHeight: 15 },
  clearButton: { paddingTop: 8 },
  clear: { color: theme.colors.danger, fontSize: 13, fontWeight: '600' },
  clearConfirm: { gap: 10, paddingTop: 8 },
  clearPrompt: { color: theme.colors.danger, fontSize: 13, lineHeight: 19 },
  clearActions: { flexDirection: 'row', gap: 9 },
  version: { color: theme.colors.muted, fontSize: 11, textAlign: 'center' },
});
