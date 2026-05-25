import * as LucideIcons from "lucide-react-native";
import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import {
  RenderItemParams,
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import { PlayStyle } from "../../../stores/useGameStore";
import { Participant } from "../../../utils/database";

export interface ParticipantItemProps extends RenderItemParams<Participant> {
  playStyle: PlayStyle;
  editingId: number | null;
  editName: string;
  onEditNameChange: (name: string) => void;
  onBeginEdit: (id: number, currentName: string) => void;
  onConfirmEdit: () => void;
  onCancelEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function ParticipantItem({
  item,
  drag,
  isActive,
  playStyle,
  editingId,
  editName,
  onEditNameChange,
  onBeginEdit,
  onConfirmEdit,
  onCancelEdit,
  onDelete,
}: ParticipantItemProps) {
  const isEditing = editingId === item.id;
  const isTeam = item.type === "team";

  return (
    <ScaleDecorator activeScale={1.03}>
      <View
        style={{
          borderColor: item.color,
          shadowColor: isActive ? item.color : "transparent",
          shadowOpacity: isActive ? 0.4 : 0,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: isActive ? 8 : 0,
        }}
        className={[
          "flex-row items-center rounded-2xl border-2 mx-2 mb-2 px-2 py-3",
          isTeam ? "bg-slate-800" : "bg-slate-900/80",
        ].join(" ")}
      >
        {/* ── Drag handle ───────────────────────────────────────────────── */}
        <TouchableOpacity
          onPressIn={drag}
          hitSlop={{ top: 12, bottom: 12, left: 4, right: 8 }}
          className="px-2"
          disabled={isEditing}
        >
          <LucideIcons.GripVertical
            color={isEditing ? "#1E293B" : "#475569"}
            size={20}
          />
        </TouchableOpacity>

        {/* ── Color indicator ───────────────────────────────────────────── */}
        <View
          style={{ backgroundColor: item.color }}
          className="w-2.5 h-2.5 rounded-full mr-3 shrink-0"
        />

        {/* ── Name display / edit input ─────────────────────────────────── */}
        {isEditing ? (
          <TextInput
            value={editName}
            onChangeText={onEditNameChange}
            autoFocus
            maxLength={30}
            returnKeyType="done"
            onSubmitEditing={onConfirmEdit}
            placeholder={isTeam ? "Team name…" : "Player name…"}
            placeholderTextColor="#475569"
            className={[
              "flex-1 text-white",
              isTeam ? "font-black text-lg" : "font-semibold text-base",
            ].join(" ")}
          />
        ) : (
          <Text
            numberOfLines={1}
            className={[
              "flex-1",
              isTeam
                ? "text-white font-black text-lg"
                : "text-slate-300 font-semibold text-base",
              !item.name ? "italic text-slate-600" : "",
            ].join(" ")}
          >
            {item.name || (isTeam ? "Unnamed team" : "Unnamed player")}
          </Text>
        )}

        {/* ── Action buttons ────────────────────────────────────────────── */}
        <View className="flex-row items-center gap-4 ml-2 shrink-0">
          {isEditing ? (
            <>
              <TouchableOpacity
                onPress={onConfirmEdit}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <LucideIcons.Check color="#10B981" size={20} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onCancelEdit(item.id)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <LucideIcons.X color="#EF4444" size={20} />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                onPress={() => onBeginEdit(item.id, item.name)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <LucideIcons.Edit3 color="#64748B" size={18} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onDelete(item.id)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <LucideIcons.Trash2 color="#EF4444" size={18} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </ScaleDecorator>
  );
}
