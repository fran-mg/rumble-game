import * as LucideIcons from "lucide-react-native";
import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
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
    <ScaleDecorator activeScale={1.02}>
      <View
        style={[
          styles.row,
          {
            // Solid backgrounds so nothing bleeds through during drag
            backgroundColor: isActive
              ? "#1e293b"
              : isEditing
                ? "#151f30"
                : "#0f1a28",
            borderColor: isActive
              ? item.color
              : isEditing
                ? `${item.color}88`
                : "rgba(255,255,255,0.07)",
            shadowColor: isActive ? item.color : "transparent",
            shadowOpacity: isActive ? 0.6 : 0,
          },
        ]}
      >
        {/* Drag handle */}
        <TouchableOpacity
          onPressIn={drag}
          hitSlop={{ top: 12, bottom: 12, left: 4, right: 8 }}
          style={styles.dragHandle}
          disabled={isEditing}
        >
          <LucideIcons.GripVertical
            color={isEditing ? "#1e293b" : "#334155"}
            size={18}
            strokeWidth={2}
          />
        </TouchableOpacity>

        {/* Color swatch */}
        <View style={[styles.colorSwatch, { backgroundColor: item.color }]} />

        {/* Name / input */}
        {isEditing ? (
          <TextInput
            value={editName}
            onChangeText={onEditNameChange}
            autoFocus
            maxLength={30}
            returnKeyType="done"
            onSubmitEditing={onConfirmEdit}
            placeholder={isTeam ? "Team name..." : "Player name..."}
            placeholderTextColor="#334155"
            style={[
              styles.nameInput,
              {
                fontSize: isTeam ? 17 : 15,
                fontWeight: isTeam ? "900" : "700",
              },
            ]}
          />
        ) : (
          <Text
            numberOfLines={1}
            style={[
              styles.nameText,
              {
                color: item.name ? (isTeam ? "#f1f5f9" : "#94a3b8") : "#334155",
                fontSize: isTeam ? 17 : 15,
                fontWeight: isTeam ? "900" : "700",
                fontStyle: item.name ? "normal" : "italic",
              },
            ]}
          >
            {item.name || (isTeam ? "Unnamed team" : "Unnamed player")}
          </Text>
        )}

        {/* Action buttons */}
        <View style={styles.actions}>
          {isEditing ? (
            <>
              <TouchableOpacity
                onPress={onConfirmEdit}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={[styles.actionBtn, styles.confirmBtn]}
              >
                <LucideIcons.Check
                  color="#10b981"
                  size={15}
                  strokeWidth={2.5}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onCancelEdit(item.id)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={[styles.actionBtn, styles.cancelBtn]}
              >
                <LucideIcons.X color="#ef4444" size={15} strokeWidth={2.5} />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                onPress={() => onBeginEdit(item.id, item.name)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={styles.actionBtn}
              >
                <LucideIcons.Pencil color="#475569" size={15} strokeWidth={2} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onDelete(item.id)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={styles.actionBtn}
              >
                <LucideIcons.Trash2 color="#475569" size={15} strokeWidth={2} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </ScaleDecorator>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 0,
    marginBottom: 6,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 13,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  dragHandle: {
    paddingRight: 10,
  },
  colorSwatch: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
    flexShrink: 0,
  },
  nameInput: {
    flex: 1,
    color: "#f1f5f9",
  },
  nameText: {
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginLeft: 8,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
  },
  confirmBtn: {
    backgroundColor: "rgba(16,185,129,0.1)",
    borderColor: "rgba(16,185,129,0.3)",
  },
  cancelBtn: {
    backgroundColor: "rgba(239,68,68,0.1)",
    borderColor: "rgba(239,68,68,0.3)",
  },
});
