import { useRouter } from "expo-router";
import * as LucideIcons from "lucide-react-native";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGameStore } from "../../stores/useGameStore";

export default function MatchSummaryScreen() {
  const router = useRouter();
  const {
    playStyle,
    matchTeams,
    matchPlayers,
    roundScores,
    currentRound,
    endMatch,
  } = useGameStore();

  const activeRoster = playStyle === "team" ? matchTeams : matchPlayers;

  // Calculate Totals per Entity
  const totals: Record<string, number> = {};
  activeRoster.forEach((entity) => {
    totals[entity.id] = Object.values(roundScores).reduce(
      (acc, round) => acc + (round[entity.id] || 0),
      0,
    );
  });

  const sortedEntities = [...activeRoster].sort(
    (a, b) => totals[b.id] - totals[a.id],
  );
  const winner = sortedEntities[0];
  const isTie =
    sortedEntities.length > 1 &&
    totals[sortedEntities[0].id] === totals[sortedEntities[1].id];

  const handleFinish = () => {
    endMatch();
    router.replace("/");
  };

  // Build columns based on rounds played
  const roundKeys = Object.keys(roundScores)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <SafeAreaView className="flex-1 bg-slate-950 p-6">
      <View className="items-center mt-4 mb-8">
        <LucideIcons.Trophy color="#F59E0B" size={56} className="mb-2" />
        <Text className="text-slate-400 font-bold uppercase tracking-widest mb-1 text-xs">
          Match Complete
        </Text>
        {isTie ? (
          <Text className="text-white text-4xl font-black text-center">
            It's a Tie!
          </Text>
        ) : (
          <Text className="text-amber-500 text-4xl font-black text-center">
            {winner?.name} Wins!
          </Text>
        )}
      </View>

      {/* Grid Leaderboard */}
      <View className="bg-slate-900 rounded-3xl p-5 border border-slate-800 flex-1">
        {/* Header Row */}
        <View className="flex-row border-b border-slate-800 pb-3 mb-3">
          <Text className="flex-1 text-slate-400 font-bold uppercase text-[10px]">
            Competitor
          </Text>
          {roundKeys.map((r) => (
            <Text
              key={r}
              className="w-10 text-center text-slate-500 font-bold uppercase text-[10px]"
            >
              R{r}
            </Text>
          ))}
          <Text className="w-14 text-right text-slate-400 font-bold uppercase text-[10px]">
            Total
          </Text>
        </View>

        {/* Rows */}
        <ScrollView showsVerticalScrollIndicator={false}>
          {sortedEntities.map((entity, index) => (
            <View
              key={entity.id}
              className="flex-row items-center py-3 border-b border-slate-800/50"
            >
              <View className="flex-1 flex-row items-center">
                <Text
                  className={`font-black text-sm w-5 ${index === 0 ? "text-amber-500" : "text-slate-600"}`}
                >
                  #{index + 1}
                </Text>
                <Text
                  className="text-white font-bold text-sm ml-1"
                  numberOfLines={1}
                >
                  {entity.name}
                </Text>
              </View>

              {/* Round Breakdowns */}
              {roundKeys.map((r) => (
                <Text
                  key={r}
                  className="w-10 text-center text-slate-400 font-medium text-xs"
                >
                  {roundScores[r]?.[entity.id] ?? "-"}
                </Text>
              ))}

              {/* Total */}
              <Text
                className={`w-14 text-right font-black text-xl ${index === 0 ? "text-amber-500" : "text-white"}`}
              >
                {totals[entity.id]}
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
