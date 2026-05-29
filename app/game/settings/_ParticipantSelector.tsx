import * as LucideIcons from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import {
  NestableDraggableFlatList,
  RenderItemParams,
} from "react-native-draggable-flatlist";
import { PlayStyle } from "../../../stores/useGameStore";
import { useRosterStore } from "../../../stores/useRosterStore";
import { Participant } from "../../../utils/database";
import ParticipantItem from "./_ParticipantItem";

interface ParticipantSelectorProps {
  playStyle: PlayStyle;
  onPlayStyleChange: (style: PlayStyle) => void;
  onScrollRequest: (y: number) => void;
}

export default function ParticipantSelector({
  playStyle,
  onPlayStyleChange,
  onScrollRequest,
}: ParticipantSelectorProps) {
  const {
    participants,
    addParticipant,
    updateParticipant,
    deleteParticipant,
    reorderParticipants,
  } = useRosterStore();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [containerY, setContainerY] = useState(0);
  const isNewItemRef = useRef(false);

  const label = playStyle === "solo" ? "player" : "team";

  // ── Mode Switch effect ─────────────────────────────────────────────────────

  useEffect(() => {
    // Force clear any active edits if the user switches PlayStyle (Solo <-> Team)
    // while their keyboard is open and editing.
    setEditingId(null);
    setEditName("");
    isNewItemRef.current = false;
  }, [playStyle]);

  // ── Edit lifecycle ─────────────────────────────────────────────────────────

  const handleBeginEdit = (id: number, currentName: string) => {
    isNewItemRef.current = currentName === "";
    setEditingId(id);
    setEditName(currentName);

    const freshParticipants = useRosterStore.getState().participants;
    const index = freshParticipants.findIndex((p) => p.id === id);

    if (index !== -1) {
      const HEADER_HEIGHT = 64;
      const ITEM_HEIGHT = 64;
      const targetY = containerY + HEADER_HEIGHT + index * ITEM_HEIGHT - 120;
      onScrollRequest(Math.max(0, targetY));
    }
  };

  const handleConfirmEdit = () => {
    const trimmed = editName.trim();
    if (!trimmed) {
      Alert.alert("Name required", `Please give this ${label} a name.`);
      return;
    }
    updateParticipant(editingId!, trimmed);
    setEditingId(null);
    isNewItemRef.current = false;
  };

  const handleCancelEdit = (id: number) => {
    if (isNewItemRef.current) {
      deleteParticipant(id);
    }
    setEditingId(null);
    isNewItemRef.current = false;
  };

  const handleDelete = (id: number) => {
    if (participants.length <= 1) {
      Alert.alert("Can't remove", `You need at least one ${label}.`);
      return;
    }
    deleteParticipant(id);
  };

  const handleAdd = () => {
    addParticipant(playStyle);

    setTimeout(() => {
      const latest = useRosterStore.getState().participants.at(-1);
      if (latest) handleBeginEdit(latest.id, "");
    }, 50);
  };

  // ── Render Items ───────────────────────────────────────────────────────────

  const renderItem = (params: RenderItemParams<Participant>) => (
    <ParticipantItem
      {...params}
      playStyle={playStyle}
      editingId={editingId}
      editName={editName}
      onEditNameChange={setEditName}
      onBeginEdit={handleBeginEdit}
      onConfirmEdit={handleConfirmEdit}
      onCancelEdit={handleCancelEdit}
      onDelete={handleDelete}
    />
  );

  return (
    <View
      className="mb-6"
      onLayout={(e) => setContainerY(e.nativeEvent.layout.y)}
    >
      <ParticipantSelectorHeader
        playStyle={playStyle}
        onPlayStyleChange={onPlayStyleChange}
      />

      <View
        style={{
          backgroundColor: "#0f172a",
          paddingHorizontal: 16,
          paddingTop: 4,
        }}
      >
        <NestableDraggableFlatList
          data={participants}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          onDragEnd={({ data }) => reorderParticipants(data)}
          activationDistance={8}
        />
      </View>

      <ParticipantSelectorFooter
        playStyle={playStyle}
        onAdd={handleAdd}
        participantCount={participants.length}
      />
    </View>
  );
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
  return (
    <View className="bg-slate-900 border border-slate-800 rounded-t-3xl px-5 pt-5 pb-3">
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
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-slate-500 text-xs font-bold uppercase tracking-widest">
          {participantCount} {participantCount === 1 ? label : `${label}s`}
        </Text>
        <View className="flex-row items-center gap-1.5">
          <LucideIcons.GripVertical color="#334155" size={13} />
          <Text className="text-slate-600 text-xs">drag to reorder</Text>
        </View>
      </View>
      <View>
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
