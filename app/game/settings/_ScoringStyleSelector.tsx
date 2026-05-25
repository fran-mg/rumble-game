import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { ScoringStyle } from "../../../stores/useGameStore";

interface ScoringStyleSelectorProps {
  scoringStyle: ScoringStyle;
  onScoringStyleChange: (style: ScoringStyle) => void;
  targetLimit: number | "Infinity";
  onTargetLimitChange: (limit: number | "Infinity") => void;
}

export default function ScoringStyleSelector({
  scoringStyle,
  onScoringStyleChange,
  targetLimit,
  onTargetLimitChange,
}: ScoringStyleSelectorProps) {
  return (
    <View className="bg-slate-900 border border-slate-800 rounded-3xl p-5 mb-4">
      <Text className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-3">
        Scoring Style
      </Text>

      {/* Toggle between Rounds and Boardgame */}
      <View className="flex-row bg-slate-950 rounded-xl p-1 mb-4">
        <TouchableOpacity
          onPress={() => onScoringStyleChange("rounds")}
          className={`flex-1 py-2.5 rounded-lg items-center ${
            scoringStyle === "rounds" ? "bg-blue-600" : ""
          }`}
        >
          <Text
            className={`font-bold ${
              scoringStyle === "rounds" ? "text-white" : "text-slate-500"
            }`}
          >
            Rounds
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onScoringStyleChange("boardgame")}
          className={`flex-1 py-2.5 rounded-lg items-center ${
            scoringStyle === "boardgame" ? "bg-blue-600" : ""
          }`}
        >
          <Text
            className={`font-bold ${
              scoringStyle === "boardgame" ? "text-white" : "text-slate-500"
            }`}
          >
            Boardgame
          </Text>
        </TouchableOpacity>
      </View>

      {/* Target limit input - conditional based on scoring style */}
      {scoringStyle === "rounds" ? (
        <View className="flex-row items-center justify-between">
          <Text className="text-white font-medium">Target Rounds:</Text>
          <View className="flex-row items-center gap-3">
            {/* Infinity toggle */}
            <TouchableOpacity
              onPress={() =>
                onTargetLimitChange(targetLimit === "Infinity" ? 3 : "Infinity")
              }
              className={`px-3 py-1.5 rounded-full border ${
                targetLimit === "Infinity"
                  ? "border-blue-500 bg-blue-500/20"
                  : "border-slate-700"
              }`}
            >
              <Text className="text-white font-bold text-sm">∞</Text>
            </TouchableOpacity>

            {/* Numeric input (hidden when Infinity) */}
            {targetLimit !== "Infinity" && (
              <TextInput
                value={String(targetLimit)}
                onChangeText={(val) => {
                  const parsed = parseInt(val) || 1;
                  onTargetLimitChange(Math.min(20, Math.max(1, parsed)));
                }}
                keyboardType="number-pad"
                maxLength={2}
                className="bg-slate-950 text-white font-bold px-4 py-2 rounded-xl text-center w-16 border border-slate-800"
              />
            )}
          </View>
        </View>
      ) : (
        <View className="flex-row items-center justify-between">
          <Text className="text-white font-medium">Tiles to Finish:</Text>
          <TextInput
            value={String(targetLimit === "Infinity" ? 30 : targetLimit)}
            onChangeText={(val) => {
              const parsed = parseInt(val) || 5;
              onTargetLimitChange(Math.min(30, Math.max(5, parsed)));
            }}
            keyboardType="number-pad"
            maxLength={2}
            className="bg-slate-950 text-white font-bold px-4 py-2 rounded-xl text-center w-16 border border-slate-800"
          />
        </View>
      )}

      {/* Helper text */}
      <Text className="text-slate-600 text-xs mt-3 text-center">
        {scoringStyle === "rounds"
          ? targetLimit === "Infinity"
            ? "Play until you decide to end the match"
            : `Match ends after ${targetLimit} rounds (1–20)`
          : `First to reach tile ${targetLimit} wins (5–30)`}
      </Text>
    </View>
  );
}
