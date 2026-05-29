import * as LucideIcons from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface DeckSelectorProps {
  decks: any[];
  selectedDeckIds: number[];
  isDecksExpanded: boolean;
  setIsDecksExpanded: (val: boolean) => void;
  toggleDeckSelection: (id: number) => void;
}

export default function DeckSelector({
  decks = [], // Default to empty array
  selectedDeckIds = [], // Default to empty array to prevent undefined .includes()
  isDecksExpanded,
  setIsDecksExpanded,
  toggleDeckSelection,
}: DeckSelectorProps) {
  return (
    <View className="bg-slate-900 border border-slate-800 rounded-3xl p-5 mb-4">
      <TouchableOpacity
        onPress={() => setIsDecksExpanded(!isDecksExpanded)}
        className="flex-row justify-between items-center"
      >
        <View>
          <Text className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-1">
            Decks in Play
          </Text>
          <Text className="text-white font-bold">
            {selectedDeckIds.length} Active Decks
          </Text>
        </View>
        <LucideIcons.ChevronDown
          color="#64748B"
          size={20}
          style={{
            transform: [{ rotate: isDecksExpanded ? "180deg" : "0deg" }],
          }}
        />
      </TouchableOpacity>

      {isDecksExpanded && (
        <View className="mt-4 flex-row flex-wrap gap-2">
          {decks.map((deck) => {
            const isSelected = selectedDeckIds.includes(deck.id);
            return (
              <TouchableOpacity
                key={deck.id}
                onPress={() => toggleDeckSelection(deck.id)}
                className={`px-3 py-2 rounded-xl border flex-row items-center gap-2 ${
                  isSelected
                    ? "bg-blue-600/30 border-blue-500 shadow-lg"
                    : "bg-slate-950 border-slate-800 opacity-50"
                }`}
              >
                {isSelected && <LucideIcons.Check color="#3B82F6" size={14} />}
                <Text
                  className={
                    isSelected
                      ? "text-white font-bold"
                      : "text-slate-400 font-medium"
                  }
                >
                  {deck.name}{" "}
                  <Text className="text-xs opacity-50">
                    ({deck.card_count})
                  </Text>
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}
