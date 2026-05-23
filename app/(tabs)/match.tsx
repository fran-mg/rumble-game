import { useRouter } from "expo-router";
import * as LucideIcons from "lucide-react-native";
import React from "react";
import { ScrollView, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "../../constants/Colors";
import { useDeckStore } from "../../stores/useDeckStore";
import { useGameStore } from "../../stores/useGameStore";
import { dbHelpers } from "../../utils/database";

export default function MatchSetupScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const { setupMatch } = useGameStore();

  const launchTestMatch = async (mode: "headsup" | "taboo" | "password") => {
    try {
      // 1. Setup Mock Teams (User1, User2)
      let teams = await dbHelpers.getAllTeams();
      if (teams.length < 2) {
        await dbHelpers.createTeam("User1", "#10B981", "User");
        await dbHelpers.createTeam("User2", "#3B82F6", "User");
        teams = await dbHelpers.getAllTeams();
      }
      const testTeams = [teams[0], teams[1]];

      // 2. Setup Mock Decks (Ensuring cards exist)
      await useDeckStore.getState().loadDecks();
      const allDecks = useDeckStore.getState().decks;
      if (allDecks.length > 0) {
        // Select first two decks to simulate 'General' and 'Science'
        await dbHelpers.toggleDeckSelection(allDecks[0].id);
        if (allDecks.length > 1)
          await dbHelpers.toggleDeckSelection(allDecks[1].id);
      }

      await useDeckStore.getState().loadCardsForSelectedDecks();
      const cards = useDeckStore.getState().currentCards;

      if (!cards || cards.length === 0) {
        alert(
          "No cards found. Go to Decks tab and generate/select a deck first!",
        );
        return;
      }

      // 3. Initialize Match (15s timer)
      setupMatch(mode, testTeams, 15, cards);

      // 4. Route to game
      router.push("/game/play");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SafeAreaView className={`flex-1 ${theme.background} p-6`}>
      <Text className={`text-3xl font-black mb-2 ${theme.textPrimary}`}>
        Test Match
      </Text>
      <Text className={`text-base font-medium mb-8 ${theme.textSecondary}`}>
        Settings: 1 Round, 2 Players, 15s Timer, General/Science Decks
      </Text>

      <ScrollView className="flex-1" contentContainerStyle={{ gap: 16 }}>
        {/* Mode 1: Heads Up */}
        <TouchableOpacity
          onPress={() => launchTestMatch("headsup")}
          className="bg-indigo-600 rounded-3xl p-6 shadow-lg items-center"
        >
          <LucideIcons.Smartphone color="white" size={40} className="mb-4" />
          <Text className="text-white text-2xl font-black tracking-tight mb-2">
            Heads Up
          </Text>
          <Text className="text-white/80 text-center text-sm font-medium">
            Hold to forehead. Tilt DOWN for correct. Tilt UP to pass.
            (Horizontal layout)
          </Text>
        </TouchableOpacity>

        {/* Mode 2: Taboo / Charades */}
        <TouchableOpacity
          onPress={() => launchTestMatch("taboo")}
          className="bg-rose-500 rounded-3xl p-6 shadow-lg items-center"
        >
          <LucideIcons.Ban color="white" size={40} className="mb-4" />
          <Text className="text-white text-2xl font-black tracking-tight mb-2">
            Taboo / Charades
          </Text>
          <Text className="text-white/80 text-center text-sm font-medium">
            Describe or act. Tap buttons to pass or score. (Vertical layout)
          </Text>
        </TouchableOpacity>

        {/* Mode 3: Password */}
        <TouchableOpacity
          onPress={() => launchTestMatch("password")}
          className="bg-emerald-600 rounded-3xl p-6 shadow-lg items-center"
        >
          <LucideIcons.Key color="white" size={40} className="mb-4" />
          <Text className="text-white text-2xl font-black tracking-tight mb-2">
            Password
          </Text>
          <Text className="text-white/80 text-center text-sm font-medium">
            One word clues. Forbidden words shown below target. (Vertical
            layout)
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
