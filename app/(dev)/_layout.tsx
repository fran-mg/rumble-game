import { Stack } from "expo-router";

export default function DevLayout() {
  return (
    <Stack screenOptions={{ headerShown: true, headerBackTitle: "Back" }}>
      <Stack.Screen name="match-test" options={{ title: "Match Test" }} />
      <Stack.Screen name="round-test" options={{ title: "Round Test" }} />
    </Stack>
  );
}
