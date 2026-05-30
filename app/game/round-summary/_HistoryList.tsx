import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

interface HistoryListProps {
  turnHistory: any[];
  toggleHistoryResult: (index: number) => void;
}

export default function HistoryList({
  turnHistory,
  toggleHistoryResult,
}: HistoryListProps) {
  return (
    <ScrollView className="flex-1 px-6 py-4">
      {turnHistory.map((item, index) => {
        const isEdited = item.isEdited;
        const currentResult = item.result;

        // originalResult represents the un-edited default state of the card
        const originalResult = isEdited
          ? currentResult === "guessed"
            ? "passed"
            : "guessed"
          : currentResult;

        return (
          <View
            key={index}
            className="py-3 border-b border-slate-900 flex-row justify-between items-center"
          >
            <View className="flex-row items-center flex-1 pr-4">
              <Text
                className={`text-xl font-bold ${
                  currentResult === "guessed"
                    ? "text-green-400"
                    : "text-orange-400 line-through opacity-70"
                }`}
              >
                {item.word}
              </Text>
            </View>

            <View className="relative">
              {/* The new adjusted score displayed outside the box */}
              {isEdited && (
                <View className="absolute -top-2.5 -left-2.5 bg-slate-950 px-1 rounded-sm z-10">
                  <Text
                    className={`text-[10px] font-black ${
                      currentResult === "guessed"
                        ? "text-green-500"
                        : "text-orange-500"
                    }`}
                  >
                    {currentResult === "guessed" ? "+1" : "0"}
                  </Text>
                </View>
              )}

              {/* The score button (box) */}
              <TouchableOpacity
                onPress={() => toggleHistoryResult(index)}
                className={`px-3 py-1 rounded-lg border ${
                  originalResult === "guessed"
                    ? isEdited
                      ? "bg-green-500/10 border-green-500/30" // Faded Green
                      : "bg-green-500/20 border-green-500" // Normal Green
                    : isEdited
                      ? "bg-orange-500/10 border-orange-500/30" // Faded Orange
                      : "bg-orange-500/20 border-orange-500" // Normal Orange
                }`}
              >
                <Text
                  className={`font-black ${
                    originalResult === "guessed"
                      ? isEdited
                        ? "text-green-500/40 line-through" // Crossed out Green
                        : "text-green-500"
                      : isEdited
                        ? "text-orange-500/40 line-through" // Crossed out Orange
                        : "text-orange-500"
                  }`}
                >
                  {originalResult === "guessed" ? "+1" : "0"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}
