import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "../../constants/Colors";
import { useGameStore } from "../../stores/useGameStore";
import { dbHelpers } from "../../utils/database";

export default function SummaryScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const { roundScore, passesUsed, currentRound, roundId } = useGameStore();

  // Local state to allow end-of-round edits before finalizing
  const [adjustedScore, setAdjustedScore] = useState(roundScore);

  const handleContinue = async () => {
    // If they adjusted the score manually, we would fire a DB update here
    if (adjustedScore !== roundScore && roundId) {
      await dbHelpers.endRound(roundId, adjustedScore); // Updates final round score
    }

    // In a full game flow, we'd go to next team's turn. For now, back to home.
    router.replace("/");
  };

  return (
    <SafeAreaView className={`flex-1 ${theme.background}`}>
      <ScrollView
        contentContainerStyle={{
          padding: 24,
          flexGrow: 1,
          justifyContent: "center",
        }}
      >
        <Text
          className={`text-center text-xl font-bold uppercase tracking-widest mb-2 ${theme.textSecondary}`}
        >
          Round {currentRound - 1} Complete
        </Text>

        <Text
          className={`text-center text-5xl font-black mb-12 ${theme.textPrimary}`}
        >
          Time's Up!
        </Text>

        <View
          className={`rounded-3xl p-8 items-center ${theme.surface} border`}
        >
          <Text className={`text-lg mb-2 ${theme.textSecondary}`}>
            Cards Guessed
          </Text>

          <View className="flex-row items-center justify-center w-full mb-8">
            <TouchableOpacity
              className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-full items-center justify-center"
              onPress={() => setAdjustedScore(Math.max(0, adjustedScore - 1))}
            >
              <Text className={`text-2xl font-bold ${theme.textPrimary}`}>
                -
              </Text>
            </TouchableOpacity>

            <Text className={`text-7xl font-bold mx-8 ${theme.accentText}`}>
              {adjustedScore}
            </Text>

            <TouchableOpacity
              className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-full items-center justify-center"
              onPress={() => setAdjustedScore(adjustedScore + 1)}
            >
              <Text className={`text-2xl font-bold ${theme.textPrimary}`}>
                +
              </Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-between w-full border-t border-slate-200 dark:border-slate-800 pt-6">
            <View className="items-center">
              <Text className={`text-xl font-bold text-amber-500`}>
                {passesUsed}
              </Text>
              <Text className={`text-sm mt-1 ${theme.textSecondary}`}>
                Passes
              </Text>
            </View>
            <View className="items-center">
              <Text className={`text-xl font-bold text-green-500`}>
                {roundScore}
              </Text>
              <Text className={`text-sm mt-1 ${theme.textSecondary}`}>
                Original Score
              </Text>
            </View>
          </View>
        </View>

        <View className="flex-1" />

        <TouchableOpacity
          className="bg-blue-600 w-full py-5 rounded-2xl items-center shadow-lg"
          onPress={handleContinue}
        >
          <Text className="text-white text-xl font-bold">Next Turn</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
