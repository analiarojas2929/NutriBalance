import { theme } from "@/constants/theme";
import { Tabs } from "expo-router";
import {
    BookOpen,
    ChartNoAxesColumn,
    House,
    UserRound,
} from "lucide-react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.forest,
        tabBarInactiveTintColor: theme.colors.muted,
        tabBarStyle: {
          height: 74,
          paddingTop: 9,
          paddingBottom: 10,
          borderTopColor: theme.colors.line,
          backgroundColor: theme.colors.surface,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Hoy",
          tabBarIcon: ({ color, size }) => (
            <House color={color} size={size} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="diary"
        options={{
          title: "Diario",
          tabBarIcon: ({ color, size }) => (
            <BookOpen color={color} size={size} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: "Progreso",
          tabBarIcon: ({ color, size }) => (
            <ChartNoAxesColumn color={color} size={size} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => (
            <UserRound color={color} size={size} strokeWidth={2} />
          ),
        }}
      />
    </Tabs>
  );
}
