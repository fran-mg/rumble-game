import React from "react";
import { Text, View } from "react-native";

interface ScoreHeaderProps {
  headerText: string;
  currentEntity: any;
  roundScores: Record<number, Record<number, number>>;
  turnPasses: number;
  turnScore: number;
}

export default function ScoreHeader({
  headerText,
  currentEntity,
  roundScores,
  turnPasses,
  turnScore,
}: ScoreHeaderProps) {
  return (
    <View className="p-6 pb-2 border-b border-slate-800">
      <Text className="text-slate-400 font-bold uppercase tracking-widest text-center text-sm mb-2">
        {headerText}
      </Text>

      <Text className="text-white text-2xl text-center mb-3">
        Total <Text className="font-bold">{currentEntity?.name}</Text> Score:{" "}
        <Text className="font-black text-blue-400">
          {Object.values(roundScores).reduce(
            (acc, round) => acc + (round[currentEntity?.id] || 0),
            0,
          )}
        </Text>
      </Text>

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
    </View>
  );
}
