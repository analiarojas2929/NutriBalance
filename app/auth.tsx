import {
    ActionButton,
    FormField,
    Heading,
    Notice,
    Page,
    Panel,
} from "@/components/ui";
import { theme } from "@/constants/theme";
import { isFirebaseConfigured } from "@/lib/firebase";
import { register, sendPasswordReset, signIn } from "@/lib/firebaseAuth";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
} from "react-native";

type AuthMode = "signin" | "register";

export default function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const submit = async () => {
    const normalizedEmail = email.trim();
    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) ||
      password.length < 8
    ) {
      setMessage(
        "Escribe un correo válido y una contraseña de al menos 8 caracteres.",
      );
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      if (mode === "register") await register(normalizedEmail, password);
      else await signIn(normalizedEmail, password);
      setMessage(
        "Sesión iniciada. En este MVP, tus registros continúan guardándose en el dispositivo.",
      );
    } catch (reason) {
      setMessage(
        reason instanceof Error
          ? reason.message
          : "No se pudo completar la solicitud.",
      );
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setMessage("Introduce un correo válido para recibir el enlace.");
      return;
    }
    setLoading(true);
    try {
      await sendPasswordReset(email.trim());
      setMessage(
        "Si el correo está registrado, recibirás instrucciones para restablecer la contraseña.",
      );
    } catch (reason) {
      setMessage(
        reason instanceof Error
          ? reason.message
          : "No se pudo enviar el correo.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Page contentStyle={styles.content}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver"
          onPress={() => router.back()}
          style={styles.back}
        >
          <ArrowLeft color={theme.colors.forest} size={21} />
        </Pressable>
        <Heading
          title={mode === "signin" ? "Bienvenida/o" : "Crear cuenta"}
          subtitle="La cuenta es opcional; puedes usar la app en modo local."
        />
        <Panel>
          <FormField
            label="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <FormField
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete={
              mode === "register" ? "new-password" : "current-password"
            }
          />
          {message ? (
            <Text accessibilityRole="alert" style={styles.message}>
              {message}
            </Text>
          ) : null}
          {loading ? (
            <ActivityIndicator color={theme.colors.mintStrong} />
          ) : (
            <ActionButton
              title={mode === "signin" ? "Iniciar sesión" : "Crear cuenta"}
              onPress={submit}
            />
          )}
          {mode === "signin" ? (
            <Text
              accessibilityRole="button"
              onPress={resetPassword}
              style={styles.link}
            >
              ¿Olvidaste tu contraseña?
            </Text>
          ) : null}
          <Text
            accessibilityRole="button"
            onPress={() => {
              setMode((current) =>
                current === "signin" ? "register" : "signin",
              );
              setMessage("");
            }}
            style={styles.link}
          >
            {mode === "signin"
              ? "Crear una cuenta nueva"
              : "Ya tengo una cuenta"}
          </Text>
        </Panel>
        {!isFirebaseConfigured ? (
          <Notice>
            Firebase no está configurado. Añade las credenciales de tu proyecto
            en el archivo .env para activar el acceso. El MVP local está
            disponible sin cuenta.
          </Notice>
        ) : (
          <Notice>
            Los datos de perfil y diario permanecen locales en esta versión
            inicial. La autenticación no activa sincronización automáticamente.
          </Notice>
        )}
      </Page>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingTop: 18 },
  back: { height: 38, justifyContent: "center" },
  message: { color: theme.colors.danger, fontSize: 13, lineHeight: 19 },
  link: {
    color: theme.colors.mintStrong,
    fontSize: 13,
    textAlign: "center",
    fontWeight: "600",
    paddingVertical: 6,
  },
});
