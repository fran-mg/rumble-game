import * as LucideIcons from "lucide-react-native";
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
      {turnHistory.map((item, index) => (
        <View
          key={index}
          className="py-3 border-b border-slate-900 flex-row justify-between items-center"
        >
          <View className="flex-row items-center flex-1 pr-4">
            {item.isEdited && (
              <LucideIcons.RefreshCw
                color="#64748B"
                size={12}
                className="mr-2"
              />
            )}
            <Text
              className={`text-xl font-bold ${
                item.result === "guessed"
                  ? "text-green-400"
                  : "text-orange-400 line-through opacity-70"
              }`}
            >
              {item.word}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => toggleHistoryResult(index)}
            className={`px-3 py-1 rounded-lg border ${
              item.result === "guessed"
                ? "bg-green-500/20 border-green-500"
                : "bg-orange-500/20 border-orange-500"
            }`}
          >
            <Text
              className={`font-black ${
                item.result === "guessed" ? "text-green-500" : "text-orange-500"
              }`}
            >
              {item.result === "guessed" ? "+1" : "0"}
            </Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}
