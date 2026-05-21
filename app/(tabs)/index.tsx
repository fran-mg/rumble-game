import { LinearGradient } from "expo-linear-gradient";
import { Text } from "react-native";

export default function TabOneScreen() {
  return (
    <LinearGradient
      colors={["#9333ea", "#3b82f6"]}
      className="flex-1 items-center justify-center"
    >
      <Text className="text-5xl font-bold text-white mb-4">Articulate</Text>
      <Text className="text-xl text-white/80">Party Game Reimagined</Text>
    </LinearGradient>
  );
}
