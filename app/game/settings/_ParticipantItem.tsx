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
      {/* Use inline styles instead of className - required for drag library */}
      <View
        style={{
          marginHorizontal: 8,
          marginBottom: 8,
          borderRadius: 16,
          borderWidth: 2,
          borderColor: item.color,
          backgroundColor: isTeam ? "#1e293b" : "rgba(15, 23, 42, 0.6)",
          paddingHorizontal: 8,
          paddingVertical: 12,
          flexDirection: "row",
          alignItems: "center",
          shadowColor: isActive ? item.color : "transparent",
          shadowOpacity: isActive ? 0.4 : 0,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: isActive ? 8 : 0,
        }}
      >
        <TouchableOpacity
          onPressIn={drag}
          hitSlop={{ top: 12, bottom: 12, left: 4, right: 8 }}
          style={{ paddingHorizontal: 8 }}
          disabled={isEditing}
        >
          <LucideIcons.GripVertical
            color={isEditing ? "#1E293B" : "#475569"}
            size={20}
          />
        </TouchableOpacity>

        <View
          style={{
            backgroundColor: item.color,
            width: 10,
            height: 10,
            borderRadius: 5,
            marginRight: 12,
            flexShrink: 0,
          }}
        />

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
            style={{
              flex: 1,
              color: "#ffffff",
              fontWeight: isTeam ? "900" : "600",
              fontSize: isTeam ? 18 : 16,
            }}
          />
        ) : (
          <Text
            numberOfLines={1}
            style={{
              flex: 1,
              color: item.name ? (isTeam ? "#ffffff" : "#cbd5e1") : "#475569",
              fontWeight: isTeam ? "900" : "600",
              fontSize: isTeam ? 18 : 16,
              fontStyle: item.name ? "normal" : "italic",
            }}
          >
            {item.name || (isTeam ? "Unnamed team" : "Unnamed player")}
          </Text>
        )}

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 16,
            marginLeft: 8,
            flexShrink: 0,
          }}
        >
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
