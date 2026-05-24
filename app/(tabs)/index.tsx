import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { useTeamStore } from "../../stores/useTeamStore";

export default function TabOneScreen() {
  const router = useRouter();

  // Helper logic to ensure valid team IDs exist in database
  const getOrCreateValidTeamIds = async () => {
    await useTeamStore.getState().loadTeams();
    let activeTeams = useTeamStore.getState().teams;

    if (activeTeams.length < 2) {
      await useTeamStore
        .getState()
        .createTeam("Alpha Squad", "#10B981", "Target");
      await useTeamStore
        .getState()
        .createTeam("Beta Brains", "#3B82F6", "Users");
      await useTeamStore.getState().loadTeams();
      activeTeams = useTeamStore.getState().teams;
    }

    return activeTeams.map((t) => t.id);
  };

  return (
    <LinearGradient
      colors={["#9333ea", "#3b82f6"]}
      className="flex-1 items-center justify-center px-6 pt-12"
    >
      {/* Header View */}
      <View className="items-center mb-6">
        <Text className="text-5xl font-black text-white tracking-tight mb-2">
          Articulate
        </Text>
        <Text className="text-lg text-white/80 font-medium tracking-wide">
          Party Game Reimagined
        </Text>
      </View>
    </LinearGradient>
  );
}
