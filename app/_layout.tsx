import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";
import { initDatabase } from "../utils/database";
import "./global.css";

// Mute strict layout warning logs from third-party component interops
configureReanimatedLogger({
  level: ReanimatedLogLevel.error,
  strict: false,
});

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    // Initialize DB on app start
    initDatabase().catch(console.error);
  }, []);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="game/play" options={{ gestureEnabled: false }} />
        <Stack.Screen name="game/summary" options={{ gestureEnabled: false }} />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      </Stack>
    </ThemeProvider>
  );
}
