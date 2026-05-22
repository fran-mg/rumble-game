import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { useDeckStore } from "../../stores/useDeckStore";
import { useGameStore } from "../../stores/useGameStore";
import { useTeamStore } from "../../stores/useTeamStore";

export default function TabOneScreen() {
  const router = useRouter();

  // Zustand Store Test State Hooks
  const { isPlaying, timerDuration, startGame, endGame, setTimerDuration } =
    useGameStore();

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

  const handleStartGameToggle = async () => {
    try {
      if (isPlaying) {
        await endGame();
      } else {
        // Ensure valid IDs are present before starting core game instance
        const validTeamIds = await getOrCreateValidTeamIds();
        await startGame("articulate", validTeamIds);
      }
    } catch (error) {
      console.error("Core game toggle sequence failed:", error);
    }
  };

  const startTestRound = async () => {
    try {
      // 1. Resolve and extract verified database team IDs
      const validTeamIds = await getOrCreateValidTeamIds();

      // 2. Load checked decks from SQLite, then explicitly fetch their card objects
      await useDeckStore.getState().loadDecks();
      await useDeckStore.getState().loadCardsForSelectedDecks(); // Await the SQLite database card loader

      // 3. Extract the loaded card arrays directly from the updated store instance
      const cards = useDeckStore.getState().currentCards;

      // 4. Alert safety fallback check
      if (!cards || cards.length === 0) {
        Alert.alert(
          "Warning",
          "Your current card deck cache is empty. Visit the Decks tab, click a deck card to highlight/select it, then come back!",
        );
        return;
      }

      // 5. Initialize the game engine with your database match teams array
      await useGameStore.getState().startGame("articulate", validTeamIds);

      // 6. Launch round 1 assigning the singular first active team entry ID
      await useGameStore.getState().startRound(validTeamIds[0], cards);

      // 7. Route matrix transition safely over to the play arena
      router.push("/game/play");
    } catch (error) {
      console.error("Failed to boot test round layout context:", error);
    }
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

      {/* Zustand Store State Diagnostics */}
      <Text className="text-xl text-white/80 mb-4">
        Timer: {timerDuration}s
      </Text>

      {/* Timer Modification Grid */}
      <View className="flex-row gap-4 mb-6">
        <TouchableOpacity
          onPress={() => setTimerDuration(30)}
          className="bg-white/20 px-6 py-3 rounded-xl border border-white/10"
        >
          <Text className="text-white font-bold">30s</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setTimerDuration(60)}
          className="bg-white/20 px-6 py-3 rounded-xl border border-white/10"
        >
          <Text className="text-white font-bold">60s</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setTimerDuration(90)}
          className="bg-white/20 px-6 py-3 rounded-xl border border-white/10"
        >
          <Text className="text-white font-bold">90s</Text>
        </TouchableOpacity>
      </View>

      {/* Basic Game State Core Toggle */}
      <TouchableOpacity
        onPress={handleStartGameToggle}
        className="bg-white px-8 py-4 rounded-2xl mb-8 w-full items-center shadow-lg"
      >
        <Text className="text-purple-600 font-extrabold text-lg">
          {isPlaying ? "End Game" : "Start Game"}
        </Text>
      </TouchableOpacity>

      {isPlaying && (
        <Text className="text-white text-2xl mb-8 font-black uppercase tracking-wider">
          Game Active
        </Text>
      )}

      {/* Navigation Jump Matrix Button */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={startTestRound}
        className="w-full bg-white/20 border border-white/30 backdrop-blur-md py-4 rounded-2xl items-center justify-center shadow-lg"
      >
        <Text className="text-white font-extrabold text-base tracking-tight">
          Initialize Test Matrix (Jump to Play)
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}
