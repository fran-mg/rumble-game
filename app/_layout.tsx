import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";
import { initDatabase } from "../utils/database";
import "./global.css";

configureReanimatedLogger({
  level: ReanimatedLogLevel.error,
  strict: false,
});

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    initDatabase().catch(console.error);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="game/play" options={{ gestureEnabled: false }} />
          <Stack.Screen
            name="game/round-summary"
            options={{ gestureEnabled: false, animation: "fade" }}
          />
          <Stack.Screen
            name="game/match-summary"
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen name="modal" options={{ presentation: "modal" }} />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
