import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGameStore } from "../../stores/useGameStore";

export default function RoundSummaryScreen() {
  const router = useRouter();
  const {
    teamsInGame,
    currentTeamIndex,
    turnHistory,
    turnScore,
    turnPasses,
    matchScores,
    currentRound,
    totalRounds,
  } = useGameStore();

  const currentTeam = teamsInGame[currentTeamIndex];
  const isLastTeam = currentTeamIndex === teamsInGame.length - 1;
  const isMatchOver = currentRound >= totalRounds && isLastTeam;
  const nextTeam = isLastTeam
    ? teamsInGame[0]
    : teamsInGame[currentTeamIndex + 1];

  const handleNext = () => {
    if (isMatchOver) {
      router.replace("/game/match-summary");
    } else {
      // Advance to next team or round
      useGameStore.setState((state) => ({
        currentTeamIndex:
          state.currentTeamIndex === state.teamsInGame.length - 1
            ? 0
            : state.currentTeamIndex + 1,
        currentRound:
          state.currentTeamIndex === state.teamsInGame.length - 1
            ? state.currentRound + 1
            : state.currentRound,
      }));
      // Go back to play screen (will trigger countdown automatically)
      router.replace("/game/play");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <View className="p-6 pb-2 border-b border-slate-800">
        <Text className="text-slate-400 font-bold uppercase tracking-widest text-center text-xs mb-1">
          Round {currentRound} Complete
        </Text>
        <Text className="text-white font-black text-3xl text-center mb-6">
          {currentTeam?.name}'s Turn
        </Text>

        {/* Score Totals */}
        <View className="flex-row justify-center items-end gap-12 mb-4">
          <View className="items-center">
            <Text className="text-orange-500 font-black text-4xl">
              {turnPasses}
            </Text>
            <Text className="text-orange-500/80 font-bold text-xs uppercase tracking-wider">
              Passes
            </Text>
          </View>
          <View className="items-center">
            <Text className="text-green-500 font-black text-6xl">
              {turnScore}
            </Text>
            <Text className="text-green-500/80 font-bold text-sm uppercase tracking-wider">
              Correct
            </Text>
          </View>
        </View>

        <Text className="text-white text-center font-medium mt-4">
          Total {currentTeam?.name} Score:{" "}
          <Text className="font-black text-blue-400">
            {matchScores[currentTeam?.id]}
          </Text>
        </Text>
      </View>

      {/* History List */}
      <ScrollView className="flex-1 px-6 py-4">
        {turnHistory.map((item: any, index: any) => (
          <View
            key={index}
            className="py-3 border-b border-slate-900 flex-row justify-between items-center"
          >
            <Text
              className={`text-xl font-bold ${
                item.result === "guessed"
                  ? "text-green-400"
                  : "text-orange-400 line-through opacity-70"
              }`}
            >
              {item.word}
            </Text>
            <Text
              className={`font-black ${item.result === "guessed" ? "text-green-500" : "text-orange-500"}`}
            >
              {item.result === "guessed" ? "+1" : "0"}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Action Button */}
      <View className="p-6">
        <TouchableOpacity
          onPress={handleNext}
          className="bg-blue-600 rounded-2xl py-5 items-center shadow-lg"
        >
          <Text className="text-white font-black text-lg uppercase tracking-wide">
            {isMatchOver
              ? "View Match Results"
              : `${nextTeam?.name} Start Round`}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
