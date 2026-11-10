import { theme } from "@/constants/theme";
import type { PropsWithChildren, ReactNode } from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
    type ScrollViewProps,
    type StyleProp,
    type TextInputProps,
    type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function Page({
  children,
  contentStyle,
  ...props
}: PropsWithChildren<ScrollViewProps> & { contentStyle?: ViewStyle }) {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        contentContainerStyle={[styles.page, contentStyle]}
        keyboardShouldPersistTaps="handled"
        {...props}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function Heading({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <View style={styles.headingRow}>
      <View style={styles.headingText}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

export function SectionTitle({
  children,
  trailing,
}: PropsWithChildren<{ trailing?: ReactNode }>) {
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.sectionTitle}>{children}</Text>
      {trailing}
    </View>
  );
}

export function Panel({
  children,
  style,
}: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <View style={[styles.panel, style]}>{children}</View>;
}

export function ActionButton({
  title,
  onPress,
  icon,
  variant = "primary",
  disabled = false,
}: {
  title: string;
  onPress: () => void;
  icon?: ReactNode;
  variant?: "primary" | "secondary" | "quiet";
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        styles[`button_${variant}`],
        disabled && styles.buttonDisabled,
      ]}
    >
      {icon}
      <Text style={[styles.buttonText, styles[`buttonText_${variant}`]]}>
        {title}
      </Text>
    </Pressable>
  );
}

export function FormField({
  label,
  error,
  ...inputProps
}: TextInputProps & { label: string; error?: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        placeholderTextColor={theme.colors.muted}
        style={[styles.input, error ? styles.inputError : null]}
        accessibilityLabel={label}
        {...inputProps}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

export function ChoiceGroup<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.choiceRow}>
        {options.map((option) => (
          <Text
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected: value === option.value }}
            onPress={() => onChange(option.value)}
            style={[
              styles.choice,
              value === option.value && styles.choiceSelected,
            ]}
          >
            {option.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

export function Notice({
  children,
  tone = "mint",
}: PropsWithChildren<{ tone?: "mint" | "warning" }>) {
  return (
    <View style={[styles.notice, tone === "warning" && styles.noticeWarning]}>
      <Text style={styles.noticeText}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  page: {
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 36,
    gap: 23,
  },
  headingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  headingText: { flex: 1, gap: 5 },
  title: {
    color: theme.colors.forest,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "700",
  },
  subtitle: { color: theme.colors.muted, fontSize: 14, lineHeight: 20 },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  sectionTitle: { color: theme.colors.text, fontSize: 17, fontWeight: "700" },
  panel: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.medium,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: theme.colors.line,
  },
  button: {
    minHeight: 48,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 13,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  button_primary: { backgroundColor: theme.colors.forest },
  button_secondary: { backgroundColor: theme.colors.surfaceMuted },
  button_quiet: { backgroundColor: "transparent" },
  buttonText: { textAlign: "center", fontSize: 15, fontWeight: "700" },
  buttonText_primary: { color: "#FFFFFF" },
  buttonText_secondary: { color: theme.colors.forest },
  buttonText_quiet: { color: theme.colors.forest },
  buttonDisabled: { opacity: 0.45 },
  field: { gap: 8 },
  fieldLabel: { color: theme.colors.text, fontSize: 14, fontWeight: "600" },
  input: {
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 14,
    color: theme.colors.text,
    fontSize: 16,
  },
  inputError: { borderColor: theme.colors.danger },
  errorText: { color: theme.colors.danger, fontSize: 13 },
  choiceRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  choice: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.line,
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: theme.colors.muted,
    fontSize: 14,
    overflow: "hidden",
  },
  choiceSelected: {
    backgroundColor: theme.colors.surfaceMuted,
    borderColor: theme.colors.mintStrong,
    color: theme.colors.forest,
    fontWeight: "700",
  },
  notice: {
    borderRadius: 14,
    padding: 14,
    backgroundColor: theme.colors.surfaceMuted,
  },
  noticeWarning: { backgroundColor: theme.colors.orangeSoft },
  noticeText: { color: theme.colors.text, fontSize: 13, lineHeight: 19 },
});
