import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Stack, usePathname, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProvider, useAppData } from '@/context/AppContext';
import { theme } from '@/constants/theme';

function NavigationGate() {
  const { data, isReady } = useAppData();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isReady) return;
    if (!data.profile && pathname !== '/onboarding' && pathname !== '/auth') router.replace('/onboarding');
    if (data.profile && pathname === '/onboarding') router.replace('/(tabs)');
  }, [data.profile, isReady, pathname, router]);

  if (!isReady || (!data.profile && pathname !== '/onboarding' && pathname !== '/auth')) {
    return <View style={styles.loading}><ActivityIndicator color={theme.colors.mintStrong} size="large" /></View>;
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.background } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="add-food" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="auth" options={{ presentation: 'modal', headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return <AppProvider><NavigationGate /></AppProvider>;
}

const styles = StyleSheet.create({ loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background } });
