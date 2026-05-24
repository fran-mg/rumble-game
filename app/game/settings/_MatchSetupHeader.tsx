import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { PlayStyle, ScoringStyle } from "../../../stores/useGameStore";

interface MatchSetupHeaderProps {
  scoringStyle: ScoringStyle;
  handleScoringStyleChange: (style: ScoringStyle) => void;
  targetLimit: number | "Infinity";
  setTargetLimit: (limit: number | "Infinity") => void;
  playStyle: PlayStyle;
  setPlayStyle: (style: PlayStyle) => void;
}

export default function MatchSetupHeader({
  scoringStyle,
  handleScoringStyleChange,
  targetLimit,
  setTargetLimit,
  playStyle,
  setPlayStyle,
}: MatchSetupHeaderProps) {
  return (
    <>
      <Text className="text-3xl font-black text-white tracking-tight mb-6">
        Match Setup
      </Text>

      <View className="bg-slate-900 border border-slate-800 rounded-3xl p-5 mb-4">
        <Text className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-3">
          Scoring Style
        </Text>
        <View className="flex-row bg-slate-950 rounded-xl p-1 mb-4">
          <TouchableOpacity
            onPress={() => handleScoringStyleChange("rounds")}
            className={`flex-1 py-2 rounded-lg items-center ${scoringStyle === "rounds" ? "bg-blue-600" : ""}`}
          >
            <Text
              className={`font-bold ${scoringStyle === "rounds" ? "text-white" : "text-slate-500"}`}
            >
              Rounds
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleScoringStyleChange("boardgame")}
            className={`flex-1 py-2 rounded-lg items-center ${scoringStyle === "boardgame" ? "bg-blue-600" : ""}`}
          >
            <Text
              className={`font-bold ${scoringStyle === "boardgame" ? "text-white" : "text-slate-500"}`}
            >
              Boardgame
            </Text>
          </TouchableOpacity>
        </View>

        {scoringStyle === "rounds" ? (
          <View className="flex-row items-center justify-between">
            <Text className="text-white font-medium">
              Target Rounds (1-20):
            </Text>
            <View className="flex-row items-center gap-3">
              <TouchableOpacity
                onPress={() =>
                  setTargetLimit(targetLimit === "Infinity" ? 3 : "Infinity")
                }
                className={`px-3 py-1 rounded-full border ${targetLimit === "Infinity" ? "border-blue-500 bg-blue-500/20" : "border-slate-700"}`}
              >
                <Text className="text-white font-bold">∞</Text>
              </TouchableOpacity>
              {targetLimit !== "Infinity" && (
                <TextInput
                  value={String(targetLimit)}
                  onChangeText={(val) =>
                    setTargetLimit(
                      Math.min(20, Math.max(1, parseInt(val) || 1)),
                    )
                  }
                  keyboardType="number-pad"
                  className="bg-slate-950 text-white font-bold px-4 py-2 rounded-xl text-center w-16"
                />
              )}
            </View>
          </View>
        ) : (
          <View className="flex-row items-center justify-between">
            <Text className="text-white font-medium">
              Tiles to Finish (5-30):
            </Text>
            <TextInput
              value={String(targetLimit === "Infinity" ? 30 : targetLimit)}
              onChangeText={(val) =>
                setTargetLimit(Math.min(30, Math.max(5, parseInt(val) || 5)))
              }
              keyboardType="number-pad"
              className="bg-slate-950 text-white font-bold px-4 py-2 rounded-xl text-center w-16"
            />
          </View>
        )}
      </View>

      <View className="bg-slate-900 border border-slate-800 rounded-t-3xl p-5 pb-2">
        <View className="flex-row justify-between items-center">
          <Text className="text-slate-400 font-bold uppercase tracking-widest text-xs">
            Player Select
          </Text>
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => setPlayStyle("single")}
              className={`px-3 py-1 rounded-lg ${playStyle === "single" ? "bg-blue-600" : "bg-slate-800"}`}
            >
              <Text className="text-white text-xs font-bold">Solos</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setPlayStyle("team")}
              className={`px-3 py-1 rounded-lg ${playStyle === "team" ? "bg-blue-600" : "bg-slate-800"}`}
            >
              <Text className="text-white text-xs font-bold">Teams</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  );
}
