import * as LucideIcons from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { PlayStyle } from "../../../stores/useGameStore";

export default function ParticipantSelector() {
  return null;
}

// ─── HEADER (includes play style toggle) ──────────────────────────────────────

interface ParticipantSelectorHeaderProps {
  playStyle: PlayStyle;
  onPlayStyleChange: (style: PlayStyle) => void;
}

export function ParticipantSelectorHeader({
  playStyle,
  onPlayStyleChange,
}: ParticipantSelectorHeaderProps) {
  const label = playStyle === "solo" ? "Player" : "Team";

  return (
    <View className="bg-slate-900 border border-slate-800 rounded-t-3xl px-5 pt-5 pb-3">
      {/* Play style toggle (moved from MatchSetupHeader) */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-slate-400 font-bold uppercase tracking-widest text-xs">
          Participant Select
        </Text>
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => onPlayStyleChange("solo")}
            className={`px-3 py-1.5 rounded-lg ${
              playStyle === "solo" ? "bg-blue-600" : "bg-slate-800"
            }`}
          >
            <Text className="text-white text-xs font-bold">Solo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onPlayStyleChange("team")}
            className={`px-3 py-1.5 rounded-lg ${
              playStyle === "team" ? "bg-blue-600" : "bg-slate-800"
            }`}
          >
            <Text className="text-white text-xs font-bold">Teams</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ─── FOOTER (add button) ──────────────────────────────────────────────────────

interface ParticipantSelectorFooterProps {
  playStyle: PlayStyle;
  onAdd: () => void;
  participantCount: number;
}

export function ParticipantSelectorFooter({
  playStyle,
  onAdd,
  participantCount,
}: ParticipantSelectorFooterProps) {
  const label = playStyle === "solo" ? "Player" : "Team";

  return (
    <View className="bg-slate-900 border border-slate-800 border-t-0 rounded-b-3xl px-4 pb-5 pt-1 mb-0">
      {/* Participant count and drag hint */}
      <View className="flex-row items-center justify-between">
        <Text className="text-slate-500 text-xs font-bold uppercase tracking-widest">
          {participantCount} {participantCount === 1 ? label : `${label}s`}
        </Text>
        <View className="flex-row items-center gap-1.5">
          <LucideIcons.GripVertical color="#334155" size={13} />
          <Text className="text-slate-600 text-xs">drag to reorder</Text>
        </View>
      </View>
      <View className="mb-2">
        <TouchableOpacity
          onPress={onAdd}
          activeOpacity={0.7}
          className="flex-row items-center justify-center gap-2 border border-dashed border-slate-700 rounded-xl py-3"
        >
          <LucideIcons.Plus color="#64748B" size={15} />
          <Text className="text-slate-400 font-bold text-sm">Add {label}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
