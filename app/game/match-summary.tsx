import { useRouter } from "expo-router";
import * as LucideIcons from "lucide-react-native";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGameStore } from "../../stores/useGameStore";

export default function MatchSummaryScreen() {
  const router = useRouter();
  const { teamsInGame, matchScores, endMatch } = useGameStore();

  // Calculate Winner
  const sortedTeams = [...teamsInGame].sort(
    (a, b) => matchScores[b.id] - matchScores[a.id],
  );
  const winner = sortedTeams[0];
  const isTie =
    sortedTeams.length > 1 &&
    matchScores[sortedTeams[0].id] === matchScores[sortedTeams[1].id];

  const handleFinish = () => {
    endMatch();
    router.replace("/");
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-950 p-6">
      <View className="items-center mt-8 mb-12">
        <LucideIcons.Trophy color="#F59E0B" size={64} className="mb-4" />
        <Text className="text-slate-400 font-bold uppercase tracking-widest mb-2">
          Match Complete
        </Text>
        {isTie ? (
          <Text className="text-white text-5xl font-black text-center">
            It's a Tie!
          </Text>
        ) : (
          <Text className="text-amber-500 text-5xl font-black text-center">
            {winner?.name} Wins!
          </Text>
        )}
      </View>

      {/* Leaderboard */}
      <View className="bg-slate-900 rounded-3xl p-6 border border-slate-800 flex-1">
        <View className="flex-row border-b border-slate-800 pb-4 mb-4">
          <Text className="flex-1 text-slate-400 font-bold uppercase text-xs">
            Team
          </Text>
          <Text className="text-slate-400 font-bold uppercase text-xs">
            Final Score
          </Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {sortedTeams.map((team, index) => (
            <View key={team.id} className="flex-row items-center mb-6">
              <View className="w-8">
                <Text
                  className={`font-black text-xl ${index === 0 ? "text-amber-500" : "text-slate-600"}`}
                >
                  #{index + 1}
                </Text>
              </View>
              <Text className="flex-1 text-white font-bold text-xl ml-2">
                {team.name}
              </Text>
              <Text
                className={`font-black text-3xl ${index === 0 ? "text-amber-500" : "text-white"}`}
              >
                {matchScores[team.id]}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <TouchableOpacity
        onPress={handleFinish}
        className="bg-blue-600 rounded-2xl py-5 mt-6 items-center shadow-lg"
      >
        <Text className="text-white font-black text-lg uppercase tracking-wide">
          Back to Home
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
